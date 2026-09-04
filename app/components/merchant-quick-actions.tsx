"use client";

import Image from "next/image";
import type { Merchant } from "@/lib/products";
import type { ResolvedProductOffer } from "./product-offers-context";
import { useProductOffers } from "./product-offers-context";
import { TrackedMerchantLink } from "./tracked-merchant-link";

function MerchantMark({ merchant, compact = false }: { merchant: Merchant; compact?: boolean }) {
  return (
    <span className={`relative grid shrink-0 place-items-center overflow-hidden rounded-lg bg-white font-black text-[#009dcc] ${compact ? "size-7 text-xs" : "size-9 text-sm"}`}>
      {merchant.logo ? (
        <Image src={merchant.logo.src} alt="" fill sizes={compact ? "28px" : "36px"} className="object-contain p-1" />
      ) : (
        merchant.name.charAt(0)
      )}
    </span>
  );
}

function ExternalLinkIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4h5v5M9 11l7-7" />
      <path d="M16 11v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h4" />
    </svg>
  );
}

function offerRel(offer: ResolvedProductOffer) {
  return offer.affiliate ? "sponsored nofollow noopener noreferrer" : "noopener noreferrer";
}

export function HeroMerchantLinks() {
  const { offers } = useProductOffers();
  const visibleOffers = offers.filter((offer) => offer.resolution !== "unavailable");
  if (visibleOffers.length === 0) return null;

  return (
    <div className="mt-6 hidden sm:block">
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#063f5b]/55">Shop at</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {visibleOffers.map((offer) => offer.resolvedUrl ? (
          <TrackedMerchantLink
            key={offer.id}
            href={offer.resolvedUrl}
            trackingToken={offer.trackingToken}
            trackingSurface="hero"
            target="_blank"
            rel={offerRel(offer)}
            aria-label={`Shop ${offer.merchant.name} for this product (opens in a new tab)`}
            className="inline-flex min-h-12 items-center gap-2.5 rounded-full border border-[#063f5b]/12 bg-white px-3 py-2 font-extrabold text-[#063f5b] shadow-sm transition hover:border-[#009dcc]/40 hover:text-[#009dcc]"
          >
            <MerchantMark merchant={offer.merchant} compact />
            <span>Shop {offer.merchant.name}</span>
            <ExternalLinkIcon />
          </TrackedMerchantLink>
        ) : (
          <span key={offer.id} role="status" className="inline-flex min-h-12 items-center gap-2.5 rounded-full border border-[#063f5b]/10 bg-white/70 px-3 py-2 text-sm font-extrabold text-[#063f5b]/55">
            <MerchantMark merchant={offer.merchant} compact />
            Loading {offer.merchant.name}…
          </span>
        ))}
      </div>
    </div>
  );
}

export function MobileMerchantTray() {
  const { offers } = useProductOffers();
  const visibleOffers = offers.filter((offer) => offer.resolution !== "unavailable");
  if (visibleOffers.length === 0) return null;

  const scrollable = visibleOffers.length > 2;

  return (
    <aside
      data-mobile-offer-tray
      aria-label="Merchant offers for this product"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[#063f5b]/12 bg-[#fbfeff]/95 px-3 pt-3 shadow-[0_-18px_40px_-28px_rgba(6,63,91,.65)] backdrop-blur sm:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className={`mx-auto flex max-w-lg gap-2 ${scrollable ? "snap-x overflow-x-auto" : ""}`}>
        {visibleOffers.map((offer) => offer.resolvedUrl ? (
          <TrackedMerchantLink
            key={offer.id}
            href={offer.resolvedUrl}
            trackingToken={offer.trackingToken}
            trackingSurface="mobile_tray"
            target="_blank"
            rel={offerRel(offer)}
            aria-label={`Shop ${offer.merchant.name} for this product (opens in a new tab)`}
            className={`flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#009dcc] px-3 py-2 text-xs font-extrabold text-white transition hover:bg-[#0784b0] ${scrollable ? "min-w-40 snap-start" : "min-w-0 flex-1"}`}
          >
            <MerchantMark merchant={offer.merchant} compact />
            <span className="truncate">Shop {offer.merchant.name}</span>
            <ExternalLinkIcon />
          </TrackedMerchantLink>
        ) : (
          <span
            key={offer.id}
            role="status"
            className={`flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#e8f8fc] px-3 py-2 text-xs font-extrabold text-[#063f5b]/60 ${scrollable ? "min-w-40 snap-start" : "min-w-0 flex-1"}`}
          >
            <MerchantMark merchant={offer.merchant} compact />
            <span className="truncate">Loading {offer.merchant.name}…</span>
          </span>
        ))}
      </div>
    </aside>
  );
}
