import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const applyChanges = process.argv.includes("--apply");
const requiredVariables = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SECRET_KEY",
  "RESEND_MARKETING_API_KEY",
  "RESEND_MARKETING_SEGMENT_ID",
];
const missingVariables = requiredVariables.filter((name) => !process.env[name]?.trim());

if (missingVariables.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVariables.join(", ")}`);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);
const resend = new Resend(process.env.RESEND_MARKETING_API_KEY);
const segmentId = process.env.RESEND_MARKETING_SEGMENT_ID;

async function loadCurrentPreferences() {
  const preferences = new Map();
  const pageSize = 1000;

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("marketing_consent_events")
      .select("user_id, status, occurred_at, id")
      .order("occurred_at", { ascending: true })
      .order("id", { ascending: true })
      .range(from, from + pageSize - 1);
    if (error) throw error;
    for (const event of data) preferences.set(event.user_id, event.status);
    if (data.length < pageSize) break;
  }

  return preferences;
}

async function loadUsersById() {
  const users = new Map();
  const perPage = 1000;

  for (let page = 1; ; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    for (const user of data.users) users.set(user.id, user);
    if (data.users.length < perPage) break;
  }

  return users;
}

async function synchronizeContact(userId, email) {
  const normalizedEmail = email.trim().toLowerCase();
  const { data: contact } = await resend.contacts.get({ email: normalizedEmail });

  if (contact) {
    const { error: updateError } = await resend.contacts.update({ email: normalizedEmail, unsubscribed: false });
    if (updateError) throw updateError;
    const { data: segments, error: segmentsError } = await resend.contacts.segments.list({ email: normalizedEmail });
    if (segmentsError) throw segmentsError;
    if (!segments.data.some((segment) => segment.id === segmentId)) {
      const { error } = await resend.contacts.segments.add({ email: normalizedEmail, segmentId });
      if (error) throw error;
    }
  } else {
    const { error } = await resend.contacts.create({
      email: normalizedEmail,
      unsubscribed: false,
      segments: [{ id: segmentId }],
    });
    if (error) throw error;
  }

  const now = new Date().toISOString();
  const { error: syncError } = await supabase.from("marketing_contact_sync").upsert({
    user_id: userId,
    email: normalizedEmail,
    desired_status: "subscribed",
    sync_status: "synced",
    synced_at: now,
    last_attempt_at: now,
    last_error_code: null,
    updated_at: now,
  }, { onConflict: "user_id" });
  if (syncError) throw syncError;
}

const preferences = await loadCurrentPreferences();
const users = await loadUsersById();
const subscribers = [...preferences.entries()].flatMap(([userId, status]) => {
  const email = users.get(userId)?.email;
  return status === "subscribed" && email ? [{ userId, email }] : [];
});

console.log(`Found ${subscribers.length} currently subscribed contact(s).`);

if (!applyChanges) {
  console.log("Dry run only. Run `npm run sync:marketing-contacts -- --apply` when Resend is configured and you are ready to synchronize them.");
  process.exit(0);
}

let synchronized = 0;
for (const subscriber of subscribers) {
  await synchronizeContact(subscriber.userId, subscriber.email);
  synchronized += 1;
  console.log(`Synchronized ${synchronized}/${subscribers.length}: ${subscriber.email}`);
}

console.log(`Finished synchronizing ${synchronized} contact(s). No email was sent.`);
