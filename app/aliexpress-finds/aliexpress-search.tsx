"use client";

import Image from "next/image";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import type {
  AliExpressSearchItem,
  AliExpressSearchResponse,
  AliExpressTrendingCategoryKey,
  AliExpressTrendingResponse,
} from "@/lib/aliexpress-affiliate";

type SearchStatus = "idle" | "loading" | "loading-more" | "success" | "error";
type ResultMode = "trending" | "search";

const suggestedSearches = ["baby monitor", "bottle warmer", "diaper bag"];
const trendingTabs: Array<{ key: AliExpressTrendingCategoryKey; label: string }> = [
  { key: "trending", label: "Trending" },
  { key: "care", label: "Baby Care" },
  { key: "nursery", label: "Nursery" },
  { key: "feeding", label: "Feeding" },
  { key: "clothing", label: "Baby Clothing" },
  { key: "toys", label: "Toys" },
];

function errorMessage(payload: unknown, fallback: string) {
  return payload
    && typeof payload === "object"
    && "error" in payload
    && typeof payload.error === "string"
    ? payload.error
    : fallback;
}

function mergeProducts(current: AliExpressSearchItem[], incoming: AliExpressSearchItem[], append: boolean, limit: number) {
  const candidates = append ? [...current, ...incoming] : incoming;
  return [...new Map(candidates.map((item) => [item.productId, item])).values()].slice(0, limit);
}

