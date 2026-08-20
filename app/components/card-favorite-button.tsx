"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { type FavoriteKind, useFavorites } from "./favorites-provider";

export function CardFavoriteButton({ kind, id, label }: { kind: FavoriteKind; id: string; label: string }) {
  const { authStatus, isFavorite, isBusy, toggle } = useFavorites();
  const [failed, setFailed] = useState(false);
  const router = useRouter();
  const saved = isFavorite(kind, id);
  const busy = authStatus === "loading" || isBusy(kind, id);

  async function handleClick() {
    setFailed(false);
    if (authStatus === "signed-out") {
      const currentPath = `${window.location.pathname}${window.location.search}`;
      router.push(`/sign-in?next=${encodeURIComponent(currentPath)}`);
      return;
    }
    const result = await toggle(kind, id);
    if (result.requiresSignIn) {
      const currentPath = `${window.location.pathname}${window.location.search}`;
      router.push(`/sign-in?next=${encodeURIComponent(currentPath)}`);
      return;
    }
    setFailed(!result.ok);
  }

  const action = authStatus === "signed-out" ? "Sign in to save" : saved ? "Remove from saved" : "Save";
  return <button type="button" onClick={handleClick} disabled={busy} aria-pressed={saved} aria-label={`${action} ${label}`} title={failed ? "Could not update saved items. Try again." : `${action} ${label}`} className={`grid size-10 place-items-center rounded-full border shadow-sm backdrop-blur transition disabled:cursor-wait disabled:opacity-60 ${saved ? "border-[#009dcc] bg-[#e2f7fc] text-[#007797]" : "border-white/80 bg-white/90 text-[#063f5b] hover:bg-[#e2f7fc]"}`}><svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d={kind === "product" ? "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" : "M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-4-6 4V4Z"} /></svg></button>;
}
