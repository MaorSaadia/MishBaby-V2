"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AmazonOfferLink, AmazonOfferLinkResponse } from "@/lib/amazon-creators";
import type { ActiveOffer } from "@/lib/products";

export type ResolvedProductOffer = ActiveOffer & {
  amazonOffer?: AmazonOfferLink;
  resolvedUrl?: string;
  resolution: "ready" | "loading" | "unavailable";
};

type ProductOffersContextValue = {
  offers: ResolvedProductOffer[];
  offersUpdatedAt: string;
};

const ProductOffersContext = createContext<ProductOffersContextValue | null>(null);

export function ProductOffersProvider({
  offers,
  children,
}: {
  offers: ActiveOffer[];
  children: React.ReactNode;
}) {
  const asinKey = useMemo(
    () => offers.flatMap((offer) => !offer.url && offer.amazonAsin ? [offer.amazonAsin] : []).sort().join(","),
    [offers],
  );
  const [amazonOffers, setAmazonOffers] = useState<Record<string, AmazonOfferLink>>({});
  const [offersUpdatedAt, setOffersUpdatedAt] = useState("");
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
        setAmazonOffers(Object.fromEntries(response.items.map((item) => [item.asin, item])));
        setOffersUpdatedAt(response.offersUpdatedAt ?? "");
      })
      .catch(() => {
        if (!controller.signal.aborted) setAmazonOffers({});
      })
      .finally(() => {
        if (!controller.signal.aborted) setResolvingAmazonLinks(false);
      });

    return () => controller.abort();
  }, [asinKey]);

  const resolvedOffers = useMemo<ResolvedProductOffer[]>(() => offers.map((offer) => {
    const amazonOffer = offer.amazonAsin ? amazonOffers[offer.amazonAsin] : undefined;
    const resolvedUrl = offer.url ?? amazonOffer?.detailPageUrl;
    const resolution = resolvedUrl
      ? "ready"
      : offer.amazonAsin && resolvingAmazonLinks
        ? "loading"
        : "unavailable";

    return { ...offer, amazonOffer, resolvedUrl, resolution };
  }), [amazonOffers, offers, resolvingAmazonLinks]);

  const value = useMemo(
    () => ({ offers: resolvedOffers, offersUpdatedAt }),
    [offersUpdatedAt, resolvedOffers],
  );

  return <ProductOffersContext.Provider value={value}>{children}</ProductOffersContext.Provider>;
}

export function useProductOffers() {
  const context = useContext(ProductOffersContext);
  if (!context) throw new Error("useProductOffers must be used inside ProductOffersProvider.");
  return context;
}