export function AliExpressSearch() {
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<AliExpressTrendingCategoryKey>("trending");
  const [activeCategoryLabel, setActiveCategoryLabel] = useState("Trending");
  const [mode, setMode] = useState<ResultMode>("trending");
  const [items, setItems] = useState<AliExpressSearchItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [message, setMessage] = useState("");
  const controllerRef = useRef<AbortController | null>(null);

  const requestTrending = useCallback(async (
    category: AliExpressTrendingCategoryKey,
    requestedPage: number,
    append: boolean,
  ) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setStatus(append ? "loading-more" : "loading");
    setMessage("");

    try {
      const response = await fetch("/api/aliexpress/trending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, page: requestedPage }),
        signal: controller.signal,
      });
      const payload: unknown = await response.json();
      if (!response.ok) throw new Error(errorMessage(payload, "Trending AliExpress products are temporarily unavailable."));

      const result = payload as AliExpressTrendingResponse;
      setItems((current) => mergeProducts(current, result.items, append, 24));
      setMode("trending");
      setActiveCategory(result.categoryKey);
      setActiveCategoryLabel(result.categoryLabel);
      setActiveQuery("");
      setPage(result.page);
      setHasMore(result.hasMore && result.page < 3);
      setStatus("success");
      if (result.items.length === 0 && !append) {
        setMessage("AliExpress didn't return hot products for this category right now. Try another category.");
      }
    } catch (error) {
      if (controller.signal.aborted) return;
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Trending AliExpress products are temporarily unavailable.");
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void requestTrending("trending", 1, false), 0);
    return () => {
      window.clearTimeout(timeoutId);
      controllerRef.current?.abort();
    };
  }, [requestTrending]);

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
      if (!response.ok) throw new Error(errorMessage(payload, "AliExpress search is temporarily unavailable."));

      const result = payload as AliExpressSearchResponse;
      setItems((current) => mergeProducts(current, result.items, append, 30));
      setMode("search");
      setActiveQuery(result.query);
      setPage(result.page);
      setHasMore(result.hasMore && result.page < 3);
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
    setMode("search");
    setQuery(normalized);
    setItems([]);
    setPage(0);
    setHasMore(false);
    void requestSearch(normalized, 1, false);
  }

  function startTrending(category: AliExpressTrendingCategoryKey) {
    setMode("trending");
    setQuery("");
    setActiveQuery("");
    setActiveCategory(category);
    setActiveCategoryLabel(trendingTabs.find((tab) => tab.key === category)?.label ?? "Trending");
    setItems([]);
    setPage(0);
    setHasMore(false);
    void requestTrending(category, 1, false);
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startSearch(query);
  }

  function loadMore() {
    if (mode === "search") void requestSearch(activeQuery, page + 1, true);
    else void requestTrending(activeCategory, page + 1, true);
  }

  const initialLoading = status === "loading";
  const loadingMore = status === "loading-more";
  const controlsDisabled = initialLoading || loadingMore;
  const resultLimit = mode === "trending" ? 24 : 30;

  return (
    <div>
      <form onSubmit={submitSearch} className="rounded-3xl border border-[#063f5b]/8 bg-white p-4 shadow-[0_18px_45px_-32px_rgba(6,63,91,.4)] sm:rounded-[2rem] sm:p-7">
        <label htmlFor="aliexpress-search-query" className="text-sm font-extrabold text-[#063f5b]">What are you looking for?</label>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#063f5b]/40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" />
            </svg>
            <input id="aliexpress-search-query" type="search" value={query} onChange={(event) => setQuery(event.target.value)} minLength={2} maxLength={80} placeholder="Try baby monitor or bottle warmer" autoComplete="off" className="h-13 w-full rounded-2xl border border-[#063f5b]/15 bg-[#fbfeff] pl-12 pr-4 text-[#063f5b] outline-none transition focus:border-[#009dcc] focus:ring-3 focus:ring-[#009dcc]/15" />
          </div>
          <button type="submit" disabled={controlsDisabled} className="h-13 w-full rounded-2xl bg-[#009dcc] px-7 text-sm font-extrabold text-white transition hover:bg-[#0784b0] disabled:cursor-wait disabled:opacity-60 sm:w-auto">
            {initialLoading && mode === "search" ? "Searching..." : "Search AliExpress"}
          </button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#063f5b]/55">
          <span className="font-bold">Popular:</span>
          {suggestedSearches.map((suggestion) => (
            <button key={suggestion} type="button" onClick={() => startSearch(suggestion)} disabled={controlsDisabled} className="min-h-10 rounded-full bg-[#e8f8fc] px-3 py-1.5 font-bold transition hover:bg-[#d2f2f9] disabled:opacity-50">{suggestion}</button>
          ))}
        </div>
      </form>

      <div className="mt-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">{mode === "trending" ? "Live baby hot products" : "AliExpress search"}</p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.04em] text-[#063f5b] sm:text-4xl">{mode === "trending" ? `${activeCategoryLabel} baby finds.` : "Search results."}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#063f5b]/65">
            {mode === "trending" ? "Live AliExpress hot products restricted to focused baby categories. These are third-party results, not MishBaby endorsements." : `Relevant AliExpress products for “${activeQuery || query}”.`}
          </p>
        </div>
        {mode === "search" && <button type="button" onClick={() => startTrending("trending")} disabled={controlsDisabled} className="min-h-11 w-fit rounded-full border border-[#009dcc]/30 bg-white px-5 py-2.5 text-sm font-extrabold text-[#009dcc] transition hover:bg-[#e8f8fc] disabled:opacity-50">Back to trending</button>}
      </div>

      <nav aria-label="Trending AliExpress baby categories" className="mt-5 flex gap-2 overflow-x-auto pb-2">
        {trendingTabs.map((tab) => {
          const selected = mode === "trending" && activeCategory === tab.key;
          return <button key={tab.key} type="button" onClick={() => startTrending(tab.key)} disabled={controlsDisabled} aria-pressed={selected} className={`min-h-11 shrink-0 rounded-full px-4 py-2.5 text-sm font-extrabold transition disabled:opacity-50 ${selected ? "bg-[#009dcc] text-white" : "border border-[#063f5b]/10 bg-white text-[#063f5b]/70 hover:border-[#009dcc]/40 hover:text-[#009dcc]"}`}>{tab.label}</button>;
        })}
      </nav>

      <div aria-live="polite" aria-atomic="true" className={`mt-4 min-h-6 rounded-2xl text-sm leading-6 ${status === "error" ? "bg-[#fff0f1] px-4 py-3 text-[#8a2430]" : "text-[#063f5b]/70"}`}>
        {initialLoading && (mode === "trending" ? `Loading ${activeCategoryLabel.toLocaleLowerCase()} baby finds...` : "Searching AliExpress's baby-product catalog...")}
        {!initialLoading && message}
        {!initialLoading && !message && items.length > 0 && <>Showing {items.length} {mode === "trending" ? "live hot products" : "relevant results"}.</>}
      </div>

      {initialLoading && <ProductSkeleton />}

      {items.length > 0 && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-7 sm:gap-5 lg:grid-cols-4">
            {items.map((item) => <AliExpressResultCard key={item.productId} item={item} hotProduct={mode === "trending"} />)}
          </div>
          <div className="mt-8 flex justify-center">
            {hasMore && items.length < resultLimit ? (
              <button type="button" onClick={loadMore} disabled={loadingMore} className="w-full rounded-full border border-[#009dcc]/35 bg-white px-7 py-3.5 text-sm font-extrabold text-[#009dcc] transition hover:bg-[#e8f8fc] disabled:cursor-wait disabled:opacity-60 sm:w-auto">{loadingMore ? "Loading more..." : "Load more"}</button>
            ) : <p className="text-sm text-[#063f5b]/55">You&apos;ve reached the end of these results.</p>}
          </div>
        </>
      )}

      <aside className="mx-auto mt-8 max-w-3xl rounded-2xl bg-[#fff7df] px-4 py-4 text-left text-xs leading-5 text-[#735a16] sm:mt-10 sm:px-5 sm:text-center">
        Product titles, images, and links are provided by AliExpress and may change. Hot-product status is supplied by AliExpress and is not a MishBaby endorsement. Shipping, availability, local currency, and final terms are confirmed on AliExpress. MishBaby may earn a commission from qualifying purchases at no additional cost to you.
      </aside>
    </div>
  );
}

