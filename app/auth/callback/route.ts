import { NextRequest, NextResponse } from "next/server";
import { sanitizeReturnPath } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { marketingConsentPolicyVersion, marketingSignupConsentSource, marketingSignupCookieName, recordMarketingConsentEvent } from "@/lib/marketing-consent";

function redirectAndClearConsentCookie(destination: URL) {
  const response = NextResponse.redirect(destination);
  response.cookies.set(marketingSignupCookieName, "", { path: "/auth/callback", maxAge: 0 });
  return response;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = sanitizeReturnPath(request.nextUrl.searchParams.get("next"));
  if (isSupabaseConfigured && code) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const optedIn = request.cookies.get(marketingSignupCookieName)?.value === marketingConsentPolicyVersion;
      if (optedIn && data.user) await recordMarketingConsentEvent(data.user.id, "subscribed", marketingSignupConsentSource);
      return redirectAndClearConsentCookie(new URL(next, request.url));
    }
  }
  return redirectAndClearConsentCookie(new URL("/sign-in?error=oauth", request.url));
}
