"use client";

import Link from "next/link";
import { useState } from "react";

type FilterOption = {
  id: string;
  name: string;
};

type MobileProductFiltersProps = {
  categories: FilterOption[];
  merchants: FilterOption[];
  selectedCategoryId?: string;
  selectedMerchantId?: string;
  searchQuery: string;
  selectedSort: "featured" | "newest" | "name";
};

export function MobileProductFilters({ categories, merchants, selectedCategoryId, selectedMerchantId, searchQuery, selectedSort }: MobileProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const activeFilterCount = Number(Boolean(selectedCategoryId)) + Number(Boolean(selectedMerchantId));
  const selectedCategory = categories.find((category) => category.id === selectedCategoryId);
  const selectedMerchant = merchants.find((merchant) => merchant.id === selectedMerchantId);

  function filterHref(categoryId?: string, merchantId?: string) {
    const params = new URLSearchParams();
    if (categoryId) params.set("category", categoryId);
    if (merchantId) params.set("merchant", merchantId);
    if (searchQuery) params.set("q", searchQuery);
    if (selectedSort !== "newest") params.set("sort", selectedSort);
    const query = params.toString();
    return query ? `/products?${query}` : "/products";
  }

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="mobile-product-filters"
        onClick={() => setIsOpen((current) => !current)}
        className="flex min-h-12 w-full items-center justify-between gap-4 rounded-2xl border border-[#063f5b]/10 bg-white px-4 py-3 text-left shadow-[0_12px_30px_-26px_rgba(6,63,91,.45)]"
      >
        <span>
          <span className="flex items-center gap-2 text-sm font-extrabold text-[#063f5b]">
            Filters
            {activeFilterCount > 0 && <span className="grid size-5 place-items-center rounded-full bg-[#009dcc] text-[11px] text-white">{activeFilterCount}</span>}
          </span>
          <span className="mt-0.5 block text-xs text-[#063f5b]/55">
            {[selectedCategory?.name, selectedMerchant?.name].filter(Boolean).join(" · ") || "All categories and merchants"}
          </span>
        </span>
        <svg viewBox="0 0 20 20" aria-hidden="true" className={`size-5 shrink-0 text-[#009dcc] transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m5 7.5 5 5 5-5" />
        </svg>
      </button>

      {isOpen && (
        <div id="mobile-product-filters" className="mt-3 rounded-3xl border border-[#063f5b]/10 bg-[#f7fcfe] p-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#063f5b]/45">Category</p>
            <nav className="mt-3 flex flex-wrap gap-2" aria-label="Filter products by category">
              <Link href={filterHref(undefined, selectedMerchantId)} aria-current={!selectedCategoryId ? "page" : undefined} className={`rounded-full px-3.5 py-2 text-xs font-extrabold transition ${!selectedCategoryId ? "bg-[#009dcc] text-white" : "border border-[#063f5b]/10 bg-white text-[#063f5b]/70"}`}>All</Link>
              {categories.map((category) => (
                <Link key={category.id} href={filterHref(category.id, selectedMerchantId)} aria-current={selectedCategoryId === category.id ? "page" : undefined} className={`rounded-full px-3.5 py-2 text-xs font-extrabold transition ${selectedCategoryId === category.id ? "bg-[#009dcc] text-white" : "border border-[#063f5b]/10 bg-white text-[#063f5b]/70"}`}>{category.name}</Link>
              ))}
            </nav>
          </div>

          {merchants.length > 0 && (
            <div className="mt-5 border-t border-[#063f5b]/8 pt-5">
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#063f5b]/45">Merchant</p>
              <nav className="mt-3 flex flex-wrap gap-2" aria-label="Filter products by merchant">
                <Link href={filterHref(selectedCategoryId)} aria-current={!selectedMerchantId ? "page" : undefined} className={`rounded-full px-3.5 py-2 text-xs font-extrabold transition ${!selectedMerchantId ? "bg-[#009dcc] text-white" : "border border-[#063f5b]/10 bg-white text-[#063f5b]/70"}`}>All</Link>
                {merchants.map((merchant) => (
                  <Link key={merchant.id} href={filterHref(selectedCategoryId, merchant.id)} aria-current={selectedMerchantId === merchant.id ? "page" : undefined} className={`rounded-full px-3.5 py-2 text-xs font-extrabold transition ${selectedMerchantId === merchant.id ? "bg-[#009dcc] text-white" : "border border-[#063f5b]/10 bg-white text-[#063f5b]/70"}`}>{merchant.name}</Link>
                ))}
              </nav>
            </div>
          )}

          {activeFilterCount > 0 && (
            <Link href={filterHref()} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[#009dcc]/30 bg-white px-4 text-sm font-extrabold text-[#009dcc]">
              Clear category and merchant
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
