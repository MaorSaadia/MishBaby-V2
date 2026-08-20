import "server-only";

import { createServerSupabaseClient } from "./supabase/server";
import { createSupabaseAdminClient } from "./supabase/admin";

export const marketingConsentPolicyVersion = "2026-08-20";
export const marketingConsentSource = "account_preferences";
export const marketingSignupConsentSource = "signup";
export const marketingSignupCookieName = "mishbaby_marketing_signup";

export type MarketingConsentStatus = "subscribed" | "unsubscribed";

export async function getMarketingPreference(userId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("marketing_consent_events")
    .select("status, occurred_at, policy_version")
    .eq("user_id", userId)
    .order("occurred_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    status: (data?.status as MarketingConsentStatus | undefined) ?? "unsubscribed",
    occurredAt: data?.occurred_at as string | undefined,
    policyVersion: data?.policy_version as string | undefined,
    error: Boolean(error),
  };
}

export async function recordMarketingConsentEvent(userId: string, status: MarketingConsentStatus, source: string) {
  try {
    const admin = createSupabaseAdminClient();
    const { data: latest } = await admin
      .from("marketing_consent_events")
      .select("status")
      .eq("user_id", userId)
      .order("occurred_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (latest?.status === status) return { ok: true, changed: false };

    const { error } = await admin.from("marketing_consent_events").insert({
      user_id: userId,
      status,
      source,
      policy_version: marketingConsentPolicyVersion,
    });
    return { ok: !error, changed: !error };
  } catch {
    return { ok: false, changed: false };
  }
}
