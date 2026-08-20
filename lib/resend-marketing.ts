import "server-only";

import { Resend } from "resend";
import type { MarketingConsentStatus } from "./marketing-consent";
import { createSupabaseAdminClient } from "./supabase/admin";

function getResendMarketingConfig() {
  const apiKey = process.env.RESEND_MARKETING_API_KEY?.trim();
  const segmentId = process.env.RESEND_MARKETING_SEGMENT_ID?.trim();
  if (!apiKey || !segmentId) return null;
  return { apiKey, segmentId };
}

export function isResendMarketingSyncEnabled() {
  return getResendMarketingConfig() !== null;
}

export function getResendWebhookClient() {
  const apiKey = process.env.RESEND_MARKETING_API_KEY?.trim();
  return apiKey ? new Resend(apiKey) : null;
}

export async function deleteResendMarketingContact(email: string) {
  const apiKey = process.env.RESEND_MARKETING_API_KEY?.trim();
  if (!apiKey) return { ok: true };

  const normalizedEmail = email.trim().toLowerCase();
  const resend = new Resend(apiKey);
  const { data: contact, error: lookupError } = await resend.contacts.get({ email: normalizedEmail });
  if (lookupError && !contact) return { ok: false };
  if (!contact) return { ok: true };

  const { error } = await resend.contacts.remove({ email: normalizedEmail });
  return { ok: !error };
}

export async function getMarketingContactSync(userId: string) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("marketing_contact_sync")
    .select("sync_status, desired_status, synced_at")
    .eq("user_id", userId)
    .maybeSingle();
  return {
    status: data?.sync_status as "pending" | "synced" | "failed" | undefined,
    desiredStatus: data?.desired_status as MarketingConsentStatus | undefined,
    syncedAt: data?.synced_at as string | undefined,
    error: Boolean(error),
  };
}

export async function syncResendMarketingContact(userId: string, email: string, desiredStatus: MarketingConsentStatus) {
  const normalizedEmail = email.trim().toLowerCase();
  const config = getResendMarketingConfig();
  if (!config) return { ok: false, reason: "not_configured" as const };

  const admin = createSupabaseAdminClient();
  const { error: queueError } = await admin.from("marketing_contact_sync").upsert({
    user_id: userId,
    email: normalizedEmail,
    desired_status: desiredStatus,
    sync_status: "pending",
    last_error_code: null,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" });
  if (queueError) return { ok: false, reason: "queue_failed" as const };

  const resend = new Resend(config.apiKey);
  let syncFailed = false;
  const { data: contact } = await resend.contacts.get({ email: normalizedEmail });

  if (desiredStatus === "unsubscribed") {
    if (contact) {
      const { error } = await resend.contacts.update({ email: normalizedEmail, unsubscribed: true });
      syncFailed = Boolean(error);
    }
  } else if (contact) {
    const { error: updateError } = await resend.contacts.update({ email: normalizedEmail, unsubscribed: false });
    const { data: segments, error: segmentsError } = await resend.contacts.segments.list({ email: normalizedEmail });
    const alreadyInSegment = segments?.data.some((segment) => segment.id === config.segmentId);
    const addResult = !segmentsError && !alreadyInSegment
      ? await resend.contacts.segments.add({ email: normalizedEmail, segmentId: config.segmentId })
      : { error: segmentsError };
    syncFailed = Boolean(updateError || segmentsError || addResult.error);
  } else {
    const { error } = await resend.contacts.create({
      email: normalizedEmail,
      unsubscribed: false,
      segments: [{ id: config.segmentId }],
    });
    syncFailed = Boolean(error);
  }

  if (syncFailed) {
    await markSyncFailed(admin, userId, "resend_api_failed");
    return { ok: false, reason: "resend_failed" as const };
  }

  const now = new Date().toISOString();
  await admin.from("marketing_contact_sync").update({
    sync_status: "synced",
    synced_at: now,
    last_attempt_at: now,
    last_error_code: null,
    updated_at: now,
  }).eq("user_id", userId);
  return { ok: true };
}

async function markSyncFailed(admin: ReturnType<typeof createSupabaseAdminClient>, userId: string, code: string) {
  const { data } = await admin.from("marketing_contact_sync").select("attempts").eq("user_id", userId).maybeSingle();
  const now = new Date().toISOString();
  await admin.from("marketing_contact_sync").update({
    sync_status: "failed",
    attempts: (data?.attempts ?? 0) + 1,
    last_error_code: code,
    last_attempt_at: now,
    updated_at: now,
  }).eq("user_id", userId);
}
