"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFavorites } from "./favorites-provider";

export function FavoriteGuideButton({ guideId, guideSlug }: { guideId: string; guideSlug: string }) {
  const { authStatus, isFavorite, isBusy, toggle } = useFavorites();
  const [message, setMessage] = useState("");
  const router = useRouter();
  const saved = isFavorite("guide", guideId);
  const busy = authStatus === "loading" || isBusy("guide", guideId);

  async function toggleFavorite() {
    if (authStatus === "signed-out") {
      router.push(`/sign-in?next=${encodeURIComponent(`/guides/${guideSlug}`)}`);
      return;
    }
    setMessage("");
    const result = await toggle("guide", guideId);
    if (result.requiresSignIn) {
      router.push(`/sign-in?next=${encodeURIComponent(`/guides/${guideSlug}`)}`);
      return;
    }
    if (!result.ok) {
      setMessage("We couldn’t update your saved guides. Please try again.");
      return;
    }
    setMessage(result.saved ? "Saved to your account." : "Removed from saved guides.");
  }

  return <div className="mt-6"><button type="button" onClick={toggleFavorite} disabled={busy} aria-pressed={saved} className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-extrabold transition disabled:cursor-wait disabled:opacity-60 ${saved ? "border-[#009dcc] bg-[#e2f7fc] text-[#007797]" : "border-[#063f5b]/15 bg-white text-[#063f5b] hover:bg-[#e8f8fc]"}`}><BookmarkIcon filled={saved} />{busy ? "Checking…" : authStatus === "signed-out" ? "Sign in to save" : saved ? "Saved" : "Save guide"}</button><p aria-live="polite" className="mt-2 min-h-5 text-xs text-[#063f5b]/60">{message}</p></div>;
}

function BookmarkIcon({ filled = false }: { filled?: boolean }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-4-6 4V4Z" /></svg>;
}
