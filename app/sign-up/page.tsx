import type { Metadata } from "next";
import Link from "next/link";
import { signUpAction } from "@/app/auth/actions";
import { AuthShell, LegalAgreement, StatefulForm, inputClass, labelClass } from "@/app/components/auth/auth-ui";
import { GoogleButton } from "@/app/components/auth/google-button";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { sanitizeReturnPath } from "@/lib/auth";

export const metadata: Metadata = { title: "Create account", robots: { index: false, follow: false } };

export default async function SignUpPage({ searchParams }: PageProps<"/sign-up">) {
  const params = await searchParams;
  const next = sanitizeReturnPath(typeof params.next === "string" ? params.next : null);
  return <AuthShell eyebrow="Join MishBaby" title="Create your account" intro="One secure account, ready for the personalized features we add next.">
    {!isSupabaseConfigured ? <p className="rounded-xl bg-[#fff7df] p-4 text-sm text-[#735a16]">Accounts are being configured. Please check back soon.</p> : <>
      <GoogleButton next={next} />
      <div className="my-6 flex items-center gap-3 text-xs text-[#063f5b]/45"><span className="h-px flex-1 bg-[#063f5b]/10" />or use email<span className="h-px flex-1 bg-[#063f5b]/10" /></div>
      <StatefulForm action={signUpAction} submitText="Create account" pendingText="Creating account…">
        <input type="hidden" name="next" value={next} />
        <label className={labelClass}>Email<input className={inputClass} type="email" name="email" autoComplete="email" required /></label>
        <label className={labelClass}>Password <span className="font-normal text-[#063f5b]/50">(8+ characters)</span><input className={inputClass} type="password" name="password" minLength={8} autoComplete="new-password" required /></label>
        <label className={labelClass}>Confirm password<input className={inputClass} type="password" name="confirmPassword" minLength={8} autoComplete="new-password" required /></label>
      </StatefulForm>
      <div className="mt-5"><LegalAgreement /></div>
      <p className="mt-6 text-center text-sm text-[#063f5b]/65">Already registered? <Link className="font-bold text-[#007fa5]" href={`/sign-in?next=${encodeURIComponent(next)}`}>Sign in</Link></p>
    </>}
  </AuthShell>;
}
