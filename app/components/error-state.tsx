"use client";

import Link from "next/link";

type ErrorStateProps = {
  onRetry: () => void;
  fullPage?: boolean;
};

export function ErrorState({ onRetry, fullPage = false }: ErrorStateProps) {
  return (
    <section
      role="alert"
      aria-labelledby="error-heading"
      className={`relative isolate flex items-center overflow-hidden bg-[#f1fbfe] px-4 py-12 sm:px-8 sm:py-16 ${fullPage ? "min-h-screen" : "min-h-[65vh]"}`}
    >
      <div className="absolute -right-24 -top-24 -z-10 size-96 rounded-full bg-[#a8e8f5]/70 blur-3xl" />
      <div className="absolute -bottom-24 -left-20 -z-10 size-72 rounded-full bg-[#d9f4ee]/75 blur-2xl" />

      <div className="mx-auto w-full max-w-3xl text-center">
        <div className="mx-auto grid size-24 place-items-center rounded-3xl border border-white/70 bg-[#a8e8f5] shadow-[0_24px_55px_-38px_rgba(6,63,91,.45)] sm:size-28 sm:rounded-[2rem]">
          <svg viewBox="0 0 64 64" className="size-12 text-[#007797] sm:size-14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 40h29a10 10 0 0 0 1-20 16 16 0 0 0-30-2 11 11 0 0 0 0 22Z" />
            <path d="M25 48c4 4 10 4 14 0" />
          </svg>
        </div>

        <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.14em] text-[#007797] sm:mt-8 sm:text-sm">A little hiccup</p>
        <h1 id="error-heading" className="mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.055em] text-[#063f5b] sm:text-6xl">
          We couldn&apos;t load this page.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#063f5b]/70 sm:mt-5 sm:text-lg sm:leading-8">
          This is usually temporary. Try again in a moment, or return to the homepage and keep exploring.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={onRetry} className="min-h-12 rounded-full bg-[#007797] px-6 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#006b88]">
            Try again
          </button>
          <Link href="/" className="flex min-h-12 items-center justify-center rounded-full border border-[#063f5b]/15 bg-white/75 px-6 py-3.5 text-center text-sm font-extrabold text-[#063f5b] transition hover:border-[#009dcc]">
            Back to homepage
          </Link>
        </div>
      </div>
    </section>
  );
}
