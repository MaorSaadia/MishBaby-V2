"use client";

import { useEffect, useRef, useState } from "react";

type ShareControlsProps = {
  url: string;
  title: string;
  text: string;
  label: string;
};

type Feedback = "copied" | "shared" | "failed" | null;

export function ShareControls({ url, title, text, label }: ShareControlsProps) {
  const [feedback, setFeedback] = useState<Feedback>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    };
  }, []);

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

      showFeedback("copied");
    } catch {
      showFeedback("failed");
    }
  }

  async function sharePage() {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        showFeedback("shared");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
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
    <div className="mt-7 flex flex-wrap items-center gap-2" aria-label={label}>
      <button
        type="button"
        onClick={sharePage}
        className="inline-flex items-center gap-2 rounded-full border border-[#063f5b]/10 bg-white px-4 py-2.5 text-xs font-extrabold text-[#063f5b] shadow-sm transition hover:border-[#009dcc]/35 hover:text-[#009dcc]"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
          <circle cx="18" cy="5" r="2.5" />
          <circle cx="6" cy="12" r="2.5" />
          <circle cx="18" cy="19" r="2.5" />
          <path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4" />
        </svg>
        Share
      </button>
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex items-center gap-2 rounded-full border border-[#063f5b]/10 bg-white/65 px-4 py-2.5 text-xs font-extrabold text-[#063f5b]/70 transition hover:border-[#009dcc]/35 hover:bg-white hover:text-[#009dcc]"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
          <rect x="8" y="8" width="11" height="11" rx="2" />
          <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
        </svg>
        Copy link
      </button>
      <span aria-live="polite" className={`min-h-4 text-xs font-bold transition-opacity ${feedback ? "text-[#007fa5] opacity-100" : "opacity-0"}`}>
        {feedbackMessage}
      </span>
    </div>
  );
}
