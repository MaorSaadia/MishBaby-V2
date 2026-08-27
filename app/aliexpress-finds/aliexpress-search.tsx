"use client";

import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";
import type { AliExpressSearchItem, AliExpressSearchResponse } from "@/lib/aliexpress-affiliate";

type SearchStatus = "idle" | "loading" | "loading-more" | "success" | "error";

const suggestedSearches = ["baby monitor", "bottle warmer", "diaper bag"];

export function AliExpressSearch() {
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [items, setItems] = useState<AliExpressSearchItem[]>([]);
  const [page, setPage] = useState(0);
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
      <form onSubmit={submitSearch} className="rounded-3xl border border-[#063f5b]/8 bg-white p-4 shadow-[0_18px_45px_-32px_rgba(6,63,91,.4)] sm:rounded-[2rem] sm:p-7">
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
          <button type="submit" disabled={initialLoading || loadingMore} className="h-13 w-full rounded-2xl bg-[#009dcc] px-7 text-sm font-extrabold text-white transition hover:bg-[#0784b0] disabled:cursor-wait disabled:opacity-60 sm:w-auto">
            {initialLoading ? "Searching..." : "Search AliExpress"}
          </button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#063f5b]/55">
          <span className="font-bold">Popular:</span>
          {suggestedSearches.map((suggestion) => (
            <button key={suggestion} type="button" onClick={() => startSearch(suggestion)} disabled={initialLoading || loadingMore} className="min-h-10 rounded-full bg-[#e8f8fc] px-3 py-1.5 font-bold transition hover:bg-[#d2f2f9] disabled:opacity-50">
              {suggestion}
            </button>
          ))}
        </div>
      </form>

      <div aria-live="polite" aria-atomic="true" className={`mt-5 min-h-6 rounded-2xl text-sm leading-6 ${status === "error" ? "bg-[#fff0f1] px-4 py-3 text-[#8a2430]" : "text-[#063f5b]/70"}`}>
        {initialLoading && "Searching AliExpress's baby-product catalog..."}
        {!initialLoading && message}
        {!initialLoading && !message && activeQuery && (
          <>Showing {items.length} relevant results for &ldquo;{activeQuery}&rdquo;.</>
        )}
      </div>

      {initialLoading && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-7 sm:gap-5 lg:grid-cols-4" aria-hidden="true">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="overflow-hidden rounded-2xl border border-[#063f5b]/8 bg-white sm:rounded-[2rem]">
              <div className="aspect-square animate-pulse bg-[#e4f6fa]" />
              <div className="space-y-3 p-3 sm:p-5">
                <div className="h-3 w-20 animate-pulse rounded bg-[#d4eff5]" />
                <div className="h-4 w-full animate-pulse rounded bg-[#e4f6fa]" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-[#e4f6fa]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-7 sm:gap-5 lg:grid-cols-4">
            {items.map((item) => (
              <article key={item.productId} className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#063f5b]/8 bg-white shadow-[0_20px_45px_-35px_rgba(6,63,91,.5)] sm:rounded-[2rem]">
                <a href={item.promotionUrl} target="_blank" rel="sponsored nofollow noopener noreferrer" className="group flex h-full flex-col" aria-label={`${item.title} on AliExpress (opens in a new tab)`}>
                  <div className="relative aspect-square overflow-hidden bg-white">
                    {item.image ? (
                      <Image src={item.image.url} alt="" fill sizes="(max-width: 1024px) 50vw, 272px" className="object-contain p-3 transition duration-300 group-hover:scale-[1.03] sm:p-5" />
                    ) : (
                      <div className="grid h-full place-items-center bg-[#f1fbfe] p-8 text-center text-sm font-bold text-[#063f5b]/45">Image unavailable</div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col border-t border-[#063f5b]/6 p-3 sm:p-5">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#009dcc] sm:text-xs">AliExpress result</p>
                    <h2 className="mt-2 line-clamp-4 text-sm font-extrabold leading-5 text-[#063f5b] sm:line-clamp-3 sm:text-base sm:leading-6">{item.title}</h2>
                    <span className="mt-auto pt-5 text-sm font-extrabold text-[#009dcc]">View on AliExpress ↗</span>
                  </div>
                </a>
              </article>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            {hasMore ? (
              <button type="button" onClick={() => void requestSearch(activeQuery, page + 1, true)} disabled={loadingMore} className="w-full rounded-full border border-[#009dcc]/35 bg-white px-7 py-3.5 text-sm font-extrabold text-[#009dcc] transition hover:bg-[#e8f8fc] disabled:cursor-wait disabled:opacity-60 sm:w-auto">
                {loadingMore ? "Loading more..." : "Load more"}
              </button>
            ) : (
              <p className="text-sm text-[#063f5b]/55">You&apos;ve reached the end of these results.</p>
            )}
          </div>
        </>
      )}

      <aside className="mx-auto mt-8 max-w-3xl rounded-2xl bg-[#fff7df] px-4 py-4 text-left text-xs leading-5 text-[#735a16] sm:mt-10 sm:px-5 sm:text-center">
        Product titles, images, and links are provided by AliExpress and may change. Shipping, availability, local currency, and final terms are confirmed on AliExpress. MishBaby may earn a commission from qualifying purchases at no additional cost to you.
      </aside>
    </div>
  );
}
