import type { Metadata } from "next";
import { AuthShell } from "@/app/components/auth/auth-ui";
import { SignupForms } from "@/app/components/auth/signup-forms";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { sanitizeReturnPath } from "@/lib/auth";

export const metadata: Metadata = { title: "Create account", robots: { index: false, follow: false } };

export default async function SignUpPage({ searchParams }: PageProps<"/sign-up">) {
  const params = await searchParams;
  const next = sanitizeReturnPath(typeof params.next === "string" ? params.next : null);
  return <AuthShell eyebrow="Join MishBaby" title="Create your account" intro="One secure account, ready for the personalized features we add next.">
    {!isSupabaseConfigured ? <p className="rounded-xl bg-[#fff7df] p-4 text-sm text-[#735a16]">Accounts are being configured. Please check back soon.</p> : <SignupForms next={next} />}
  </AuthShell>;
}
