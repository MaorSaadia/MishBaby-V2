import { validateCatalog } from "./catalog-validation";

export type Merchant = {
  id: string;
  name: string;
};

export type ProductVisual = "baby-socks" | "changing-mat" | "grooming-kit" | "stroller-organizer";
export type ProductStatus = "draft" | "published";

export type ProductImage = {
  src: string;
  alt: string;
  fit?: "cover" | "contain";
};

export type Product = {
  id: string;
  slug: string;
  status: ProductStatus;
  categorySlug: string;
  name: string;
  summary: string;
  highlights: string[];
  fallbackVisual: ProductVisual;
  image?: ProductImage;
  badge?: string;
};

type OfferBase = {
  id: string;
  productId: string;
  merchantId: string;
};

export type ActiveOffer = OfferBase & {
  status: "active";
  url: string;
  affiliate: boolean;
  lastVerifiedAt: string;
};

export type PausedOffer = OfferBase & {
  status: "paused";
  url?: string;
  affiliate?: boolean;
  lastVerifiedAt?: string;
};

export type Offer = ActiveOffer | PausedOffer;

export const merchants: Merchant[] = [
  { id: "amazon", name: "Amazon" },
  { id: "aliexpress", name: "AliExpress" },
];

export const products: Product[] = [
  {
    id: "baby-grip-socks-slippers",
    slug: "baby-grip-socks-slippers",
    status: "published",
    categorySlug: "safety-comfort",
    name: "Baby Grip Socks Slippers",
    summary: "Soft sock-style baby slippers with elastic straps and a playful fox design for comfortable indoor wear.",
    highlights: ["Flexible sock-like knit construction", "Elastic over-foot straps help keep them in place", "Lightweight design for indoor wear"],
    fallbackVisual: "baby-socks",
    image: {
      src: "/products/baby-grip-socks-slippers.jpg",
      alt: "Pink fox-pattern baby grip sock slippers worn on a baby's feet",
      fit: "cover",
    },
    badge: "Featured pick",
  },
  {
    id: "portable-changing-mat",
    slug: "portable-changing-mat",
    status: "draft",
    categorySlug: "baby-essentials",
    name: "Portable Changing Mat",
    summary: "A wipe-clean, foldable changing surface for calmer changes away from home.",
    highlights: ["Folds down for easier packing", "Wipe-clean everyday surface", "Useful for travel and quick outings"],
    fallbackVisual: "changing-mat",
    badge: "On-the-go pick",
  },
  {
    id: "baby-grooming-kit",
    slug: "baby-grooming-kit",
    status: "draft",
    categorySlug: "baby-essentials",
    name: "Baby Grooming Kit",
    summary: "A compact set for the small everyday care moments that quickly become routine.",
    highlights: ["Keeps care tools together", "Compact storage for home or travel", "Designed around everyday grooming needs"],
    fallbackVisual: "grooming-kit",
    badge: "Everyday helper",
  },
  {
    id: "stroller-organizer",
    slug: "stroller-organizer",
    status: "draft",
    categorySlug: "baby-essentials",
    name: "Stroller Organizer",
    summary: "Keeps bottles, wipes, and parent essentials easy to reach while you are out.",
    highlights: ["Quick access to daily essentials", "Flexible storage for short outings", "Helps keep the stroller area organized"],
    fallbackVisual: "stroller-organizer",
    badge: "Parent favorite",
  },
];

export const offers: Offer[] = [
  {
    id: "baby-grip-socks-slippers-amazon",
    productId: "baby-grip-socks-slippers",
    merchantId: "amazon",
    status: "active",
    url: "https://amzn.to/4pGSxof",
    affiliate: true,
    lastVerifiedAt: "2026-08-16",
  },
  {
    id: "baby-grip-socks-slippers-aliexpress",
    productId: "baby-grip-socks-slippers",
    merchantId: "aliexpress",
    status: "active",
    url: "https://s.click.aliexpress.com/e/_c3wy9QL9",
    affiliate: true,
    lastVerifiedAt: "2026-08-16",
  },
  { id: "portable-changing-mat-amazon", productId: "portable-changing-mat", merchantId: "amazon", status: "paused" },
  { id: "portable-changing-mat-aliexpress", productId: "portable-changing-mat", merchantId: "aliexpress", status: "paused" },
  { id: "baby-grooming-kit-amazon", productId: "baby-grooming-kit", merchantId: "amazon", status: "paused" },
  { id: "baby-grooming-kit-aliexpress", productId: "baby-grooming-kit", merchantId: "aliexpress", status: "paused" },
  { id: "stroller-organizer-amazon", productId: "stroller-organizer", merchantId: "amazon", status: "paused" },
  { id: "stroller-organizer-aliexpress", productId: "stroller-organizer", merchantId: "aliexpress", status: "paused" },
];

validateCatalog({ merchants, products, offers });

export const publishedProducts = products.filter((product) => product.status === "published");
export const activeOffers = offers.filter((offer): offer is ActiveOffer => offer.status === "active");

export function getProductsByCategory(categorySlug: string) {
  return publishedProducts.filter((product) => product.categorySlug === categorySlug);
}

export function getProductBySlug(slug: string) {
  return publishedProducts.find((product) => product.slug === slug);
}

export function getOffersForProduct(productId: string) {
  return activeOffers.filter((offer) => offer.productId === productId);
}

export function getMerchant(merchantId: string) {
  return merchants.find((merchant) => merchant.id === merchantId);
}
