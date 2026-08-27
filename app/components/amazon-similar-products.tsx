"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useNearViewport } from "@/app/hooks/use-near-viewport";

type AmazonSimilarItem = {
  asin: string;
  title: string;
  detailPageUrl: string;
  image?: {
    url: string;
    width: number;
    height: number;
  };
};

type AmazonSearchPayload = {
  items: AmazonSimilarItem[];
};

type AmazonSimilarProductsProps = {
  productName: string;
  categoryName: string;
  currentAsin?: string;
};

type AmazonGuideProductsProps = {
  guideTitle: string;
  categoryName: string;
  excludedAsins?: string[];
};

type AmazonCategoryProductsProps = {
  categoryName: string;
  topics: string[];
  excludedAsins?: string[];
};

type AmazonRecommendationsProps = {
  searchTerms: string[];
  excludedAsins?: string[];
  maximumResults: number;
  eyebrow: string;
  heading: string;
  description: string;
  compactOnMobile?: boolean;
};

const categoryAmazonSearchTerms: Record<string, string[]> = {
  "Safety & Comfort": ["baby safety essentials"],
};

function buildSearchQuery(searchTerms: string[]) {
  const normalized = searchTerms.join(" ").trim().replace(/\s+/g, " ");
  if (normalized.length <= 80) return normalized;

  const shortened = normalized.slice(0, 80);
  const lastSpace = shortened.lastIndexOf(" ");
  return (lastSpace >= 20 ? shortened.slice(0, lastSpace) : shortened).trim();
}

export function AmazonSimilarProducts({ productName, categoryName, currentAsin }: AmazonSimilarProductsProps) {
  return (
    <AmazonRecommendations
      searchTerms={[productName, categoryName]}
      excludedAsins={currentAsin ? [currentAsin] : []}
      maximumResults={4}
      eyebrow="More to explore on Amazon"
      heading="Similar products you may like."
      description="Live Amazon results selected from this product's name and category."
    />
  );
}

export function AmazonGuideProducts({ guideTitle, categoryName, excludedAsins = [] }: AmazonGuideProductsProps) {
  return (
    <AmazonRecommendations
      searchTerms={[guideTitle, categoryName]}
      excludedAsins={excludedAsins}
      maximumResults={8}
      eyebrow="Related products on Amazon"
      heading="Amazon finds for this guide."
      description="Live Amazon results selected from this guide's topic and related category."
      compactOnMobile
    />
  );
}

export function AmazonCategoryProducts({ categoryName, topics, excludedAsins = [] }: AmazonCategoryProductsProps) {
  const searchTerms = categoryAmazonSearchTerms[categoryName] ?? [categoryName, ...topics];

  return (
    <AmazonRecommendations
      searchTerms={searchTerms}
      excludedAsins={excludedAsins}
      maximumResults={8}
      eyebrow="More products on Amazon"
      heading={`Amazon finds for ${categoryName}.`}
      description={`Live Amazon results selected from ${categoryName.toLowerCase()} and its related topics.`}
      compactOnMobile
    />
  );
}

