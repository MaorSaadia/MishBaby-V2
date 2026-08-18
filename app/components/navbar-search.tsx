"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";

const recentSearchesKey = "mishbaby-recent-product-searches";
const recentSearchLimit = 5;

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

export function NavbarSearch() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
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
  }, []);

  function openRecentSearches() {
    setRecentSearches(readRecentSearches());
    setIsOpen(true);
  }

  function runSearch(value: string) {
    const trimmedQuery = value.trim();
    if (!trimmedQuery) {
      inputRef.current?.focus();
      return;
    }

    const nextRecentSearches = [
      trimmedQuery,
      ...recentSearches.filter((search) => search.toLocaleLowerCase() !== trimmedQuery.toLocaleLowerCase()),
    ].slice(0, recentSearchLimit);

    setQuery(trimmedQuery);
    setRecentSearches(nextRecentSearches);
    saveRecentSearches(nextRecentSearches);
    setIsOpen(false);
    router.push(`/products?q=${encodeURIComponent(trimmedQuery)}`);
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

  const showRecentSearches = isOpen && recentSearches.length > 0;

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
            onChange={(event) => setQuery(event.target.value)}
            onFocus={openRecentSearches}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setIsOpen(false);
                inputRef.current?.blur();
              }
            }}
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

      {showRecentSearches && (
        <div id="navbar-recent-searches" className="absolute left-0 right-0 top-[calc(100%+.5rem)] z-50 overflow-hidden rounded-2xl border border-[#063f5b]/10 bg-white shadow-[0_20px_45px_-24px_rgba(6,63,91,.45)]">
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
