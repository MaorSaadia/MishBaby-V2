"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { AliExpressSearchItem, AliExpressSearchResponse } from "@/lib/aliexpress-affiliate";

type AliExpressSimilarProductsProps = {
  productName: string;
  currentOfferUrl?: string;
};

type AliExpressGuideProductsProps = {
  guideTitle: string;
  categoryName: string;
  excludedOfferUrls?: string[];
};

type AliExpressCategoryProductsProps = {
  categoryName: string;
  topics: string[];
  excludedOfferUrls?: string[];
};

type AliExpressRecommendationsProps = {
  searchQuery: string;
  excludedOfferUrls?: string[];
  maximumResults: number;
  eyebrow: string;
  heading: string;
  description: string;
};

const guideSearchStopWords = new Set([
  "a",
  "an",
  "and",
  "before",
  "checklist",
  "choosing",
  "comfortable",
  "creating",
  "everyday",
  "first",
  "for",
  "guide",
  "how",
  "in",
  "parents",
  "practical",
  "safe",
  "setup",
  "the",
  "time",
  "tips",
  "to",
  "what",
  "your",
]);

const categorySearchQueries: Record<string, string> = {
  "Baby Essentials": "baby essentials",
  "Feeding & Mealtime": "baby feeding",
  "Nursery & Sleep": "baby sleep",
  "Bath & Care": "baby bath",
  "Safety & Comfort": "baby safety",
  "Toys & Play": "infant toy",
  "Baby Clothing": "infant clothes",
};

function buildSearchQuery(productName: string) {
  const normalized = productName.trim().replace(/\s+/g, " ");
  if (normalized.length <= 80) return normalized;

  const shortened = normalized.slice(0, 80);
  const lastSpace = shortened.lastIndexOf(" ");
  return (lastSpace >= 20 ? shortened.slice(0, lastSpace) : shortened).trim();
}

function buildGuideSearchQuery(guideTitle: string, categoryName: string) {
  const terms = guideTitle
    .normalize("NFKD")
    .toLocaleLowerCase("en-US")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter((term) => term && !guideSearchStopWords.has(term));
  const uniqueTerms = [...new Set(terms)];
  if (uniqueTerms.includes("baby") && uniqueTerms.includes("nursery")) {
    return "baby nursery essentials";
  }

  const conciseTerms = uniqueTerms.slice(0, 4);
  return buildSearchQuery(conciseTerms.join(" ") || categoryName);
}

function buildCategorySearchQuery(categoryName: string, topics: string[]) {
  const configuredQuery = categorySearchQueries[categoryName];
  if (configuredQuery) return configuredQuery;

  const normalizedName = categoryName.toLocaleLowerCase("en-US").includes("baby")
    ? categoryName
    : `baby ${categoryName}`;
  return buildSearchQuery(normalizedName || topics[0] || "baby essentials");
}

function productIdFromOfferUrl(offerUrl?: string) {
  if (!offerUrl) return undefined;

  try {
    const url = new URL(offerUrl);
    const pathMatch = url.pathname.match(/\/(?:item|i)\/(\d{5,24})(?:\.html)?(?:\/|$)/i);
    const queryValue = url.searchParams.get("productId") ?? url.searchParams.get("product_id");
    const productId = pathMatch?.[1] ?? queryValue?.trim();
    return productId && /^\d{5,24}$/.test(productId) ? productId : undefined;
  } catch {
    return undefined;
  }
}

export function AliExpressSimilarProducts({ productName, currentOfferUrl }: AliExpressSimilarProductsProps) {
  return (
    <AliExpressRecommendations
      searchQuery={buildSearchQuery(productName)}
      excludedOfferUrls={currentOfferUrl ? [currentOfferUrl] : []}
      maximumResults={4}
      eyebrow="More to explore on AliExpress"
      heading="Similar AliExpress products."
      description="Live AliExpress results selected from this product's name."
    />
  );
}

export function AliExpressGuideProducts({ guideTitle, categoryName, excludedOfferUrls = [] }: AliExpressGuideProductsProps) {
  return (
    <AliExpressRecommendations
      searchQuery={buildGuideSearchQuery(guideTitle, categoryName)}
      excludedOfferUrls={excludedOfferUrls}
      maximumResults={8}
      eyebrow="Related products on AliExpress"
      heading="AliExpress finds for this guide."
      description="Live AliExpress results selected from this guide's topic."
    />
  );
}

