"use client";

import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";
import type {
  AmazonOfferLink,
  AmazonOfferLinkResponse,
  AmazonSearchItem,
  AmazonSearchResponse,
} from "@/lib/amazon-creators";

type SearchStatus = "idle" | "loading" | "loading-more" | "success" | "error";
type SearchFilters = {
  minPrice?: string;
  maxPrice?: string;
  primeOnly: boolean;
  minRating?: 3 | 4;
  sortBy: string;
};

const suggestedSearches = ["baby monitor", "bottle warmer", "diaper bag"];
const defaultFilters: SearchFilters = { primeOnly: false, sortBy: "Relevance" };

function validatedPrice(value: string) {
  const normalized = value.trim();
  if (!normalized) return undefined;
  if (!/^(?:0|[1-9]\d{0,4})(?:\.\d{1,2})?$/.test(normalized)) return null;
  const amount = Number(normalized);
  return amount >= 0.01 && amount <= 10_000 ? normalized : null;
}

export function AmazonSearch() {
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [items, setItems] = useState<AmazonSearchItem[]>([]);
  const [page, setPage] = useState(0);
  const [totalResultCount, setTotalResultCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [message, setMessage] = useState("");
  const [offerDetails, setOfferDetails] = useState<
    Record<string, AmazonOfferLink>
  >({});
  const [offersUpdatedAt, setOffersUpdatedAt] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [primeOnly, setPrimeOnly] = useState(false);
  const [minRating, setMinRating] = useState<"" | "3" | "4">("");
  const [sortBy, setSortBy] = useState("Relevance");
  const [activeFilters, setActiveFilters] =
    useState<SearchFilters>(defaultFilters);
  const controllerRef = useRef<AbortController | null>(null);
  const offerControllerRef = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      controllerRef.current?.abort();
      offerControllerRef.current?.abort();
    },
    [],
  );

  async function requestOfferDetails(
    products: AmazonSearchItem[],
    replace: boolean,
  ) {
    const asins = products.map((product) => product.asin);
    if (asins.length === 0) return;
    offerControllerRef.current?.abort();
    const controller = new AbortController();
    offerControllerRef.current = controller;
    if (replace) {
      setOfferDetails({});
      setOffersUpdatedAt("");
    }

    try {
      const response = await fetch("/api/amazon/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asins }),
        signal: controller.signal,
      });
      if (!response.ok) return;
      const result = (await response.json()) as AmazonOfferLinkResponse;
      setOfferDetails((current) => ({
        ...(replace ? {} : current),
        ...Object.fromEntries(result.items.map((item) => [item.asin, item])),
      }));
      if (result.offersUpdatedAt) setOffersUpdatedAt(result.offersUpdatedAt);
    } catch {
      // Search results remain usable when current offer details are unavailable.
    }
  }

  async function requestSearch(
    searchQuery: string,
    requestedPage: number,
    append: boolean,
    filters: SearchFilters,
  ) {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setStatus(append ? "loading-more" : "loading");
    setMessage("");

    try {
      const response = await fetch("/api/amazon/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          page: requestedPage,
          ...filters,
        }),
        signal: controller.signal,
      });
      const payload: unknown = await response.json();
      if (!response.ok) {
        const errorMessage =
          payload &&
          typeof payload === "object" &&
          "error" in payload &&
          typeof payload.error === "string"
            ? payload.error
            : "Amazon search is temporarily unavailable.";
        throw new Error(errorMessage);
      }

      const result = payload as AmazonSearchResponse;
      setItems((current) => {
        const candidates = append
          ? [...current, ...result.items]
          : result.items;
        return [
          ...new Map(candidates.map((item) => [item.asin, item])).values(),
        ];
      });
      setActiveQuery(result.query);
      setPage(result.page);
      setTotalResultCount(result.totalResultCount);
      setHasMore(result.hasMore);
      setStatus("success");
      void requestOfferDetails(result.items, !append);
      if (result.items.length === 0 && !append)
        setMessage(
          "Amazon didn’t return any Baby products for that search. Try a different phrase.",
        );
    } catch (error) {
      if (controller.signal.aborted) return;
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Amazon search is temporarily unavailable.",
      );
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
    const filters = getSelectedFilters();
    if (!filters) return;
    setItems([]);
    setPage(0);
    setHasMore(false);
    setActiveFilters(filters);
    void requestSearch(normalized, 1, false, filters);
  }

  function chooseSuggestion(suggestion: string) {
    const filters = getSelectedFilters();
    if (!filters) return;
    setQuery(suggestion);
    setItems([]);
    setPage(0);
    setHasMore(false);
    setActiveFilters(filters);
    void requestSearch(suggestion, 1, false, filters);
  }

  function getSelectedFilters(): SearchFilters | null {
    const validatedMin = validatedPrice(minPrice);
    const validatedMax = validatedPrice(maxPrice);
    if (validatedMin === null || validatedMax === null) {
      setStatus("error");
      setMessage(
        "Enter prices between $0.01 and $10,000 using no more than two decimal places.",
      );
      return null;
    }
    if (
      validatedMin &&
      validatedMax &&
      Number(validatedMin) > Number(validatedMax)
    ) {
      setStatus("error");
      setMessage("The minimum price cannot be higher than the maximum price.");
      return null;
    }
    return {
      minPrice: validatedMin,
      maxPrice: validatedMax,
      primeOnly,
      minRating: minRating ? (Number(minRating) as 3 | 4) : undefined,
      sortBy,
    };
  }

  function clearFilters() {
    setMinPrice("");
    setMaxPrice("");
    setPrimeOnly(false);
    setMinRating("");
    setSortBy("Relevance");
  }

  const initialLoading = status === "loading";
  const loadingMore = status === "loading-more";
  const filtersActive = Boolean(
    minPrice || maxPrice || primeOnly || minRating || sortBy !== "Relevance",
  );

  return (
    <div>
      <form
        onSubmit={submitSearch}
        className="rounded-[2rem] border border-[#063f5b]/8 bg-white p-5 shadow-[0_18px_45px_-32px_rgba(6,63,91,.4)] sm:p-7"
      >
        <label
          htmlFor="amazon-search-query"
          className="text-sm font-extrabold text-[#063f5b]"
        >
          What are you looking for?
        </label>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#063f5b]/40"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
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
          <button
            type="submit"
            disabled={initialLoading || loadingMore}
            className="h-13 rounded-2xl bg-[#009dcc] px-7 text-sm font-extrabold text-white transition hover:bg-[#0784b0] disabled:cursor-wait disabled:opacity-60"
          >
            {initialLoading ? "Searching…" : "Search Amazon"}
          </button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#063f5b]/55">
          <span className="font-bold">Popular:</span>
          {suggestedSearches.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => chooseSuggestion(suggestion)}
              disabled={initialLoading || loadingMore}
              className="rounded-full bg-[#e8f8fc] px-3 py-1.5 font-bold transition hover:bg-[#d2f2f9] disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>
        {/* <div className="mt-5 border-t border-[#063f5b]/8 pt-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#063f5b]/55">
              Refine results
            </p>
            {filtersActive && (
              <button
                type="button"
                onClick={clearFilters}
                disabled={initialLoading || loadingMore}
                className="text-xs font-bold text-[#009dcc] hover:underline disabled:opacity-50"
              >
                Clear filters
              </button>
            )}
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <label className="grid gap-1.5 text-xs font-bold text-[#063f5b]">
              Minimum price
              <span className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#063f5b]/45">
                  $
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={minPrice}
                  onChange={(event) => setMinPrice(event.target.value)}
                  placeholder="Any"
                  className="h-11 w-full rounded-xl border border-[#063f5b]/15 bg-[#fbfeff] pl-7 pr-3 font-normal outline-none focus:border-[#009dcc] focus:ring-3 focus:ring-[#009dcc]/15"
                />
              </span>
            </label>
            <label className="grid gap-1.5 text-xs font-bold text-[#063f5b]">
              Maximum price
              <span className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#063f5b]/45">
                  $
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
                  placeholder="Any"
                  className="h-11 w-full rounded-xl border border-[#063f5b]/15 bg-[#fbfeff] pl-7 pr-3 font-normal outline-none focus:border-[#009dcc] focus:ring-3 focus:ring-[#009dcc]/15"
                />
              </span>
            </label>
            <label className="grid gap-1.5 text-xs font-bold text-[#063f5b]">
              Customer rating
              <select
                value={minRating}
                onChange={(event) =>
                  setMinRating(event.target.value as "" | "3" | "4")
                }
                className="h-11 rounded-xl border border-[#063f5b]/15 bg-[#fbfeff] px-3 font-normal outline-none focus:border-[#009dcc] focus:ring-3 focus:ring-[#009dcc]/15"
              >
                <option value="">Any rating</option>
                <option value="4">4 stars & up</option>
                <option value="3">3 stars & up</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-xs font-bold text-[#063f5b]">
              Sort by
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="h-11 rounded-xl border border-[#063f5b]/15 bg-[#fbfeff] px-3 font-normal outline-none focus:border-[#009dcc] focus:ring-3 focus:ring-[#009dcc]/15"
              >
                <option value="Relevance">Relevance</option>
                <option value="Featured">Featured</option>
                <option value="NewestArrivals">Newest arrivals</option>
                <option value="Price:LowToHigh">Price: low to high</option>
                <option value="Price:HighToLow">Price: high to low</option>
                <option value="AvgCustomerReviews">Customer reviews</option>
              </select>
            </label>
            <label className="flex h-11 items-center gap-2 self-end rounded-xl border border-[#063f5b]/15 bg-[#fbfeff] px-3 text-xs font-bold text-[#063f5b]">
              <input
                type="checkbox"
                checked={primeOnly}
                onChange={(event) => setPrimeOnly(event.target.checked)}
                className="size-4 accent-[#009dcc]"
              />
              Prime eligible
            </label>
          </div>
          <p className="mt-3 text-[11px] leading-5 text-[#063f5b]/45">
            Filters apply when you start a new search. Price filters use US
            dollars.
          </p>
        </div> */}
      </form>

      <div
        aria-live="polite"
        aria-atomic="true"
        className="mt-5 min-h-6 text-sm text-[#063f5b]/65"
      >
        {message ||
          (initialLoading
            ? "Searching Amazon’s Baby catalog…"
            : items.length > 0
              ? `Showing ${items.length} of ${totalResultCount.toLocaleString()} results for “${activeQuery}”.`
              : "")}
      </div>

      {items.length > 0 && (
        <>
          <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {items.map((item) => (
              <AmazonResultCard
                key={item.asin}
                item={item}
                offer={offerDetails[item.asin]}
              />
            ))}
          </div>
          <div className="mt-10 text-center">
            {hasMore && page < 3 ? (
              <button
                type="button"
                onClick={() =>
                  void requestSearch(activeQuery, page + 1, true, activeFilters)
                }
                disabled={loadingMore}
                className="rounded-full border border-[#063f5b]/15 bg-white px-7 py-3.5 text-sm font-extrabold text-[#063f5b] transition hover:border-[#009dcc] hover:bg-[#e8f8fc] disabled:cursor-wait disabled:opacity-60"
              >
                {loadingMore ? "Loading more…" : "Load more Amazon results"}
              </button>
            ) : (
              <p className="text-sm font-semibold text-[#063f5b]/50">
                You’ve reached the end of the available results for this search.
              </p>
            )}
          </div>
          <p className="mx-auto mt-8 max-w-3xl rounded-2xl bg-[#fff7df] px-5 py-4 text-center text-xs leading-5 text-[#735a16]">
            Amazon product titles, images, links, prices, and availability are
            provided by Amazon. Prices and availability may change; the
            information shown on Amazon when you purchase applies. As an Amazon
            Associate, MishBaby earns from qualifying purchases.
            {offersUpdatedAt && (
              <>
                {" "}
                Offer information checked {formatOfferTime(offersUpdatedAt)}.
              </>
            )}
          </p>
        </>
      )}
    </div>
  );
}

function formatOfferTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(value));
}

function availabilityLabel(offer?: AmazonOfferLink) {
  if (!offer?.availability) return "";
  if (offer.availability.message) return offer.availability.message;
  const labels: Record<string, string> = {
    INSTOCK: "In stock",
    IN_STOCK: "In stock",
    INSTOCKSCARCE: "Limited availability",
    OUTOFSTOCK: "Out of stock",
    OUT_OF_STOCK: "Out of stock",
    PREORDER: "Available for preorder",
    UNAVAILABLE: "Currently unavailable",
    LEADTIME: "Usually ships later",
    AVAILABLEDATE: "Available at a later date",
    AVAILABLE_DATE: "Available at a later date",
  };
  return labels[offer.availability.type] ?? "Check availability on Amazon";
}

function AmazonResultCard({
  item,
  offer,
}: {
  item: AmazonSearchItem;
  offer?: AmazonOfferLink;
}) {
  const destinationUrl = offer?.detailPageUrl ?? item.detailPageUrl;
  const availability = availabilityLabel(offer);
  return (
    <article className="group flex overflow-hidden rounded-2xl border border-[#063f5b]/8 bg-white shadow-[0_16px_36px_-28px_rgba(6,63,91,.4)] transition duration-300 hover:-translate-y-1 sm:rounded-[2rem]">
      <a
        href={destinationUrl}
        target="_blank"
        rel="sponsored nofollow noopener noreferrer"
        className="flex w-full flex-col focus-visible:outline-offset-[-3px]"
        aria-label={`View ${item.title} on Amazon (opens in a new tab)`}
      >
        <div className="relative grid aspect-square place-items-center overflow-hidden bg-white p-3 sm:aspect-[4/3]">
          {item.image ? (
            <Image
              src={item.image.url}
              alt=""
              fill
              sizes="(max-width: 1024px) 50vw, 272px"
              className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03] sm:p-5"
            />
          ) : (
            <svg
              viewBox="0 0 96 96"
              className="size-20 text-[#009dcc]"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 35 48 20l27 15v34c0 7-5 12-12 12H33c-7 0-12-5-12-12V35Z" />
              <path d="M36 52c0-5 4-9 9-9 3 0 5 1 7 4 2-3 4-4 7-4 5 0 9 4 9 9 0 9-16 17-16 17S36 61 36 52Z" />
            </svg>
          )}
        </div>
        <div className="flex flex-1 flex-col p-3 sm:p-5">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#009dcc] sm:text-xs">
            Amazon result
          </p>
          <h2 className="mt-2 line-clamp-4 text-sm font-extrabold leading-5 tracking-[-0.025em] text-[#063f5b] sm:text-base sm:leading-6">
            {item.title}
          </h2>
          {(offer?.price || availability) && (
            <div className="mt-3 border-t border-[#063f5b]/8 pt-3">
              {offer?.price && (
                <p className="text-base font-black text-[#063f5b] sm:text-lg">
                  {offer.price.displayAmount}
                </p>
              )}
              {availability && (
                <p className="mt-1 text-[11px] font-semibold leading-4 text-[#087b54] sm:text-xs">
                  {availability}
                </p>
              )}
            </div>
          )}
          <span className="mt-auto pt-4 text-xs font-extrabold text-[#009dcc] sm:text-sm">
            View on Amazon <span aria-hidden="true">↗</span>
          </span>
        </div>
      </a>
    </article>
  );
}
