"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFavorites } from "../favorites-provider";

export function SignOutButton() {
  const { signOut } = useFavorites();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function handleSignOut() {
    setPending(true);
    setFailed(false);
    const success = await signOut();
    if (!success) {
      setFailed(true);
      setPending(false);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return <div className="mt-6"><button type="button" onClick={handleSignOut} disabled={pending} className="rounded-full border border-[#063f5b]/15 px-5 py-3 text-sm font-extrabold transition hover:bg-[#e8f8fc] disabled:cursor-wait disabled:opacity-60">{pending ? "Signing out…" : "Sign out"}</button>{failed && <p role="status" className="mt-3 text-sm text-[#8a2430]">We couldn’t sign you out. Please try again.</p>}</div>;
}
