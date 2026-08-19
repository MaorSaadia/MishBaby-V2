"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type FavoriteStatus = "loading" | "signed-out" | "saved" | "not-saved";

export function FavoriteGuideButton({ guideId, guideSlug }: { guideId: string; guideSlug: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<FavoriteStatus>(isSupabaseConfigured ? "loading" : "signed-out");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const supabase = getBrowserSupabaseClient();
    if (!supabase) return;
    let active = true;

    async function loadFavorite(currentUser: User | null) {
      if (!active) return;
      setUser(currentUser);
      if (!currentUser) {
        setStatus("signed-out");
        return;
      }

      const { data, error } = await supabase!
        .from("guide_favorites")
        .select("guide_id")
        .eq("user_id", currentUser.id)
        .eq("guide_id", guideId)
        .maybeSingle();
      if (!active) return;
      setStatus(!error && data ? "saved" : "not-saved");
      if (error) setMessage("Saved status is temporarily unavailable.");
    }

    supabase.auth.getUser().then(({ data }) => loadFavorite(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      void loadFavorite(session?.user ?? null);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [guideId]);

  if (status === "signed-out") {
    return <div className="mt-6"><Link href={`/sign-in?next=${encodeURIComponent(`/guides/${guideSlug}`)}`} className="inline-flex items-center gap-2 rounded-full border border-[#063f5b]/15 bg-white px-5 py-3 text-sm font-extrabold text-[#063f5b] transition hover:bg-[#e8f8fc]"><BookmarkIcon /> Sign in to save</Link></div>;
  }

  async function toggleFavorite() {
    const supabase = getBrowserSupabaseClient();
    if (!supabase || !user || status === "loading") return;
    const wasSaved = status === "saved";
    setStatus("loading");
    setMessage("");
    const { error } = wasSaved
      ? await supabase.from("guide_favorites").delete().eq("user_id", user.id).eq("guide_id", guideId)
      : await supabase.from("guide_favorites").insert({ user_id: user.id, guide_id: guideId });

    if (error) {
      setStatus(wasSaved ? "saved" : "not-saved");
      setMessage("We couldn’t update your saved guides. Please try again.");
      return;
    }
    setStatus(wasSaved ? "not-saved" : "saved");
    setMessage(wasSaved ? "Removed from saved guides." : "Saved to your account.");
  }

  const saved = status === "saved";
  return <div className="mt-6"><button type="button" onClick={toggleFavorite} disabled={status === "loading"} aria-pressed={saved} className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-extrabold transition disabled:cursor-wait disabled:opacity-60 ${saved ? "border-[#009dcc] bg-[#e2f7fc] text-[#007797]" : "border-[#063f5b]/15 bg-white text-[#063f5b] hover:bg-[#e8f8fc]"}`}><BookmarkIcon filled={saved} />{status === "loading" ? "Checking…" : saved ? "Saved" : "Save guide"}</button><p aria-live="polite" className="mt-2 min-h-5 text-xs text-[#063f5b]/60">{message}</p></div>;
}

function BookmarkIcon({ filled = false }: { filled?: boolean }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-4-6 4V4Z" /></svg>;
}