export function AliExpressCategoryProducts({ categoryName, topics, excludedOfferUrls = [] }: AliExpressCategoryProductsProps) {
  return (
    <AliExpressRecommendations
      searchQuery={buildCategorySearchQuery(categoryName, topics)}
      excludedOfferUrls={excludedOfferUrls}
      maximumResults={8}
      eyebrow="More products on AliExpress"
      heading={`AliExpress finds for ${categoryName}.`}
      description={`Live AliExpress results selected for ${categoryName.toLowerCase()}.`}
    />
  );
}

function AliExpressRecommendations({ searchQuery, excludedOfferUrls = [], maximumResults, eyebrow, heading, description }: AliExpressRecommendationsProps) {
  const [items, setItems] = useState<AliExpressSearchItem[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "empty" | "error">("loading");
  const excludedProductIdKey = excludedOfferUrls
    .flatMap((offerUrl) => productIdFromOfferUrl(offerUrl) ?? [])
    .sort()
    .join(",");

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      setItems([]);
      setStatus("loading");

      try {
        const response = await fetch("/api/aliexpress/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: searchQuery, page: 1 }),
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("AliExpress search unavailable");

        const payload = await response.json() as AliExpressSearchResponse;
        const excludedProductIds = new Set(excludedProductIdKey ? excludedProductIdKey.split(",") : []);
        const recommendations = payload.items
          .filter((item) => !excludedProductIds.has(item.productId))
          .slice(0, maximumResults);

        setItems(recommendations);
        setStatus(recommendations.length > 0 ? "success" : "empty");
      } catch {
        if (!controller.signal.aborted) setStatus("error");
      }
    }

    void loadProducts();
    return () => controller.abort();
  }, [excludedProductIdKey, maximumResults, searchQuery]);

  return (
    <section className="border-b border-[#063f5b]/6 bg-[#f7fcfe] px-5 py-14 sm:px-8 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">{eyebrow}</p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.045em] text-[#063f5b]">{heading}</h2>
            <p className="mt-4 text-base leading-7 text-[#063f5b]/65">{description}</p>
          </div>
          <Link href="/aliexpress-finds" className="shrink-0 text-sm font-extrabold text-[#009dcc] transition-colors hover:text-[#0784b0]">Search AliExpress <span aria-hidden="true">→</span></Link>
        </div>

        <div aria-live="polite" aria-busy={status === "loading"}>
          {status === "loading" && (
            <div className="mt-9 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {Array.from({ length: maximumResults }, (_, item) => (
                <div key={item} className="overflow-hidden rounded-2xl border border-[#063f5b]/8 bg-white sm:rounded-[2rem]">
                  <div className="aspect-square animate-pulse bg-[#e4f6fa]" />
                  <div className="space-y-3 p-4 sm:p-5">
                    <div className="h-3 w-24 animate-pulse rounded bg-[#d4eff5]" />
                    <div className="h-4 w-full animate-pulse rounded bg-[#e4f6fa]" />
                    <div className="h-4 w-3/4 animate-pulse rounded bg-[#e4f6fa]" />
                  </div>
                </div>
              ))}
              <span className="sr-only">Loading similar products from AliExpress.</span>
            </div>
          )}

          {status === "success" && (
            <div className="mt-9 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {items.map((item) => <AliExpressRecommendationCard key={item.productId} item={item} />)}
            </div>
          )}

          {(status === "empty" || status === "error") && (
            <div className="mt-9 rounded-3xl border border-[#063f5b]/8 bg-white px-6 py-7 text-sm text-[#063f5b]/65">
              Similar AliExpress products aren&apos;t available right now. You can still browse with <Link href="/aliexpress-finds" className="font-extrabold text-[#009dcc] hover:underline">AliExpress Finds</Link>.
            </div>
          )}
        </div>

        {status === "success" && (
          <p className="mx-auto mt-8 max-w-3xl rounded-2xl bg-[#fff7df] px-5 py-4 text-center text-xs leading-5 text-[#735a16]">
            Product titles, images, and links are provided by AliExpress and may change. Shipping, availability, local currency, and final terms are confirmed on AliExpress. MishBaby may earn a commission from qualifying purchases at no additional cost to you.
          </p>
        )}
      </div>
    </section>
  );
}

function AliExpressRecommendationCard({ item }: { item: AliExpressSearchItem }) {
  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#063f5b]/8 bg-white shadow-[0_20px_45px_-35px_rgba(6,63,91,.5)] sm:rounded-[2rem]">
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
          <h3 className="mt-2 line-clamp-4 text-sm font-extrabold leading-5 tracking-[-0.025em] text-[#063f5b] sm:text-base sm:leading-6">{item.title}</h3>
          <span className="mt-auto pt-4 text-xs font-extrabold text-[#009dcc] sm:text-sm">View on AliExpress <span aria-hidden="true">↗</span></span>
        </div>
      </a>
    </article>
  );
}
