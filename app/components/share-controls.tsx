"use client";

import { useEffect, useId, useRef, useState } from "react";

type ShareControlsProps = {
  url: string;
  title: string;
  text: string;
  label: string;
  imageUrl?: string;
};

type Feedback = "copied" | "shared" | "failed" | null;

type ShareDestination = {
  name: string;
  shortLabel: string;
  className: string;
  href: string;
};

function createShareDestinations(url: string, title: string, text: string, imageUrl: string) {
  const message = `${title}\n${text}\n${url}`;
  const emailBody = `${text}\n\n${url}`;

  return [
    {
      name: "WhatsApp",
      shortLabel: "WA",
      className: "bg-[#25D366] text-white",
      href: `https://wa.me/?text=${encodeURIComponent(message)}`,
    },
    {
      name: "Facebook",
      shortLabel: "f",
      className: "bg-[#1877F2] text-white",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      name: "Pinterest",
      shortLabel: "P",
      className: "bg-[#E60023] text-white",
      href: `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(`${title} — ${text}`)}`,
    },
    {
      name: "X",
      shortLabel: "X",
      className: "bg-black text-white",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    },
    {
      name: "Email",
      shortLabel: "@",
      className: "bg-[#e8f8fc] text-[#063f5b]",
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(emailBody)}`,
    },
  ] satisfies ShareDestination[];
}

function ShareIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
      <rect x="8" y="8" width="11" height="11" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0 2 2v8a2 2 0 0 0 2 2h2" />
    </svg>
  );
}

export function ShareControls({ url, title, text, label, imageUrl }: ShareControlsProps) {
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [isOpen, setIsOpen] = useState(false);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const firstActionRef = useRef<HTMLAnchorElement>(null);
  const panelId = useId();
  const hasProductSharing = Boolean(imageUrl);
  const destinations = imageUrl ? createShareDestinations(url, title, text, imageUrl) : [];

  useEffect(() => {
    return () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    firstActionRef.current?.focus();

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      triggerRef.current?.focus();
    }

    function closeOnOutsidePress(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setIsOpen(false);
    }

    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnOutsidePress);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnOutsidePress);
    };
  }, [isOpen]);

  function showFeedback(nextFeedback: Exclude<Feedback, null>) {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    setFeedback(nextFeedback);
    feedbackTimer.current = setTimeout(() => setFeedback(null), 2500);
  }

  async function copyLink() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const temporaryInput = document.createElement("textarea");
        temporaryInput.value = url;
        temporaryInput.setAttribute("readonly", "");
        temporaryInput.style.position = "fixed";
        temporaryInput.style.opacity = "0";
        document.body.appendChild(temporaryInput);
        temporaryInput.select();
        let copied = false;
        try {
          copied = document.execCommand("copy");
        } finally {
          temporaryInput.remove();
        }
        if (!copied) throw new Error("Copy command was unavailable.");
      }

      setIsOpen(false);
      showFeedback("copied");
    } catch {
      showFeedback("failed");
    }
  }

  async function sharePage() {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        setIsOpen(false);
        showFeedback("shared");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    if (hasProductSharing) {
      setIsOpen((current) => !current);
      return;
    }

    await copyLink();
  }

  const feedbackMessage = feedback === "copied"
    ? "Link copied"
    : feedback === "shared"
      ? "Shared"
      : feedback === "failed"
        ? "Could not copy the link"
        : "";

  return (
    <div className="relative mt-7 flex flex-wrap items-center gap-2" aria-label={label}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => hasProductSharing ? setIsOpen((current) => !current) : void sharePage()}
        aria-expanded={hasProductSharing ? isOpen : undefined}
        aria-controls={hasProductSharing ? panelId : undefined}
        className="inline-flex items-center gap-2 rounded-full border border-[#063f5b]/10 bg-white px-4 py-2.5 text-xs font-extrabold text-[#063f5b] shadow-sm transition hover:border-[#009dcc]/35 hover:text-[#009dcc]"
      >
        <ShareIcon />
        Share
      </button>

      {!hasProductSharing && (
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center gap-2 rounded-full border border-[#063f5b]/10 bg-white/65 px-4 py-2.5 text-xs font-extrabold text-[#063f5b]/70 transition hover:border-[#009dcc]/35 hover:bg-white hover:text-[#009dcc]"
        >
          <CopyIcon />
          Copy link
        </button>
      )}

      {hasProductSharing && isOpen && (
        <>
          <div aria-hidden="true" className="fixed inset-0 z-40 bg-[#021b28]/35 sm:hidden" />
          <div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-label={`Share ${title}`}
            className="fixed inset-x-5 top-1/2 z-50 max-h-[calc(100dvh-2.5rem)] -translate-y-1/2 overflow-y-auto rounded-[1.75rem] border border-[#063f5b]/10 bg-white p-5 shadow-[0_28px_80px_-28px_rgba(6,63,91,.6)] sm:absolute sm:inset-x-auto sm:left-0 sm:top-[calc(100%+0.75rem)] sm:w-[23rem] sm:max-w-[calc(100vw-3rem)] sm:translate-y-0"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">Share this find</p>
                <p className="mt-1 line-clamp-2 font-display text-xl font-semibold text-[#063f5b]">{title}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  triggerRef.current?.focus();
                }}
                aria-label="Close sharing options"
                className="grid size-9 shrink-0 place-items-center rounded-full border border-[#063f5b]/10 text-lg font-bold text-[#063f5b]/65 transition hover:bg-[#e8f8fc] hover:text-[#009dcc]"
              >
                ×
              </button>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {destinations.map((destination, index) => (
                <a
                  key={destination.name}
                  ref={index === 0 ? firstActionRef : undefined}
                  href={destination.href}
                  target={destination.name === "Email" ? undefined : "_blank"}
                  rel={destination.name === "Email" ? undefined : "noopener noreferrer"}
                  onClick={() => setIsOpen(false)}
                  className="group flex min-w-0 flex-col items-center gap-2 rounded-2xl border border-[#063f5b]/8 bg-[#f7fcfe] px-2 py-3 text-center text-xs font-extrabold text-[#063f5b] transition hover:-translate-y-0.5 hover:border-[#009dcc]/30 hover:bg-[#e8f8fc]"
                >
                  <span className={`grid size-9 place-items-center rounded-full text-sm font-black ${destination.className}`} aria-hidden="true">
                    {destination.shortLabel}
                  </span>
                  <span className="truncate">{destination.name}</span>
                </a>
              ))}

              <button
                type="button"
                onClick={sharePage}
                className="group flex min-w-0 flex-col items-center gap-2 rounded-2xl border border-[#063f5b]/8 bg-[#f7fcfe] px-2 py-3 text-center text-xs font-extrabold text-[#063f5b] transition hover:-translate-y-0.5 hover:border-[#009dcc]/30 hover:bg-[#e8f8fc]"
              >
                <span className="grid size-9 place-items-center rounded-full bg-[#063f5b] text-white" aria-hidden="true"><ShareIcon /></span>
                <span className="truncate">More apps</span>
              </button>
            </div>

            <button
              type="button"
              onClick={copyLink}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#063f5b]/10 bg-white px-4 py-3 text-xs font-extrabold text-[#063f5b] transition hover:border-[#009dcc]/35 hover:text-[#009dcc]"
            >
              <CopyIcon />
              Copy product link
            </button>
          </div>
        </>
      )}

      <span aria-live="polite" className={`min-h-4 text-xs font-bold transition-opacity ${feedback ? "text-[#007fa5] opacity-100" : "opacity-0"}`}>
        {feedbackMessage}
      </span>
    </div>
  );
}
