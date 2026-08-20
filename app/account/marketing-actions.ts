"use server";

import { revalidatePath } from "next/cache";
import type { AuthActionState } from "@/app/auth/actions";
import { getCurrentUser } from "@/lib/auth";
import { getMarketingPreference, marketingConsentPolicyVersion, marketingConsentSource, type MarketingConsentStatus } from "@/lib/marketing-consent";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function updateMarketingConsentAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const user = await getCurrentUser();
  if (!user) return { status: "error", message: "Your session has expired. Sign in again to update email preferences." };

  const intent = formData.get("intent");
  if (intent !== "subscribe" && intent !== "unsubscribe") return { status: "error", message: "Choose a valid email preference." };
  if (intent === "subscribe" && formData.get("consent") !== "yes") return { status: "error", message: "Confirm the optional email consent before subscribing." };

  const nextStatus: MarketingConsentStatus = intent === "subscribe" ? "subscribed" : "unsubscribed";
  const currentPreference = await getMarketingPreference(user.id);
  if (currentPreference.error) return { status: "error", message: "Email preferences are temporarily unavailable. Please try again." };
  if (currentPreference.status === nextStatus) return { status: "success", message: nextStatus === "subscribed" ? "You are already subscribed." : "You are already unsubscribed." };

  try {
    const admin = createSupabaseAdminClient();
    const { error } = await admin.from("marketing_consent_events").insert({
      user_id: user.id,
      status: nextStatus,
      source: marketingConsentSource,
      policy_version: marketingConsentPolicyVersion,
    });
    if (error) return { status: "error", message: "We couldn’t update your email preferences. Please try again." };
  } catch {
    return { status: "error", message: "We couldn’t update your email preferences. Please try again." };
  }

  revalidatePath("/account");
  return { status: "success", message: nextStatus === "subscribed" ? "You’re subscribed to optional MishBaby updates." : "You’ve been unsubscribed from optional MishBaby updates." };
}
