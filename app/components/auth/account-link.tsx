"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function AccountLink({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const supabase = getBrowserSupabaseClient();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(Boolean(session)));
    return () => data.subscription.unsubscribe();
  }, []);

  if (!isSupabaseConfigured) return null;
  return <Link href={signedIn ? "/account" : "/sign-in"} onClick={onNavigate} className={mobile ? "rounded-xl bg-[#e2f7fc] px-3 py-3 font-bold text-[#007fa5]" : "shrink-0 rounded-full bg-[#009dcc] px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#0784b0]"}>{signedIn ? "Account" : "Sign in"}</Link>;
}
