"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { AmazonOfferLinkResponse } from "@/lib/amazon-creators";
import type { ActiveOffer } from "@/lib/products";

type OfferComparisonProps = {
  offers: ActiveOffer[];
};

function formatVerifiedDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export function OfferComparison({ offers }: OfferComparisonProps) {
  const asinKey = useMemo(
    () => offers.flatMap((offer) => !offer.url && offer.amazonAsin ? [offer.amazonAsin] : []).sort().join(","),
    [offers],
  );
  const [amazonLinks, setAmazonLinks] = useState<Record<string, string>>({});
  const [resolvingAmazonLinks, setResolvingAmazonLinks] = useState(Boolean(asinKey));

  useEffect(() => {
    const asins = asinKey ? asinKey.split(",") : [];
    if (asins.length === 0) return;

    const controller = new AbortController();
    fetch("/api/amazon/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ asins }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Amazon offers are unavailable.");
        return response.json() as Promise<AmazonOfferLinkResponse>;
      })
      .then((response) => {
        setAmazonLinks(Object.fromEntries(response.items.map((item) => [item.asin, item.detailPageUrl])));
      })
      .catch(() => {
        if (!controller.signal.aborted) setAmazonLinks({});
      })
      .finally(() => {
        if (!controller.signal.aborted) setResolvingAmazonLinks(false);
      });

    return () => controller.abort();
  }, [asinKey]);

  return (
    <div className="overflow-hidden rounded-[2rem] border border-[#063f5b]/10 bg-white shadow-[0_18px_42px_-30px_rgba(6,63,91,.4)]">
      <div className="border-b border-[#063f5b]/8 bg-[#f7fcfe] px-6 py-5 sm:px-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">Available merchants</p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.035em] text-[#063f5b]">Compare your options</h2>
      </div>
      <div className="divide-y divide-[#063f5b]/8">
        {offers.length === 0 && (
          <div className="px-6 py-8 sm:px-8">
            <h3 className="font-extrabold text-[#063f5b]">No merchant offers are currently available</h3>
            <p className="mt-2 text-sm leading-6 text-[#063f5b]/60">We only show active offers with verified links. Please check back soon.</p>
          </div>
        )}
        {offers.map((offer) => {
          const merchant = offer.merchant;
          const resolvedUrl = offer.url ?? (offer.amazonAsin ? amazonLinks[offer.amazonAsin] : undefined);

          return (
            <div key={offer.id} className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <div className="flex items-center gap-4">
                <span className={`relative grid h-12 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border text-sm font-black ${merchant.logo ? "border-[#063f5b]/8 bg-white" : "border-transparent bg-[#e2f7fc] text-[#009dcc]"}`}>
                  {merchant.logo ? (
                    <Image src={merchant.logo.src} alt="" fill sizes="80px" className="object-contain p-2" />
                  ) : (
                    merchant.name.charAt(0)
                  )}
                </span>
                <div>
                  <h3 className="font-extrabold text-[#063f5b]">{merchant.name}</h3>
                  <p className="mt-1 text-sm text-[#063f5b]/55">Check the merchant for current price, availability, and delivery details.</p>
                  <p className="mt-1 text-xs font-semibold text-[#063f5b]/45">
                    {offer.amazonAsin ? "Amazon link refreshed automatically" : `Link verified ${formatVerifiedDate(offer.lastVerifiedAt)}`}
                  </p>
                </div>
              </div>
              {resolvedUrl ? (
                <a
                  href={resolvedUrl}
                  target="_blank"
                  rel={offer.affiliate ? "sponsored nofollow noopener noreferrer" : "noopener noreferrer"}
                  className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-[#009dcc] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#0784b0]"
                  aria-label={`View ${merchant.name} offer for this product (opens in a new tab)`}
                >
                  View offer
                  <span aria-hidden="true">↗</span>
                </a>
              ) : (
                <span className="inline-flex w-fit shrink-0 rounded-full bg-[#e8f8fc] px-5 py-3 text-sm font-extrabold text-[#063f5b]/55" role="status">
                  {offer.amazonAsin && resolvingAmazonLinks ? "Loading offer…" : "Offer unavailable"}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <p className="border-t border-[#063f5b]/8 px-6 py-4 text-xs leading-5 text-[#063f5b]/50 sm:px-8">
        Affiliate disclosure: MishBaby may earn a commission from qualifying purchases. <Link href="/affiliate-disclosure" className="font-bold text-[#007fa8] hover:underline">Learn more</Link>.
      </p>
    </div>
  );
}
