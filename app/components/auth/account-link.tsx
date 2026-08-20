"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useFavorites } from "../favorites-provider";

export function AccountLink({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const { authStatus } = useFavorites();
  const signedIn = authStatus === "signed-in";
  const pathname = usePathname();
  const router = useRouter();

  function handleNavigate(event: React.MouseEvent<HTMLAnchorElement>) {
    onNavigate?.();
    if (!signedIn && authStatus !== "loading") {
      event.preventDefault();
      const returnPath = `${window.location.pathname}${window.location.search}`;
      router.push(`/sign-in?next=${encodeURIComponent(returnPath)}`);
    }
  }

  if (!isSupabaseConfigured) return null;
  return <Link href={signedIn ? "/account" : `/sign-in?next=${encodeURIComponent(pathname)}`} onClick={handleNavigate} className={mobile ? "rounded-xl bg-[#e2f7fc] px-3 py-3 font-bold text-[#007fa5]" : "shrink-0 rounded-full bg-[#009dcc] px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#0784b0]"}>{signedIn ? "Account" : authStatus === "loading" ? "Account" : "Sign in"}</Link>;
}
