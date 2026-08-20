"use server";

import { revalidatePath } from "next/cache";
import type { AuthActionState } from "@/app/auth/actions";
import { getCurrentUser } from "@/lib/auth";
import { getMarketingPreference, marketingConsentSource, recordMarketingConsentEvent, type MarketingConsentStatus } from "@/lib/marketing-consent";
import { syncResendMarketingContact } from "@/lib/resend-marketing";

export type MarketingConsentActionState = AuthActionState & { subscribed?: boolean };

export async function updateMarketingConsentAction(_state: MarketingConsentActionState, formData: FormData): Promise<MarketingConsentActionState> {
  const user = await getCurrentUser();
  if (!user?.email) return { status: "error", message: "Your session has expired. Sign in again to update email preferences." };

  const intent = formData.get("intent");
  if (intent !== "subscribe" && intent !== "unsubscribe") return { status: "error", message: "Choose a valid email preference." };
  if (intent === "subscribe" && formData.get("consent") !== "yes") return { status: "error", message: "Confirm the optional email consent before subscribing." };

  const nextStatus: MarketingConsentStatus = intent === "subscribe" ? "subscribed" : "unsubscribed";
  const currentPreference = await getMarketingPreference(user.id);
  if (currentPreference.error) return { status: "error", message: "Email preferences are temporarily unavailable. Please try again." };
  if (currentPreference.status === nextStatus) {
    const sync = await syncResendMarketingContact(user.id, user.email, nextStatus);
    revalidatePath("/account");
    return { status: "success", message: sync.ok ? (nextStatus === "subscribed" ? "You are already subscribed and synced." : "You are already unsubscribed and synced.") : "Your preference is saved, but Resend synchronization is still pending.", subscribed: nextStatus === "subscribed" };
  }

  const result = await recordMarketingConsentEvent(user.id, nextStatus, marketingConsentSource);
  if (!result.ok) return { status: "error", message: "We couldn’t update your email preferences. Please try again." };

  const sync = await syncResendMarketingContact(user.id, user.email, nextStatus);
  revalidatePath("/account");
  const savedMessage = nextStatus === "subscribed" ? "You’re subscribed to optional MishBaby updates." : "You’ve been unsubscribed from optional MishBaby updates.";
  return { status: "success", message: sync.ok ? savedMessage : `${savedMessage} Resend synchronization is pending.`, subscribed: nextStatus === "subscribed" };
}

export type MarketingSyncActionState = AuthActionState & { synced?: boolean };

export async function retryMarketingContactSyncAction(_state: MarketingSyncActionState): Promise<MarketingSyncActionState> {
  void _state;
  const user = await getCurrentUser();
  if (!user?.email) return { status: "error", message: "Your session has expired. Sign in again to retry synchronization." };
  const preference = await getMarketingPreference(user.id);
  if (preference.error) return { status: "error", message: "Email preferences are temporarily unavailable." };
  const result = await syncResendMarketingContact(user.id, user.email, preference.status);
  revalidatePath("/account");
  return result.ok ? { status: "success", message: "Your Resend contact is synchronized.", synced: true } : { status: "error", message: "Resend synchronization is still unavailable. Please try again later.", synced: false };
}
