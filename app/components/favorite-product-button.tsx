"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFavorites } from "./favorites-provider";

export function FavoriteProductButton({ productId, productSlug }: { productId: string; productSlug: string }) {
  const { authStatus, isFavorite, isBusy, toggle } = useFavorites();
  const [message, setMessage] = useState("");
  const router = useRouter();
  const saved = isFavorite("product", productId);
  const busy = authStatus === "loading" || isBusy("product", productId);

  async function toggleFavorite() {
    if (authStatus === "signed-out") {
      router.push(`/sign-in?next=${encodeURIComponent(`/products/${productSlug}`)}`);
      return;
    }
    setMessage("");
    const result = await toggle("product", productId);
    if (result.requiresSignIn) {
      router.push(`/sign-in?next=${encodeURIComponent(`/products/${productSlug}`)}`);
      return;
    }
    if (!result.ok) {
      setMessage("We couldn’t update your saved products. Please try again.");
      return;
    }
    setMessage(result.saved ? "Saved to your account." : "Removed from saved products.");
  }

  return <div className="mt-6"><button type="button" onClick={toggleFavorite} disabled={busy} aria-pressed={saved} className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-extrabold transition disabled:cursor-wait disabled:opacity-60 ${saved ? "border-[#009dcc] bg-[#e2f7fc] text-[#007797]" : "border-[#063f5b]/15 bg-white text-[#063f5b] hover:bg-[#e8f8fc]"}`}><HeartIcon filled={saved} />{busy ? "Checking…" : authStatus === "signed-out" ? "Sign in to save" : saved ? "Saved" : "Save product"}</button><p aria-live="polite" className="mt-2 min-h-5 text-xs text-[#063f5b]/60">{message}</p></div>;
}

function HeartIcon({ filled = false }: { filled?: boolean }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" /></svg>;
}
