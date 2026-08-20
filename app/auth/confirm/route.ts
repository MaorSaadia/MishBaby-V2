import type { EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { sanitizeReturnPath } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { marketingConsentPolicyVersion, marketingSignupConsentSource, recordMarketingConsentEvent } from "@/lib/marketing-consent";
import { syncResendMarketingContact } from "@/lib/resend-marketing";

const allowedTypes = new Set<EmailOtpType>(["email", "signup", "recovery"]);

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;
  if (isSupabaseConfigured && tokenHash && type && allowedTypes.has(type)) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      const optedIn = data.user?.user_metadata?.marketing_opt_in === true && data.user.user_metadata.marketing_policy_version === marketingConsentPolicyVersion;
      if (type !== "recovery" && optedIn && data.user) {
        await recordMarketingConsentEvent(data.user.id, "subscribed", marketingSignupConsentSource);
        if (data.user.email) await syncResendMarketingContact(data.user.id, data.user.email, "subscribed");
      }
      const requestedPath = sanitizeReturnPath(request.nextUrl.searchParams.get("next"));
      const signupReturnPath = sanitizeReturnPath(data.user?.user_metadata?.return_path, requestedPath);
      const destination = type === "recovery" ? "/update-password" : signupReturnPath;
      return NextResponse.redirect(new URL(destination, request.url));
    }
  }
  return NextResponse.redirect(new URL("/sign-in?error=confirmation", request.url));
}
