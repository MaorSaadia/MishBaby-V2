"use client";

import { useActionState } from "react";
import { deleteAccountAction } from "@/app/auth/actions";
import { ActionMessage, SubmitButton, inputClass, labelClass } from "./auth-ui";

export function DeleteAccountForm({ email }: { email: string }) {
  const [state, action] = useActionState(deleteAccountAction, {});
  return <form action={action} className="mt-5"><ActionMessage state={state} /><label className={labelClass}>Type <strong>{email}</strong> to confirm<input className={inputClass} type="email" name="confirmationEmail" autoComplete="off" required /></label><div className="mt-5 [&_button]:bg-[#9f2734] [&_button:hover]:bg-[#7f1f2a]"><SubmitButton pendingText="Deleting account…">Permanently delete account</SubmitButton></div></form>;
}
