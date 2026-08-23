"use client";

import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";
import type { AliExpressSearchItem, AliExpressSearchResponse } from "@/lib/aliexpress-affiliate";

type SearchStatus = "idle" | "loading" | "loading-more" | "success" | "error";

const suggestedSearches = ["baby monitor", "bottle warmer", "diaper bag"];

function formatUsd(amount: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(amount));
}

function compactNumber(value: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function discountPercentage(item: AliExpressSearchItem) {
  if (!item.salePrice || !item.originalPrice) return undefined;
  const salePrice = Number(item.salePrice.amount);
  const originalPrice = Number(item.originalPrice.amount);
  if (!Number.isFinite(salePrice) || !Number.isFinite(originalPrice) || originalPrice <= salePrice) return undefined;
  return Math.round((1 - salePrice / originalPrice) * 100);
}

export function AliExpressSearch() {
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [items, setItems] = useState<AliExpressSearchItem[]>([]);
  const [page, setPage] = useState(0);
  const [totalResultCount, setTotalResultCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [message, setMessage] = useState("");
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  async function requestSearch(searchQuery: string, requestedPage: number, append: boolean) {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setStatus(append ? "loading-more" : "loading");
    setMessage("");

    try {
      const response = await fetch("/api/aliexpress/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, page: requestedPage }),
        signal: controller.signal,
      });
      const payload: unknown = await response.json();
      if (!response.ok) {
        const errorMessage = payload
          && typeof payload === "object"
          && "error" in payload
          && typeof payload.error === "string"
          ? payload.error
          : "AliExpress search is temporarily unavailable.";
        throw new Error(errorMessage);
      }

      const result = payload as AliExpressSearchResponse;
      setItems((current) => {
        const candidates = append ? [...current, ...result.items] : result.items;
        return [...new Map(candidates.map((item) => [item.productId, item])).values()];
      });
      setActiveQuery(result.query);
      setPage(result.page);
      setTotalResultCount(result.totalResultCount);
      setHasMore(result.hasMore);
      setStatus("success");
      if (result.items.length === 0 && !append) {
        setMessage("AliExpress didn't return any products for that search. Try a different phrase.");
      }
    } catch (error) {
      if (controller.signal.aborted) return;
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "AliExpress search is temporarily unavailable.");
    }
  }

  function startSearch(searchQuery: string) {
    const normalized = searchQuery.trim().replace(/\s+/g, " ");
    if (normalized.length < 2 || normalized.length > 80) {
      setStatus("error");
      setMessage("Enter between 2 and 80 characters.");
      return;
    }
    setQuery(normalized);
    setItems([]);
    setPage(0);
    setHasMore(false);
    void requestSearch(normalized, 1, false);
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startSearch(query);
  }

  const initialLoading = status === "loading";
  const loadingMore = status === "loading-more";

  return (
    <div>
      <form onSubmit={submitSearch} className="rounded-[2rem] border border-[#063f5b]/8 bg-white p-5 shadow-[0_18px_45px_-32px_rgba(6,63,91,.4)] sm:p-7">
        <label htmlFor="aliexpress-search-query" className="text-sm font-extrabold text-[#063f5b]">
          What are you looking for?
        </label>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#063f5b]/40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
            <input
              id="aliexpress-search-query"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              minLength={2}
              maxLength={80}
              placeholder="Try baby monitor or bottle warmer"
              autoComplete="off"
              className="h-13 w-full rounded-2xl border border-[#063f5b]/15 bg-[#fbfeff] pl-12 pr-4 text-[#063f5b] outline-none transition focus:border-[#009dcc] focus:ring-3 focus:ring-[#009dcc]/15"
            />
          </div>
          <button type="submit" disabled={initialLoading || loadingMore} className="h-13 rounded-2xl bg-[#009dcc] px-7 text-sm font-extrabold text-white transition hover:bg-[#0784b0] disabled:cursor-wait disabled:opacity-60">
            {initialLoading ? "Searching..." : "Search AliExpress"}
          </button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#063f5b]/55">
          <span className="font-bold">Popular:</span>
          {suggestedSearches.map((suggestion) => (
            <button key={suggestion} type="button" onClick={() => startSearch(suggestion)} disabled={initialLoading || loadingMore} className="rounded-full bg-[#e8f8fc] px-3 py-1.5 font-bold transition hover:bg-[#d2f2f9] disabled:opacity-50">
              {suggestion}
            </button>
          ))}
        </div>
      </form>

      <div aria-live="polite" aria-atomic="true" className="min-h-16 pt-6 text-sm text-[#063f5b]/70">
        {initialLoading && "Searching AliExpress's baby-product catalog..."}
        {!initialLoading && message}
        {!initialLoading && !message && activeQuery && (
          <>Showing {items.length} of {totalResultCount.toLocaleString("en-US")} results for &ldquo;{activeQuery}&rdquo;.</>
        )}
      </div>

      {items.length > 0 && (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <article key={item.productId} className="flex min-w-0 flex-col overflow-hidden rounded-[2rem] border border-[#063f5b]/8 bg-white shadow-[0_20px_45px_-35px_rgba(6,63,91,.5)]">
                <a href={item.promotionUrl} target="_blank" rel="sponsored nofollow noopener noreferrer" className="group flex h-full flex-col" aria-label={`${item.title} on AliExpress (opens in a new tab)`}>
                  <div className="relative aspect-square overflow-hidden bg-white">
                    {item.image ? (
                      <Image src={item.image.url} alt="" fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-contain p-5 transition duration-300 group-hover:scale-[1.03]" />
                    ) : (
                      <div className="grid h-full place-items-center bg-[#f1fbfe] p-8 text-center text-sm font-bold text-[#063f5b]/45">Image unavailable</div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col border-t border-[#063f5b]/6 p-5">
                    <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#009dcc]">AliExpress result</p>
                    <h2 className="mt-2 line-clamp-3 text-base font-extrabold leading-6 text-[#063f5b]">{item.title}</h2>
                    <div className="mt-4 min-h-7">
                      {item.salePrice && (
                        <p className="flex flex-wrap items-baseline gap-2">
                          <span className="text-lg font-extrabold text-[#063f5b]">{formatUsd(item.salePrice.amount)}</span>
                          {item.originalPrice && <span className="text-sm text-[#063f5b]/45 line-through">{formatUsd(item.originalPrice.amount)}</span>}
                          {discountPercentage(item) !== undefined && <span className="rounded-full bg-[#e7f8ee] px-2 py-0.5 text-xs font-extrabold text-[#195b37]">{discountPercentage(item)}% off</span>}
                        </p>
                      )}
                    </div>
                    {(item.positiveFeedback !== undefined || item.recentSales !== undefined) && (
                      <p className="mt-2 text-xs leading-5 text-[#063f5b]/60">
                        {item.positiveFeedback !== undefined && `${item.positiveFeedback}% positive feedback`}
                        {item.positiveFeedback !== undefined && item.recentSales !== undefined && " · "}
                        {item.recentSales !== undefined && `${compactNumber(item.recentSales)} recent sales`}
                      </p>
                    )}
                    <span className="mt-auto pt-5 text-sm font-extrabold text-[#009dcc]">View on AliExpress ↗</span>
                  </div>
                </a>
              </article>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            {hasMore ? (
              <button type="button" onClick={() => void requestSearch(activeQuery, page + 1, true)} disabled={loadingMore} className="rounded-full border border-[#009dcc]/35 bg-white px-7 py-3 text-sm font-extrabold text-[#009dcc] transition hover:bg-[#e8f8fc] disabled:cursor-wait disabled:opacity-60">
                {loadingMore ? "Loading more..." : "Load more"}
              </button>
            ) : (
              <p className="text-sm text-[#063f5b]/55">You&apos;ve reached the end of these results.</p>
            )}
          </div>
        </>
      )}

      <aside className="mx-auto mt-10 max-w-3xl rounded-2xl bg-[#fff7df] px-5 py-4 text-center text-xs leading-5 text-[#735a16]">
        Product titles, images, prices, feedback, sales information, and links are provided by AliExpress and may change. MishBaby may earn a commission from qualifying purchases at no additional cost to you.
      </aside>
    </div>
  );
}
