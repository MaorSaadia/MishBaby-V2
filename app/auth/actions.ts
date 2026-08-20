"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getCurrentUser, minimumPasswordLength, sanitizeReturnPath } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl, isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { marketingConsentPolicyVersion, marketingSignupConsentSource, marketingSignupCookieName, recordMarketingConsentEvent } from "@/lib/marketing-consent";
import { deleteResendMarketingContact, syncResendMarketingContact } from "@/lib/resend-marketing";

export type AuthActionState = { status?: "error" | "success"; message?: string };

const unavailable: AuthActionState = { status: "error", message: "Accounts are temporarily unavailable. Please try again later." };

function textValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateNewPassword(formData: FormData): AuthActionState | null {
  const password = textValue(formData, "password");
  const confirmation = textValue(formData, "confirmPassword");
  if (password.length < minimumPasswordLength) return { status: "error", message: `Use at least ${minimumPasswordLength} characters for your password.` };
  if (password !== confirmation) return { status: "error", message: "The passwords do not match." };
  return null;
}

export async function signInAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  if (!isSupabaseConfigured) return unavailable;
  const email = textValue(formData, "email").toLowerCase();
  const password = textValue(formData, "password");
  const next = sanitizeReturnPath(formData.get("next"));
  if (!validEmail(email) || !password) return { status: "error", message: "Enter a valid email and password." };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { status: "error", message: "Email or password is incorrect, or the email has not been confirmed." };
  redirect(next);
}

export async function signUpAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  if (!isSupabaseConfigured) return unavailable;
  const email = textValue(formData, "email").toLowerCase();
  if (!validEmail(email)) return { status: "error", message: "Enter a valid email address." };
  const passwordError = validateNewPassword(formData);
  if (passwordError) return passwordError;
  const next = sanitizeReturnPath(formData.get("next"));
  const marketingOptIn = formData.get("marketingConsent") === "yes";

  const supabase = await createServerSupabaseClient();
  const { data: signupData } = await supabase.auth.signUp({
    email,
    password: textValue(formData, "password"),
    options: {
      emailRedirectTo: getSiteUrl(),
      data: {
        return_path: next,
        ...(marketingOptIn ? {
          marketing_opt_in: true,
          marketing_policy_version: marketingConsentPolicyVersion,
          marketing_consent_source: marketingSignupConsentSource,
        } : {}),
      },
    },
  });
  if (marketingOptIn && signupData.session && signupData.user) {
    await recordMarketingConsentEvent(signupData.user.id, "subscribed", marketingSignupConsentSource);
    if (signupData.user.email) await syncResendMarketingContact(signupData.user.id, signupData.user.email, "subscribed");
  }

  // Keep the response deliberately generic so account existence is not exposed.
  return { status: "success", message: "If this address can be registered, we’ll send a confirmation email shortly." };
}

export async function forgotPasswordAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  if (!isSupabaseConfigured) return unavailable;
  const email = textValue(formData, "email").toLowerCase();
  if (!validEmail(email)) return { status: "error", message: "Enter a valid email address." };
  const supabase = await createServerSupabaseClient();
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: getSiteUrl() });
  return { status: "success", message: "If an account matches that address, a password-reset email is on its way." };
}

export async function updatePasswordAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  if (!isSupabaseConfigured) return unavailable;
  const passwordError = validateNewPassword(formData);
  if (passwordError) return passwordError;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Your recovery link is invalid or has expired. Request a new one." };
  const { error } = await supabase.auth.updateUser({ password: textValue(formData, "password") });
  if (error) return { status: "error", message: "We couldn’t update your password. Request a new recovery link and try again." };
  redirect("/account?password=updated");
}

export async function googleSignInAction(formData: FormData) {
  if (!isSupabaseConfigured) redirect("/sign-in?error=unavailable");
  const next = sanitizeReturnPath(formData.get("next"));
  const cookieStore = await cookies();
  if (formData.get("marketingConsent") === "yes") {
    cookieStore.set(marketingSignupCookieName, marketingConsentPolicyVersion, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/auth/callback",
      maxAge: 60 * 15,
    });
  } else {
    cookieStore.set(marketingSignupCookieName, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/auth/callback",
      maxAge: 0,
    });
  }
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error || !data.url) redirect("/sign-in?error=oauth");
  redirect(data.url);
}

export async function deleteAccountAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  if (!isSupabaseConfigured) return unavailable;
  const user = await getCurrentUser();
  if (!user?.email) return { status: "error", message: "Your session has expired. Sign in again before deleting your account." };
  const confirmationEmail = textValue(formData, "confirmationEmail").toLowerCase();
  if (confirmationEmail !== user.email.toLowerCase()) return { status: "error", message: "Enter your account email exactly to confirm deletion." };

  try {
    const resendDeletion = await deleteResendMarketingContact(user.email);
    if (!resendDeletion.ok) return { status: "error", message: "We couldn’t remove your email contact right now. Please try account deletion again." };
    const admin = createSupabaseAdminClient();
    const { error } = await admin.auth.admin.deleteUser(user.id, false);
    if (error) return { status: "error", message: "We couldn’t delete your account right now. Please try again." };
  } catch {
    return { status: "error", message: "We couldn’t delete your account right now. Please try again." };
  }

  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut({ scope: "local" });
  redirect("/?account=deleted");
}
