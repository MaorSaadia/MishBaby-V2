"use client";

import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";
import type { AmazonSearchItem, AmazonSearchResponse } from "@/lib/amazon-creators";

type SearchStatus = "idle" | "loading" | "loading-more" | "success" | "error";

const suggestedSearches = ["baby monitor", "bottle warmer", "diaper bag"];

export function AmazonSearch() {
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [items, setItems] = useState<AmazonSearchItem[]>([]);
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
      const response = await fetch("/api/amazon/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, page: requestedPage }),
        signal: controller.signal,
      });
      const payload: unknown = await response.json();
      if (!response.ok) {
        const errorMessage = payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
          ? payload.error
          : "Amazon search is temporarily unavailable.";
        throw new Error(errorMessage);
      }

      const result = payload as AmazonSearchResponse;
      setItems((current) => {
        const candidates = append ? [...current, ...result.items] : result.items;
        return [...new Map(candidates.map((item) => [item.asin, item])).values()];
      });
      setActiveQuery(result.query);
      setPage(result.page);
      setTotalResultCount(result.totalResultCount);
      setHasMore(result.hasMore);
      setStatus("success");
      if (result.items.length === 0 && !append) setMessage("Amazon didn’t return any Baby products for that search. Try a different phrase.");
    } catch (error) {
      if (controller.signal.aborted) return;
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Amazon search is temporarily unavailable.");
    }
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = query.trim().replace(/\s+/g, " ");
    if (normalized.length < 2 || normalized.length > 80) {
      setStatus("error");
      setMessage("Enter between 2 and 80 characters.");
      return;
    }
    setItems([]);
    setPage(0);
    setHasMore(false);
    void requestSearch(normalized, 1, false);
  }

  function chooseSuggestion(suggestion: string) {
    setQuery(suggestion);
    setItems([]);
    setPage(0);
    setHasMore(false);
    void requestSearch(suggestion, 1, false);
  }

  const initialLoading = status === "loading";
  const loadingMore = status === "loading-more";

  return (
    <div>
      <form onSubmit={submitSearch} className="rounded-[2rem] border border-[#063f5b]/8 bg-white p-5 shadow-[0_18px_45px_-32px_rgba(6,63,91,.4)] sm:p-7">
        <label htmlFor="amazon-search-query" className="text-sm font-extrabold text-[#063f5b]">What are you looking for?</label>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#063f5b]/40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
            <input
              id="amazon-search-query"
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
            {initialLoading ? "Searching…" : "Search Amazon"}
          </button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#063f5b]/55">
          <span className="font-bold">Popular:</span>
          {suggestedSearches.map((suggestion) => <button key={suggestion} type="button" onClick={() => chooseSuggestion(suggestion)} disabled={initialLoading || loadingMore} className="rounded-full bg-[#e8f8fc] px-3 py-1.5 font-bold transition hover:bg-[#d2f2f9] disabled:opacity-50">{suggestion}</button>)}
        </div>
      </form>

      <div aria-live="polite" aria-atomic="true" className="mt-5 min-h-6 text-sm text-[#063f5b]/65">
        {message || (initialLoading ? "Searching Amazon’s Baby catalog…" : items.length > 0 ? `Showing ${items.length} of ${totalResultCount.toLocaleString()} results for “${activeQuery}”.` : "")}
      </div>

      {items.length > 0 && (
        <>
          <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {items.map((item) => <AmazonResultCard key={item.asin} item={item} />)}
          </div>
          <div className="mt-10 text-center">
            {hasMore && page < 3 ? (
              <button type="button" onClick={() => void requestSearch(activeQuery, page + 1, true)} disabled={loadingMore} className="rounded-full border border-[#063f5b]/15 bg-white px-7 py-3.5 text-sm font-extrabold text-[#063f5b] transition hover:border-[#009dcc] hover:bg-[#e8f8fc] disabled:cursor-wait disabled:opacity-60">
                {loadingMore ? "Loading more…" : "Load more Amazon results"}
              </button>
            ) : (
              <p className="text-sm font-semibold text-[#063f5b]/50">You’ve reached the end of the available results for this search.</p>
            )}
          </div>
          <p className="mx-auto mt-8 max-w-3xl rounded-2xl bg-[#fff7df] px-5 py-4 text-center text-xs leading-5 text-[#735a16]">Amazon product titles, images, and links are provided by Amazon. As an Amazon Associate, MishBaby earns from qualifying purchases.</p>
        </>
      )}
    </div>
  );
}

function AmazonResultCard({ item }: { item: AmazonSearchItem }) {
  return (
    <article className="group flex overflow-hidden rounded-2xl border border-[#063f5b]/8 bg-white shadow-[0_16px_36px_-28px_rgba(6,63,91,.4)] transition duration-300 hover:-translate-y-1 sm:rounded-[2rem]">
      <a href={item.detailPageUrl} target="_blank" rel="sponsored nofollow noopener noreferrer" className="flex w-full flex-col focus-visible:outline-offset-[-3px]" aria-label={`View ${item.title} on Amazon (opens in a new tab)`}>
        <div className="relative grid aspect-square place-items-center overflow-hidden bg-white p-3 sm:aspect-[4/3]">
          {item.image ? (
            <Image src={item.image.url} alt="" fill sizes="(max-width: 1024px) 50vw, 272px" className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03] sm:p-5" />
          ) : (
            <svg viewBox="0 0 96 96" className="size-20 text-[#009dcc]" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 35 48 20l27 15v34c0 7-5 12-12 12H33c-7 0-12-5-12-12V35Z" /><path d="M36 52c0-5 4-9 9-9 3 0 5 1 7 4 2-3 4-4 7-4 5 0 9 4 9 9 0 9-16 17-16 17S36 61 36 52Z" /></svg>
          )}
        </div>
        <div className="flex flex-1 flex-col p-3 sm:p-5">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#009dcc] sm:text-xs">Amazon result</p>
          <h2 className="mt-2 line-clamp-4 text-sm font-extrabold leading-5 tracking-[-0.025em] text-[#063f5b] sm:text-base sm:leading-6">{item.title}</h2>
          <span className="mt-auto pt-4 text-xs font-extrabold text-[#009dcc] sm:text-sm">View on Amazon <span aria-hidden="true">↗</span></span>
        </div>
      </a>
    </article>
  );
}
