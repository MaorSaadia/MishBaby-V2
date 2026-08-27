"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useFavorites } from "../favorites-provider";

function getGoogleAvatarUrl(user: User | null) {
  const metadata = user?.user_metadata;
  const value = metadata?.avatar_url ?? metadata?.picture;
  if (typeof value !== "string") return null;

  try {
    const url = new URL(value);
    const googleImage = url.hostname === "googleusercontent.com" || url.hostname.endsWith(".googleusercontent.com");
    return url.protocol === "https:" && googleImage ? url.toString() : null;
  } catch {
    return null;
  }
}

function DefaultUserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

function UserAvatar({ url }: { url: string | null }) {
  const [failed, setFailed] = useState(false);

  if (!url || failed) return <DefaultUserIcon />;
  return <Image src={url} alt="" fill sizes="40px" className="object-cover" onError={() => setFailed(true)} />;
}

export function AccountMenu({ compact = false, onOpen }: { compact?: boolean; onOpen?: () => void }) {
  const { authStatus, user, signOut } = useFavorites();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const signedIn = authStatus === "signed-in" && Boolean(user);
  const avatarUrl = getGoogleAvatarUrl(user);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!isSupabaseConfigured) return null;

  function handleAccountButton() {
    if (!signedIn && authStatus !== "loading") {
      const returnPath = `${window.location.pathname}${window.location.search}`;
      router.push(`/sign-in?next=${encodeURIComponent(returnPath)}`);
      return;
    }
    if (!signedIn) return;
    const nextOpen = !open;
    setOpen(nextOpen);
    setFailed(false);
    if (nextOpen) onOpen?.();
  }

  function focusMenuItem(position: "first" | "last") {
    window.requestAnimationFrame(() => {
      const items = containerRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])');
      if (!items?.length) return;
      items[position === "first" ? 0 : items.length - 1]?.focus();
    });
  }

  function handleAccountButtonKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (!signedIn || (event.key !== "ArrowDown" && event.key !== "ArrowUp")) return;
    event.preventDefault();
    setOpen(true);
    setFailed(false);
    onOpen?.();
    focusMenuItem(event.key === "ArrowDown" ? "first" : "last");
  }

  function handleMenuKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])'));
    if (items.length === 0) return;
    event.preventDefault();
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);
    const nextIndex = event.key === "Home"
      ? 0
      : event.key === "End"
        ? items.length - 1
        : event.key === "ArrowDown"
          ? (currentIndex + 1 + items.length) % items.length
          : (currentIndex - 1 + items.length) % items.length;
    items[nextIndex]?.focus();
  }

  function handleContainerBlur(event: React.FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
  }

  async function handleSignOut() {
    setPending(true);
    setFailed(false);
    const success = await signOut();
    if (!success) {
      setPending(false);
      setFailed(true);
      return;
    }
    setOpen(false);
    router.replace("/");
    router.refresh();
  }

  if (!signedIn && !compact) {
    return (
      <Link href={`/sign-in?next=${encodeURIComponent(pathname)}`} onClick={(event) => { event.preventDefault(); handleAccountButton(); }} className="shrink-0 rounded-full bg-[#009dcc] px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#0784b0]">
        {authStatus === "loading" ? "Account" : "Sign in"}
      </Link>
    );
  }

  return (
    <div ref={containerRef} className="relative" onBlur={handleContainerBlur}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleAccountButton}
        onKeyDown={handleAccountButtonKeyDown}
        disabled={authStatus === "loading"}
        aria-haspopup={signedIn ? "menu" : undefined}
        aria-expanded={signedIn ? open : undefined}
        aria-label={signedIn ? `${open ? "Close" : "Open"} account menu` : authStatus === "loading" ? "Loading account" : "Sign in"}
        className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full border bg-white text-[#063f5b] transition-colors hover:border-[#009dcc]/40 hover:text-[#009dcc] disabled:cursor-wait ${compact ? "size-9 sm:size-10" : "size-10"} ${signedIn ? "border-[#009dcc]/40" : "border-[#063f5b]/15"}`}
      >
        {authStatus === "loading" ? <span className="size-4 animate-pulse rounded-full bg-[#a8e8f5]" /> : <UserAvatar key={avatarUrl ?? "default"} url={avatarUrl} />}
      </button>

      {open && signedIn && (
        <div role="menu" aria-label="Account menu" onKeyDown={handleMenuKeyDown} className="absolute right-0 top-[calc(100%+.65rem)] z-50 w-64 overflow-hidden rounded-2xl border border-[#063f5b]/10 bg-white p-2 shadow-[0_22px_50px_-28px_rgba(6,63,91,.55)]">
          <div className="border-b border-[#063f5b]/8 px-3 py-3">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#009dcc]">Signed in as</p>
            <p className="mt-1 truncate text-sm font-bold text-[#063f5b]" title={user?.email}>{user?.email}</p>
          </div>
          <Link href="/account" role="menuitem" onClick={() => setOpen(false)} className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-[#063f5b] transition hover:bg-[#e8f8fc]">
            <DefaultUserIcon /> Account
          </Link>
          <button type="button" role="menuitem" onClick={() => void handleSignOut()} disabled={pending} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold text-[#8a2430] transition hover:bg-[#fff0f1] disabled:cursor-wait disabled:opacity-60">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 17l5-5-5-5M15 12H3M14 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5" /></svg>
            {pending ? "Signing out…" : "Sign out"}
          </button>
          {failed && <p role="status" className="px-3 pb-2 pt-1 text-xs leading-5 text-[#8a2430]">We couldn&apos;t sign you out. Please try again.</p>}
        </div>
      )}
    </div>
  );
}
