import type { Metadata } from "next";
import Link from "next/link";
import { forgotPasswordAction } from "@/app/auth/actions";
import { AuthShell, StatefulForm, inputClass, labelClass } from "@/app/components/auth/auth-ui";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Reset password", robots: { index: false, follow: false } };

export default function ForgotPasswordPage() {
  return <AuthShell eyebrow="Account recovery" title="Reset your password" intro="Enter your email and we’ll send a secure recovery link if an account matches it.">
    {!isSupabaseConfigured ? <p className="rounded-xl bg-[#fff7df] p-4 text-sm text-[#735a16]">Accounts are being configured. Please check back soon.</p> : <StatefulForm action={forgotPasswordAction} submitText="Send recovery email" pendingText="Sending…"><label className={labelClass}>Email<input className={inputClass} type="email" name="email" autoComplete="email" required /></label></StatefulForm>}
    <p className="mt-6 text-center text-sm"><Link className="font-bold text-[#007fa5]" href="/sign-in">Back to sign in</Link></p>
  </AuthShell>;
}
