export type Merchant = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  slug: string;
  categorySlug: string;
  name: string;
  summary: string;
  highlights: string[];
  badge?: string;
};

export type Offer = {
  id: string;
  productId: string;
  merchantId: string;
};

export const merchants: Merchant[] = [
  { id: "amazon", name: "Amazon" },
  { id: "aliexpress", name: "AliExpress" },
];

export const products: Product[] = [
  {
    id: "portable-changing-mat",
    slug: "portable-changing-mat",
    categorySlug: "baby-essentials",
    name: "Portable Changing Mat",
    summary: "A wipe-clean, foldable changing surface for calmer changes away from home.",
    highlights: ["Folds down for easier packing", "Wipe-clean everyday surface", "Useful for travel and quick outings"],
    badge: "On-the-go pick",
  },
  {
    id: "baby-grooming-kit",
    slug: "baby-grooming-kit",
    categorySlug: "baby-essentials",
    name: "Baby Grooming Kit",
    summary: "A compact set for the small everyday care moments that quickly become routine.",
    highlights: ["Keeps care tools together", "Compact storage for home or travel", "Designed around everyday grooming needs"],
    badge: "Everyday helper",
  },
  {
    id: "stroller-organizer",
    slug: "stroller-organizer",
    categorySlug: "baby-essentials",
    name: "Stroller Organizer",
    summary: "Keeps bottles, wipes, and parent essentials easy to reach while you are out.",
    highlights: ["Quick access to daily essentials", "Flexible storage for short outings", "Helps keep the stroller area organized"],
    badge: "Parent favorite",
  },
];

export const offers: Offer[] = [
  { id: "portable-changing-mat-amazon", productId: "portable-changing-mat", merchantId: "amazon" },
  { id: "portable-changing-mat-aliexpress", productId: "portable-changing-mat", merchantId: "aliexpress" },
  { id: "baby-grooming-kit-amazon", productId: "baby-grooming-kit", merchantId: "amazon" },
  { id: "baby-grooming-kit-aliexpress", productId: "baby-grooming-kit", merchantId: "aliexpress" },
  { id: "stroller-organizer-amazon", productId: "stroller-organizer", merchantId: "amazon" },
  { id: "stroller-organizer-aliexpress", productId: "stroller-organizer", merchantId: "aliexpress" },
];

export function getProductsByCategory(categorySlug: string) {
  return products.filter((product) => product.categorySlug === categorySlug);
}

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getOffersForProduct(productId: string) {
  return offers.filter((offer) => offer.productId === productId);
}

export function getMerchant(merchantId: string) {
  return merchants.find((merchant) => merchant.id === merchantId);
}
