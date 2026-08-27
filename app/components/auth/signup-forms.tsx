"use client";

import Link from "next/link";
import { useState } from "react";
import { signUpAction } from "@/app/auth/actions";
import { GoogleButton } from "./google-button";
import { LegalAgreement, StatefulForm, inputClass, labelClass } from "./auth-ui";

export function SignupForms({ next }: { next: string }) {
  const [marketingConsent, setMarketingConsent] = useState(false);

  return <>
    <label className="mb-5 flex cursor-pointer items-start gap-3 rounded-2xl bg-[#f1fbfe] p-4 text-sm leading-6 text-[#063f5b]/70"><input type="checkbox" checked={marketingConsent} onChange={(event) => setMarketingConsent(event.target.checked)} className="mt-0.5 size-5 shrink-0 accent-[#009dcc]" /><span>Yes, send me occasional MishBaby product discoveries, helpful guides, and website updates by email. This is optional, and I can unsubscribe anytime from my Account page.</span></label>
    <GoogleButton next={next} marketingConsent={marketingConsent} />
    <div className="my-6 flex items-center gap-3 text-xs text-[#063f5b]/45"><span className="h-px flex-1 bg-[#063f5b]/10" />or use email<span className="h-px flex-1 bg-[#063f5b]/10" /></div>
    <StatefulForm action={signUpAction} submitText="Create account" pendingText="Creating account…">
      <input type="hidden" name="next" value={next} />
      {marketingConsent && <input type="hidden" name="marketingConsent" value="yes" />}
      <label className={labelClass}>Email<input className={inputClass} type="email" name="email" autoComplete="email" required /></label>
      <label className={labelClass}>Password <span className="font-normal text-[#063f5b]/50">(8+ characters)</span><input className={inputClass} type="password" name="password" minLength={8} autoComplete="new-password" required /></label>
      <label className={labelClass}>Confirm password<input className={inputClass} type="password" name="confirmPassword" minLength={8} autoComplete="new-password" required /></label>
    </StatefulForm>
    <div className="mt-5"><LegalAgreement /></div>
    <p className="mt-6 text-center text-sm text-[#063f5b]/65">Already registered? <Link className="font-bold text-[#007fa5]" href={`/sign-in?next=${encodeURIComponent(next)}`}>Sign in</Link></p>
  </>;
}
