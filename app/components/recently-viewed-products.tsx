"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useSyncExternalStore } from "react";

const storageKey = "mishbaby-recently-viewed-products";
const historyChangeEvent = "mishbaby-recently-viewed-products-change";
const storedProductLimit = 8;
const displayedProductLimit = 4;

export type RecentlyViewedProduct = {
  slug: string;
  name: string;
  summary: string;
  image?: {
    src: string;
    alt: string;
    blurDataURL?: string;
  };
};

function isRecentlyViewedProduct(value: unknown): value is RecentlyViewedProduct {
  if (!value || typeof value !== "object") return false;

  const product = value as Partial<RecentlyViewedProduct>;
  const hasValidImage = product.image === undefined || (
    typeof product.image === "object" &&
    product.image !== null &&
    typeof product.image.src === "string" &&
    typeof product.image.alt === "string" &&
    (product.image.blurDataURL === undefined || typeof product.image.blurDataURL === "string")
  );

  return (
    typeof product.slug === "string" &&
    typeof product.name === "string" &&
    typeof product.summary === "string" &&
    hasValidImage
  );
}

function parseHistory(value: string) {
  try {
    const parsedValue: unknown = JSON.parse(value);
    return Array.isArray(parsedValue)
      ? parsedValue.filter(isRecentlyViewedProduct).slice(0, storedProductLimit)
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

function saveHistory(products: RecentlyViewedProduct[]) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(products));
    window.dispatchEvent(new Event(historyChangeEvent));
  } catch {
    // Product browsing remains usable when browser storage is unavailable.
  }
}

export function RecentlyViewedProducts({ product }: { product: RecentlyViewedProduct }) {
  const historySnapshot = useSyncExternalStore(subscribeToHistory, getHistorySnapshot, () => "[]");
  const history = useMemo(() => parseHistory(historySnapshot), [historySnapshot]);
  const previousProducts = history
    .filter((historyProduct) => historyProduct.slug !== product.slug)
    .slice(0, displayedProductLimit);

  useEffect(() => {
    const storedHistory = parseHistory(getHistorySnapshot());
    const nextHistory = [
      product,
      ...storedHistory.filter((historyProduct) => historyProduct.slug !== product.slug),
    ].slice(0, storedProductLimit);

    saveHistory(nextHistory);
  }, [product]);

  function clearHistory() {
    try {
      window.localStorage.removeItem(storageKey);
      window.dispatchEvent(new Event(historyChangeEvent));
    } catch {
      // Product browsing remains usable when browser storage is unavailable.
    }
  }

  if (previousProducts.length === 0) return null;

  return (
    <section className="border-t border-[#063f5b]/6 bg-white px-5 py-14 sm:px-8 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between gap-5">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">Pick up where you left off</p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.045em] text-[#063f5b]">Recently viewed products.</h2>
          </div>
          <button
            type="button"
            onClick={clearHistory}
            className="shrink-0 text-xs font-extrabold text-[#063f5b]/50 transition-colors hover:text-[#009dcc]"
          >
            Clear history
          </button>
        </div>

        <div className="mt-9 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {previousProducts.map((historyProduct) => (
            <article key={historyProduct.slug} className="group overflow-hidden rounded-2xl border border-[#063f5b]/8 bg-[#fbfeff] shadow-[0_16px_36px_-28px_rgba(6,63,91,.4)] sm:rounded-[2rem]">
              <Link href={`/products/${historyProduct.slug}`} className="block focus-visible:outline-offset-[-3px]">
                <div className="relative grid aspect-[4/3] place-items-center overflow-hidden bg-[#e8f8fc]">
                  {historyProduct.image ? (
                    <Image
                      src={historyProduct.image.src}
                      alt={historyProduct.image.alt}
                      fill
                      placeholder={historyProduct.image.blurDataURL ? "blur" : "empty"}
                      blurDataURL={historyProduct.image.blurDataURL}
                      sizes="(max-width: 1024px) 50vw, 272px"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <svg viewBox="0 0 96 96" className="size-20 text-[#009dcc]" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 35 48 20l27 15v34c0 7-5 12-12 12H33c-7 0-12-5-12-12V35Z" />
                      <path d="M36 52c0-5 4-9 9-9 3 0 5 1 7 4 2-3 4-4 7-4 5 0 9 4 9 9 0 9-16 17-16 17S36 61 36 52Z" />
                    </svg>
                  )}
                </div>
                <div className="p-3 sm:p-5">
                  <h3 className="text-sm font-extrabold leading-5 tracking-[-0.03em] text-[#063f5b] sm:text-lg sm:leading-6">{historyProduct.name}</h3>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#063f5b]/65 sm:text-sm sm:leading-6">{historyProduct.summary}</p>
                  <span className="mt-3 inline-flex items-center gap-2 text-xs font-extrabold text-[#009dcc] sm:mt-4 sm:text-sm">
                    View again <span aria-hidden="true">→</span>
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
