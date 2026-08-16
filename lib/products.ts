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

export type Offer = {
  id: string;
  productId: string;
  merchantId: string;
  url?: string;
  affiliate?: boolean;
};

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
    url: "https://amzn.to/4pGSxof",
    affiliate: true,
  },
  {
    id: "baby-grip-socks-slippers-aliexpress",
    productId: "baby-grip-socks-slippers",
    merchantId: "aliexpress",
    url: "https://s.click.aliexpress.com/e/_c3wy9QL9",
    affiliate: true,
  },
  { id: "portable-changing-mat-amazon", productId: "portable-changing-mat", merchantId: "amazon" },
  { id: "portable-changing-mat-aliexpress", productId: "portable-changing-mat", merchantId: "aliexpress" },
  { id: "baby-grooming-kit-amazon", productId: "baby-grooming-kit", merchantId: "amazon" },
  { id: "baby-grooming-kit-aliexpress", productId: "baby-grooming-kit", merchantId: "aliexpress" },
  { id: "stroller-organizer-amazon", productId: "stroller-organizer", merchantId: "amazon" },
  { id: "stroller-organizer-aliexpress", productId: "stroller-organizer", merchantId: "aliexpress" },
];

export const publishedProducts = products.filter((product) => product.status === "published");

export function getProductsByCategory(categorySlug: string) {
  return publishedProducts.filter((product) => product.categorySlug === categorySlug);
}

export function getProductBySlug(slug: string) {
  return publishedProducts.find((product) => product.slug === slug);
}

export function getOffersForProduct(productId: string) {
  return offers.filter((offer) => offer.productId === productId);
}

export function getMerchant(merchantId: string) {
  return merchants.find((merchant) => merchant.id === merchantId);
}
