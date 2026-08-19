import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { signOutAction } from "@/app/auth/actions";
import { DeleteAccountForm } from "@/app/components/auth/delete-account-form";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Your account", robots: { index: false, follow: false } };

export default async function AccountPage({ searchParams }: PageProps<"/account">) {
  if (!isSupabaseConfigured) return <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8"><h1 className="font-display text-4xl font-semibold">Accounts are being configured</h1><p className="mt-4 text-[#063f5b]/65">Please check back soon.</p></section>;
  const user = await getCurrentUser();
  if (!user?.email) redirect("/sign-in?next=/account");
  const params = await searchParams;

  return <section className="bg-[#f7fcfe] px-5 py-14 sm:px-8 sm:py-20"><div className="mx-auto max-w-3xl">
    <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#009dcc]">Your MishBaby account</p>
    <h1 className="mt-2 font-display text-5xl font-semibold tracking-[-0.05em]">Account</h1>
    {params.password === "updated" && <p role="status" className="mt-6 rounded-xl bg-[#e7f8ee] px-4 py-3 text-sm text-[#195b37]">Your password was updated.</p>}
    <div className="mt-8 rounded-[2rem] border border-[#063f5b]/10 bg-white p-6 sm:p-8"><h2 className="text-xl font-extrabold">Sign-in email</h2><p className="mt-2 break-all text-[#063f5b]/65">{user.email}</p><form action={signOutAction} className="mt-6"><button className="rounded-full border border-[#063f5b]/15 px-5 py-3 text-sm font-extrabold transition hover:bg-[#e8f8fc]">Sign out</button></form></div>
    <div className="mt-6 rounded-[2rem] border border-[#9f2734]/20 bg-white p-6 sm:p-8"><h2 className="text-xl font-extrabold text-[#8a2430]">Delete account</h2><p className="mt-2 text-sm leading-6 text-[#063f5b]/65">This permanently deletes your MishBaby authentication account and cannot be undone.</p><DeleteAccountForm email={user.email} /></div>
  </div></section>;
}
