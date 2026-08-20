"use client";

import { useActionState } from "react";
import { updateMarketingConsentAction } from "@/app/account/marketing-actions";
import { ActionMessage, SubmitButton } from "./auth-ui";

export function MarketingPreferencesForm({ subscribed, occurredAt }: { subscribed: boolean; occurredAt?: string }) {
  const [state, action] = useActionState(updateMarketingConsentAction, {});
  const recordedDate = occurredAt ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(occurredAt)) : undefined;
  const currentSubscription = state.status === "success" && typeof state.subscribed === "boolean" ? state.subscribed : subscribed;

  return <div className="mt-5"><ActionMessage state={state} />
    {currentSubscription ? <form action={action}>
      <input type="hidden" name="intent" value="unsubscribe" />
      <p className="text-sm leading-6 text-[#063f5b]/65">You’re subscribed to occasional MishBaby product discoveries, guides, and website updates.{recordedDate ? ` Preference recorded ${recordedDate}.` : ""}</p>
      <div className="mt-5 max-w-xs [&_button]:border [&_button]:border-[#063f5b]/15 [&_button]:bg-white [&_button]:text-[#063f5b] [&_button:hover]:bg-[#e8f8fc]"><SubmitButton pendingText="Unsubscribing…">Unsubscribe</SubmitButton></div>
    </form> : <form action={action}>
      <input type="hidden" name="intent" value="subscribe" />
      <label className="flex items-start gap-3 rounded-2xl bg-[#f1fbfe] p-4 text-sm leading-6 text-[#063f5b]/70"><input type="checkbox" name="consent" value="yes" required className="mt-1 size-4 shrink-0 accent-[#009dcc]" /><span>Yes, I want to receive occasional MishBaby product discoveries, helpful guides, and website updates by email. I understand this is optional and I can unsubscribe anytime.</span></label>
      <div className="mt-5 max-w-xs"><SubmitButton pendingText="Subscribing…">Subscribe to updates</SubmitButton></div>
    </form>}
  </div>;
}
