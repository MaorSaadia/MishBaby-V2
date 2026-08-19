import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { updatePasswordAction } from "@/app/auth/actions";
import { AuthShell, StatefulForm, inputClass, labelClass } from "@/app/components/auth/auth-ui";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false, follow: false } };

export default async function UpdatePasswordPage() {
  if (isSupabaseConfigured && !(await getCurrentUser())) redirect("/forgot-password");
  return <AuthShell eyebrow="Account recovery" title="Choose a new password" intro="Use at least eight characters and keep it unique to MishBaby.">
    {!isSupabaseConfigured ? <p className="rounded-xl bg-[#fff7df] p-4 text-sm text-[#735a16]">Accounts are being configured. Please check back soon.</p> : <StatefulForm action={updatePasswordAction} submitText="Update password" pendingText="Updating…"><label className={labelClass}>New password<input className={inputClass} type="password" name="password" minLength={8} autoComplete="new-password" required /></label><label className={labelClass}>Confirm new password<input className={inputClass} type="password" name="confirmPassword" minLength={8} autoComplete="new-password" required /></label></StatefulForm>}
  </AuthShell>;
}
