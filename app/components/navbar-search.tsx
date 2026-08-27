"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { ProductSearchItem } from "@/lib/products";

const recentSearchesKey = "mishbaby-recent-product-searches";
const recentSearchLimit = 5;
const suggestionLimit = 5;

function readRecentSearches() {
  try {
    const storedValue = window.localStorage.getItem(recentSearchesKey);
    const parsedValue: unknown = storedValue ? JSON.parse(storedValue) : [];

    return Array.isArray(parsedValue)
      ? parsedValue.filter((value): value is string => typeof value === "string" && value.trim().length > 0).slice(0, recentSearchLimit)
      : [];
  } catch {
    return [];
  }
}

function saveRecentSearches(searches: string[]) {
  try {
    window.localStorage.setItem(recentSearchesKey, JSON.stringify(searches));
  } catch {
    // Search remains usable when browser storage is unavailable.
  }
}

export function NavbarSearch({
  products,
  focusRequested = false,
  onNavigate,
  onOpenRequest,
  onRequestClose,
}: {
  products: ProductSearchItem[];
  focusRequested?: boolean;
  onNavigate?: () => void;
  onOpenRequest?: () => void;
  onRequestClose?: () => void;
}) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const suggestions = useMemo(() => {
    if (normalizedQuery.length < 2) return [];

    return products
      .map((product) => {
        const normalizedName = product.name.toLocaleLowerCase();
        const normalizedSummary = product.summary.toLocaleLowerCase();
        const rank = normalizedName.startsWith(normalizedQuery)
          ? 0
          : normalizedName.includes(normalizedQuery)
            ? 1
            : normalizedSummary.includes(normalizedQuery)
              ? 2
              : 3;

        return { product, rank };
      })
      .filter(({ rank }) => rank < 3)
      .sort((first, second) => first.rank - second.rank || first.product.name.localeCompare(second.product.name))
      .slice(0, suggestionLimit)
      .map(({ product }) => product);
  }, [normalizedQuery, products]);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenRequest?.();
        window.requestAnimationFrame(() => inputRef.current?.focus());
      }
    }

    function handlePointerDown(event: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleShortcut);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("keydown", handleShortcut);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [onOpenRequest]);

  useEffect(() => {
    if (focusRequested) inputRef.current?.focus();
  }, [focusRequested]);

  function openSearch() {
    setRecentSearches(readRecentSearches());
    setIsOpen(true);
    setActiveSuggestionIndex(-1);
  }

  function rememberSearch(value: string) {
    const trimmedQuery = value.trim();
    if (!trimmedQuery) return;

    const nextRecentSearches = [
      trimmedQuery,
      ...recentSearches.filter((search) => search.toLocaleLowerCase() !== trimmedQuery.toLocaleLowerCase()),
    ].slice(0, recentSearchLimit);

    setRecentSearches(nextRecentSearches);
    saveRecentSearches(nextRecentSearches);
  }

  function runSearch(value: string) {
    const trimmedQuery = value.trim();
    if (!trimmedQuery) {
      inputRef.current?.focus();
      return;
    }

    setQuery(trimmedQuery);
    rememberSearch(trimmedQuery);
    setIsOpen(false);
    onNavigate?.();
    router.push(`/products?q=${encodeURIComponent(trimmedQuery)}`);
  }

  function openSuggestion(product: ProductSearchItem) {
    rememberSearch(query || product.name);
    setIsOpen(false);
    setActiveSuggestionIndex(-1);
    onNavigate?.();
    router.push(`/products/${product.slug}`);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runSearch(query);
  }

  function clearRecentSearches() {
    setRecentSearches([]);
    saveRecentSearches([]);
    inputRef.current?.focus();
  }

  const showSuggestions = isOpen && normalizedQuery.length >= 2;
  const showRecentSearches = isOpen && normalizedQuery.length === 0 && recentSearches.length > 0;
  const suggestionsId = "navbar-product-suggestions";
  const recentSearchesId = "navbar-recent-searches";
  const popupId = showSuggestions ? suggestionsId : showRecentSearches ? recentSearchesId : undefined;

  return (
    <div ref={containerRef} className="relative w-full">
      <form role="search" onSubmit={handleSubmit}>
        <label htmlFor="navbar-product-search" className="sr-only">Search products</label>
        <div className="relative">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#063f5b]/45">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref={inputRef}
            id="navbar-product-search"
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setIsOpen(true);
              setActiveSuggestionIndex(-1);
            }}
            onFocus={openSearch}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setIsOpen(false);
                inputRef.current?.blur();
                onRequestClose?.();
              } else if (showSuggestions && suggestions.length > 0 && event.key === "ArrowDown") {
                event.preventDefault();
                setActiveSuggestionIndex((current) => Math.min(current + 1, suggestions.length - 1));
              } else if (showSuggestions && suggestions.length > 0 && event.key === "ArrowUp") {
                event.preventDefault();
                setActiveSuggestionIndex((current) => Math.max(current - 1, 0));
              } else if (event.key === "Enter" && activeSuggestionIndex >= 0) {
                event.preventDefault();
                openSuggestion(suggestions[activeSuggestionIndex]);
              }
            }}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={Boolean(popupId)}
            aria-controls={popupId}
            aria-activedescendant={activeSuggestionIndex >= 0 ? `navbar-product-suggestion-${activeSuggestionIndex}` : undefined}
            autoComplete="off"
            maxLength={120}
            placeholder="Search products..."
            className="h-12 w-full rounded-xl border-2 border-[#009dcc]/80 bg-white pl-12 pr-15 text-sm font-semibold text-[#063f5b] outline-none transition placeholder:font-medium placeholder:text-[#063f5b]/45 focus:border-[#009dcc] focus:ring-3 focus:ring-[#009dcc]/15"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-[#063f5b]/10 bg-[#f7fcfe] px-2 py-1 text-[11px] font-bold text-[#063f5b]/55 sm:block" aria-label="Command or Control K">
            ⌘K
          </kbd>
        </div>
      </form>

      {showSuggestions && (
        <div id={suggestionsId} className="absolute left-0 right-0 top-[calc(100%+.5rem)] z-50 overflow-hidden rounded-2xl border border-[#063f5b]/10 bg-white shadow-[0_20px_45px_-24px_rgba(6,63,91,.45)]">
          <div className="border-b border-[#063f5b]/8 px-4 py-3">
            <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#063f5b]/60">Product suggestions</p>
          </div>
          {suggestions.length > 0 ? (
            <ul role="listbox" aria-label="Product suggestions" className="p-2">
              {suggestions.map((product, index) => (
                <li key={product.slug} role="presentation">
                  <button
                    id={`navbar-product-suggestion-${index}`}
                    type="button"
                    role="option"
                    aria-selected={activeSuggestionIndex === index}
                    onMouseEnter={() => setActiveSuggestionIndex(index)}
                    onClick={() => openSuggestion(product)}
                    className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition ${activeSuggestionIndex === index ? "bg-[#e8f8fc]" : "hover:bg-[#f1fbfe]"}`}
                  >
                    <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-[#e8f8fc]">
                      {product.image && <Image src={product.image.src} alt="" fill sizes="48px" className="object-cover" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-extrabold text-[#063f5b]">{product.name}</span>
                      <span className="mt-0.5 block truncate text-xs text-[#063f5b]/55">{product.summary}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-5 text-sm font-semibold text-[#063f5b]/55">No matching products found.</p>
          )}
          <button type="button" onClick={() => runSearch(query)} className="flex w-full items-center justify-between border-t border-[#063f5b]/8 px-4 py-3 text-left text-xs font-extrabold text-[#009dcc] transition hover:bg-[#f1fbfe]">
            <span className="truncate">See all results for “{query.trim()}”</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      )}

      {showRecentSearches && (
        <div id={recentSearchesId} className="absolute left-0 right-0 top-[calc(100%+.5rem)] z-50 overflow-hidden rounded-2xl border border-[#063f5b]/10 bg-white shadow-[0_20px_45px_-24px_rgba(6,63,91,.45)]">
          <div className="flex items-center justify-between border-b border-[#063f5b]/8 px-4 py-3">
            <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.1em] text-[#063f5b]/60">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
              Recent searches
            </p>
            <button type="button" onClick={clearRecentSearches} className="text-xs font-bold text-[#063f5b]/50 transition hover:text-[#009dcc]">Clear</button>
          </div>
          <ul className="p-2">
            {recentSearches.map((search) => (
              <li key={search}>
                <button type="button" onClick={() => runSearch(search)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[#063f5b]/75 transition hover:bg-[#e8f8fc] hover:text-[#007fa5]">
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-4 shrink-0 text-[#063f5b]/35"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
                  <span className="truncate">{search}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
