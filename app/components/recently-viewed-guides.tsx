"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { categoryThemeOptions, getCategoryThemeClass, type CategoryTheme } from "@/lib/category-themes";

const storageKey = "mishbaby-recently-viewed-guides";
const historyChangeEvent = "mishbaby-recently-viewed-guides-change";
const storedGuideLimit = 6;
const displayedGuideLimit = 3;

export type RecentlyViewedGuide = {
  slug: string;
  title: string;
  description: string;
  categoryLabel: string;
  readingMinutes?: number;
  symbol: string;
  colorTheme: CategoryTheme;
  coverImage?: {
    src: string;
    alt: string;
  };
};

function isRecentlyViewedGuide(value: unknown): value is RecentlyViewedGuide {
  if (!value || typeof value !== "object") return false;

  const guide = value as Partial<RecentlyViewedGuide>;
  const hasValidCoverImage = guide.coverImage === undefined || (
    typeof guide.coverImage === "object" &&
    guide.coverImage !== null &&
    typeof guide.coverImage.src === "string" &&
    typeof guide.coverImage.alt === "string"
  );
  const hasValidTheme = categoryThemeOptions.some((option) => option.value === guide.colorTheme);

  return (
    typeof guide.slug === "string" &&
    typeof guide.title === "string" &&
    typeof guide.description === "string" &&
    typeof guide.categoryLabel === "string" &&
    (guide.readingMinutes === undefined || typeof guide.readingMinutes === "number") &&
    typeof guide.symbol === "string" &&
    hasValidTheme &&
    hasValidCoverImage
  );
}

function parseHistory(value: string) {
  try {
    const parsedValue: unknown = JSON.parse(value);
    return Array.isArray(parsedValue)
      ? parsedValue.filter(isRecentlyViewedGuide).slice(0, storedGuideLimit)
      : [];
  } catch {
    return [];
  }
}

function getHistorySnapshot() {
  try {
    return window.localStorage.getItem(storageKey) ?? "[]";
  } catch {
    return "[]";
  }
}

function subscribeToHistory(onStoreChange: () => void) {
  function handleStorage(event: StorageEvent) {
    if (event.key === storageKey) onStoreChange();
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener(historyChangeEvent, onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(historyChangeEvent, onStoreChange);
  };
}

function saveHistory(guides: RecentlyViewedGuide[]) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(guides));
    window.dispatchEvent(new Event(historyChangeEvent));
  } catch {
    // Guide reading remains usable when browser storage is unavailable.
  }
}

export function RecentlyViewedGuides({ guide }: { guide: RecentlyViewedGuide }) {
  const historySnapshot = useSyncExternalStore(subscribeToHistory, getHistorySnapshot, () => "[]");
  const history = useMemo(() => parseHistory(historySnapshot), [historySnapshot]);
  const previousGuides = history
    .filter((historyGuide) => historyGuide.slug !== guide.slug)
    .slice(0, displayedGuideLimit);

  useEffect(() => {
    const storedHistory = parseHistory(getHistorySnapshot());
    const nextHistory = [
      guide,
      ...storedHistory.filter((historyGuide) => historyGuide.slug !== guide.slug),
    ].slice(0, storedGuideLimit);

    saveHistory(nextHistory);
  }, [guide]);

  function clearHistory() {
    try {
      window.localStorage.removeItem(storageKey);
      window.dispatchEvent(new Event(historyChangeEvent));
    } catch {
      // Guide reading remains usable when browser storage is unavailable.
    }
  }

  if (previousGuides.length === 0) return null;

  return (
    <section className="border-t border-[#063f5b]/6 bg-[#f7fcfe] px-5 py-14 sm:px-8 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between gap-5">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">Continue exploring</p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.045em] text-[#063f5b]">Recently viewed guides.</h2>
          </div>
          <button type="button" onClick={clearHistory} className="shrink-0 text-xs font-extrabold text-[#063f5b]/50 transition-colors hover:text-[#009dcc]">
            Clear history
          </button>
        </div>

        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {previousGuides.map((historyGuide) => (
            <article key={historyGuide.slug} className="group overflow-hidden rounded-[2rem] border border-[#063f5b]/8 bg-white shadow-[0_16px_36px_-28px_rgba(6,63,91,.4)]">
              <Link href={`/guides/${historyGuide.slug}`} className="block focus-visible:outline-offset-[-3px]">
                <div className={`relative grid h-36 place-items-center overflow-hidden text-4xl text-[#009dcc] ${getCategoryThemeClass(historyGuide.colorTheme)}`}>
                  {historyGuide.coverImage ? (
                    <Image
                      src={historyGuide.coverImage.src}
                      alt={historyGuide.coverImage.alt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <span aria-hidden="true">{historyGuide.symbol}</span>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#009dcc]">{historyGuide.categoryLabel}</p>
                    {historyGuide.readingMinutes && <span className="text-xs font-bold text-[#063f5b]/40">{historyGuide.readingMinutes} min read</span>}
                  </div>
                  <h3 className="mt-3 text-xl font-extrabold leading-snug tracking-[-0.03em] text-[#063f5b]">{historyGuide.title}</h3>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#063f5b]/65">{historyGuide.description}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold text-[#009dcc]">
                    Read again <span aria-hidden="true">→</span>
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
