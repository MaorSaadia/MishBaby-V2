"use client";

import { useActionState } from "react";
import { retryMarketingContactSyncAction, updateMarketingConsentAction } from "@/app/account/marketing-actions";
import { ActionMessage, SubmitButton } from "./auth-ui";

export function MarketingPreferencesForm({ subscribed, occurredAt, syncEnabled, syncStatus }: { subscribed: boolean; occurredAt?: string; syncEnabled: boolean; syncStatus?: "pending" | "synced" | "failed" }) {
  const [state, action] = useActionState(updateMarketingConsentAction, {});
  const recordedDate = occurredAt ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(occurredAt)) : undefined;
  const currentSubscription = state.status === "success" && typeof state.subscribed === "boolean" ? state.subscribed : subscribed;
  const needsSync = syncEnabled && (syncStatus === "failed" || syncStatus === "pending" || (currentSubscription && syncStatus !== "synced"));

  return <div className="mt-5"><ActionMessage state={state} />
    {needsSync && <MarketingSyncRetry />}
    {currentSubscription ? <form action={action}>
      <input type="hidden" name="intent" value="unsubscribe" />
      <p className="text-sm leading-6 text-[#063f5b]/65">You’re subscribed to occasional MishBaby product discoveries, guides, and website updates.{recordedDate ? ` Preference recorded ${recordedDate}.` : ""}</p>
      <div className="mt-5 w-full sm:max-w-xs [&_button]:border [&_button]:border-[#063f5b]/15 [&_button]:bg-white [&_button]:text-[#063f5b] [&_button:hover]:bg-[#e8f8fc]"><SubmitButton pendingText="Unsubscribing…">Unsubscribe</SubmitButton></div>
    </form> : <form action={action}>
      <input type="hidden" name="intent" value="subscribe" />
      <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-[#f1fbfe] p-4 text-sm leading-6 text-[#063f5b]/70"><input type="checkbox" name="consent" value="yes" required className="mt-0.5 size-5 shrink-0 accent-[#009dcc]" /><span>Yes, I want to receive occasional MishBaby product discoveries, helpful guides, and website updates by email. I understand this is optional and I can unsubscribe anytime.</span></label>
      <div className="mt-5 w-full sm:max-w-xs"><SubmitButton pendingText="Subscribing…">Subscribe to updates</SubmitButton></div>
    </form>}
  </div>;
}

function MarketingSyncRetry() {
  const [state, action] = useActionState(retryMarketingContactSyncAction, {});
  if (state.synced) return <ActionMessage state={state} />;
  return <div className="mb-5 rounded-2xl bg-[#fff7df] p-4 text-sm leading-6 text-[#735a16]"><p>Your preference is saved, but our email service still needs synchronization.</p><form action={action} className="mt-3"><button type="submit" className="font-extrabold underline">Retry synchronization</button></form>{state.message && <p role="status" className="mt-2">{state.message}</p>}</div>;
}
