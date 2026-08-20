import "server-only";

import { createServerSupabaseClient } from "./supabase/server";

export const marketingConsentPolicyVersion = "2026-08-20";
export const marketingConsentSource = "account_preferences";

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
