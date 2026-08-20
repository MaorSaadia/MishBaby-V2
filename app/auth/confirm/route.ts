import type { EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { sanitizeReturnPath } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const allowedTypes = new Set<EmailOtpType>(["email", "signup", "recovery"]);

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;
  if (isSupabaseConfigured && tokenHash && type && allowedTypes.has(type)) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      const requestedPath = sanitizeReturnPath(request.nextUrl.searchParams.get("next"));
      const signupReturnPath = sanitizeReturnPath(data.user?.user_metadata?.return_path, requestedPath);
      const destination = type === "recovery" ? "/update-password" : signupReturnPath;
      return NextResponse.redirect(new URL(destination, request.url));
    }
  }
  return NextResponse.redirect(new URL("/sign-in?error=confirmation", request.url));
}
