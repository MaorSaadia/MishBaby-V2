import type { Metadata } from "next";
import Link from "next/link";
import { signInAction } from "@/app/auth/actions";
import { AuthShell, StatefulForm, inputClass, labelClass } from "@/app/components/auth/auth-ui";
import { GoogleButton } from "@/app/components/auth/google-button";
import { sanitizeReturnPath } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };

const errors: Record<string, string> = {
  oauth: "Google sign-in could not be completed. Please try again.",
  confirmation: "That confirmation or recovery link is invalid or has expired.",
  unavailable: "Accounts are temporarily unavailable.",
};

export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  const params = await searchParams;
  const next = sanitizeReturnPath(typeof params.next === "string" ? params.next : null);
  const error = typeof params.error === "string" ? errors[params.error] : undefined;
  return <AuthShell eyebrow="Welcome back" title="Sign in to MishBaby" intro="Access your MishBaby account securely.">
    {!isSupabaseConfigured ? <p className="rounded-xl bg-[#fff7df] p-4 text-sm text-[#735a16]">Accounts are being configured. Please check back soon.</p> : <>
      {error && <p role="alert" className="mb-5 rounded-xl bg-[#fff0f1] px-4 py-3 text-sm text-[#8a2430]">{error}</p>}
      <GoogleButton next={next} />
      <div className="my-6 flex items-center gap-3 text-xs text-[#063f5b]/45"><span className="h-px flex-1 bg-[#063f5b]/10" />or use email<span className="h-px flex-1 bg-[#063f5b]/10" /></div>
      <StatefulForm action={signInAction} submitText="Sign in" pendingText="Signing in…">
        <input type="hidden" name="next" value={next} />
        <label className={labelClass}>Email<input className={inputClass} type="email" name="email" autoComplete="email" required /></label>
        <label className={labelClass}>Password<input className={inputClass} type="password" name="password" autoComplete="current-password" required /></label>
      </StatefulForm>
      <div className="mt-6 grid gap-2 text-center text-sm text-[#063f5b]/65"><Link className="font-bold text-[#007fa5]" href="/forgot-password">Forgot your password?</Link><p>New here? <Link className="font-bold text-[#007fa5]" href="/sign-up">Create an account</Link></p></div>
    </>}
  </AuthShell>;
}