function AmazonRecommendations({ searchTerms, excludedAsins = [], maximumResults, eyebrow, heading, description, compactOnMobile = false }: AmazonRecommendationsProps) {
  const [items, setItems] = useState<AmazonSimilarItem[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "empty" | "error">("idle");
  const { elementRef, isNearViewport } = useNearViewport<HTMLElement>();
  const searchQuery = buildSearchQuery(searchTerms);
  const excludedAsinKey = excludedAsins.map((asin) => asin.trim().toUpperCase()).sort().join(",");

  useEffect(() => {
    if (!isNearViewport) return;

    const controller = new AbortController();

    async function loadSimilarProducts() {
      setItems([]);
      setStatus("loading");

      try {
        const response = await fetch("/api/amazon/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: searchQuery,
            page: 1,
            primeOnly: false,
            sortBy: "Relevance",
          }),
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Amazon search unavailable");
        const payload = await response.json() as AmazonSearchPayload;
        const excludedAsinSet = new Set(excludedAsinKey ? excludedAsinKey.split(",") : []);
        const similarItems = payload.items
          .filter((item) => !excludedAsinSet.has(item.asin))
          .slice(0, maximumResults);

        setItems(similarItems);
        setStatus(similarItems.length > 0 ? "success" : "empty");
      } catch {
        if (!controller.signal.aborted) setStatus("error");
      }
    }

    void loadSimilarProducts();
    return () => controller.abort();
  }, [excludedAsinKey, isNearViewport, maximumResults, searchQuery]);

  return (
    <section ref={elementRef} className={`border-y border-[#063f5b]/6 bg-[#f1fbfe] px-5 sm:px-8 md:py-20 ${compactOnMobile ? "py-12 sm:py-16" : "py-14"}`}>
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">{eyebrow}</p>
            <h2 className={`mt-3 font-display font-semibold tracking-[-0.045em] text-[#063f5b] sm:text-4xl ${compactOnMobile ? "break-words text-3xl leading-tight" : "text-4xl"}`}>{heading}</h2>
            <p className="mt-4 text-base leading-7 text-[#063f5b]/65">{description}</p>
          </div>
          <Link href="/amazon-finds" className="shrink-0 text-sm font-extrabold text-[#009dcc] transition-colors hover:text-[#0784b0]">Search Amazon <span aria-hidden="true">→</span></Link>
        </div>

        <div aria-live="polite" aria-busy={status === "loading"}>
          {(status === "idle" || status === "loading") && (
            <div className={`grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 ${compactOnMobile ? "mt-7 sm:mt-9" : "mt-9"}`}>
              {Array.from({ length: maximumResults }, (_, item) => (
                <div key={item} className="overflow-hidden rounded-2xl border border-[#063f5b]/8 bg-white sm:rounded-[2rem]">
                  <div className="aspect-square animate-pulse bg-[#e4f6fa] sm:aspect-[4/3]" />
                  <div className="space-y-3 p-4 sm:p-5">
                    <div className="h-3 w-24 animate-pulse rounded bg-[#d4eff5]" />
                    <div className="h-4 w-full animate-pulse rounded bg-[#e4f6fa]" />
                    <div className="h-4 w-3/4 animate-pulse rounded bg-[#e4f6fa]" />
                  </div>
                </div>
              ))}
              <span className="sr-only">Loading products from Amazon.</span>
            </div>
          )}

          {status === "success" && (
            <div className={`grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 ${compactOnMobile ? "mt-7 sm:mt-9" : "mt-9"}`}>
              {items.map((item) => <AmazonSimilarProductCard key={item.asin} item={item} />)}
            </div>
          )}

          {(status === "empty" || status === "error") && (
            <div className="mt-9 rounded-3xl border border-[#063f5b]/8 bg-white px-6 py-7 text-sm text-[#063f5b]/65">
              Amazon products aren&apos;t available right now. You can still browse with <Link href="/amazon-finds" className="font-extrabold text-[#009dcc] hover:underline">Amazon Finds</Link>.
            </div>
          )}
        </div>

        {status === "success" && (
          <p className={`mx-auto max-w-3xl rounded-2xl bg-[#fff7df] py-4 text-xs leading-5 text-[#735a16] ${compactOnMobile ? "mt-6 px-4 text-left sm:mt-8 sm:px-5 sm:text-center" : "mt-8 px-5 text-center"}`}>
            Product titles, images, and links are provided by Amazon and may change. As an Amazon Associate, MishBaby earns from qualifying purchases.
          </p>
        )}
      </div>
    </section>
  );
}

function AmazonSimilarProductCard({ item }: { item: AmazonSimilarItem }) {
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
          <h3 className="mt-2 line-clamp-4 text-sm font-extrabold leading-5 tracking-[-0.025em] text-[#063f5b] sm:text-base sm:leading-6">{item.title}</h3>
          <span className="mt-auto pt-4 text-xs font-extrabold text-[#009dcc] sm:text-sm">View on Amazon <span aria-hidden="true">↗</span></span>
        </div>
      </a>
    </article>
  );
}