function ProductSkeleton() {
  return <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-7 sm:gap-5 lg:grid-cols-4" aria-hidden="true">
    {Array.from({ length: 8 }, (_, index) => <div key={index} className="overflow-hidden rounded-2xl border border-[#063f5b]/8 bg-white sm:rounded-[2rem]">
      <div className="aspect-square animate-pulse bg-[#e4f6fa]" />
      <div className="space-y-3 p-3 sm:p-5"><div className="h-3 w-20 animate-pulse rounded bg-[#d4eff5]" /><div className="h-4 w-full animate-pulse rounded bg-[#e4f6fa]" /><div className="h-4 w-3/4 animate-pulse rounded bg-[#e4f6fa]" /></div>
    </div>)}
  </div>;
}

function AliExpressResultCard({ item, hotProduct }: { item: AliExpressSearchItem; hotProduct: boolean }) {
  return <article className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#063f5b]/8 bg-white shadow-[0_20px_45px_-35px_rgba(6,63,91,.5)] sm:rounded-[2rem]">
    <a href={item.promotionUrl} target="_blank" rel="sponsored nofollow noopener noreferrer" className="group flex h-full flex-col" aria-label={`${item.title} on AliExpress (opens in a new tab)`}>
      <div className="relative aspect-square overflow-hidden bg-white">
        {item.image ? <Image src={item.image.url} alt="" fill sizes="(max-width: 1024px) 50vw, 272px" className="object-contain p-3 transition duration-300 group-hover:scale-[1.03] sm:p-5" /> : <div className="grid h-full place-items-center bg-[#f1fbfe] p-8 text-center text-sm font-bold text-[#063f5b]/45">Image unavailable</div>}
      </div>
      <div className="flex flex-1 flex-col border-t border-[#063f5b]/6 p-3 sm:p-5">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#009dcc] sm:text-xs">{hotProduct ? "AliExpress hot product" : "AliExpress result"}</p>
        <h3 className="mt-2 line-clamp-4 text-sm font-extrabold leading-5 text-[#063f5b] sm:line-clamp-3 sm:text-base sm:leading-6">{item.title}</h3>
        <span className="mt-auto pt-5 text-sm font-extrabold text-[#009dcc]">View on AliExpress ↗</span>
      </div>
    </a>
  </article>;
}
