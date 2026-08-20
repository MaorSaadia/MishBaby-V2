import { NextRequest, NextResponse } from "next/server";
import { recordMarketingConsentEvent } from "@/lib/marketing-consent";
import { getResendWebhookClient } from "@/lib/resend-marketing";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type ContactWebhook = {
  type: "contact.updated" | "contact.deleted";
  data: { email?: string; unsubscribed?: boolean };
};

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET?.trim();
  const resend = getResendWebhookClient();
  if (!webhookSecret || !resend) return new NextResponse("Webhook is not configured", { status: 503 });

  const webhookId = request.headers.get("svix-id");
  const timestamp = request.headers.get("svix-timestamp");
  const signature = request.headers.get("svix-signature");
  if (!webhookId || !timestamp || !signature) return new NextResponse("Invalid webhook", { status: 400 });

  let event: ContactWebhook;
  try {
    const payload = await request.text();
    event = resend.webhooks.verify({
      payload,
      headers: { id: webhookId, timestamp, signature },
      webhookSecret,
    }) as ContactWebhook;
  } catch {
    return new NextResponse("Invalid webhook", { status: 400 });
  }

  if (event.type !== "contact.updated" && event.type !== "contact.deleted") return NextResponse.json({ received: true });
  if (event.type === "contact.updated" && event.data.unsubscribed !== true) return NextResponse.json({ received: true });
  const email = event.data.email?.trim().toLowerCase();
  if (!email) return new NextResponse("Missing contact email", { status: 400 });

  const admin = createSupabaseAdminClient();
  const { data: processed } = await admin.from("resend_webhook_events").select("id").eq("id", webhookId).maybeSingle();
  if (processed) return NextResponse.json({ received: true, duplicate: true });

  const { data: contactSync, error: contactError } = await admin
    .from("marketing_contact_sync")
    .select("user_id")
    .ilike("email", email)
    .maybeSingle();
  if (contactError) return new NextResponse("Contact lookup failed", { status: 500 });
  if (!contactSync?.user_id) return NextResponse.json({ received: true, matched: false });

  const consent = await recordMarketingConsentEvent(contactSync.user_id, "unsubscribed", "resend_webhook");
  if (!consent.ok) return new NextResponse("Consent update failed", { status: 500 });

  const now = new Date().toISOString();
  const { error: syncError } = await admin.from("marketing_contact_sync").update({
    desired_status: "unsubscribed",
    sync_status: "synced",
    synced_at: now,
    last_attempt_at: now,
    last_error_code: null,
    updated_at: now,
  }).eq("user_id", contactSync.user_id);
  if (syncError) return new NextResponse("Sync update failed", { status: 500 });

  const { error: eventError } = await admin.from("resend_webhook_events").insert({
    id: webhookId,
    event_type: event.type,
  });
  if (eventError && eventError.code !== "23505") return new NextResponse("Webhook receipt failed", { status: 500 });
  return NextResponse.json({ received: true });
}
