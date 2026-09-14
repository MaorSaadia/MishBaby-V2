// CMS content uses hourly, request-driven revalidation. Keep all shared
// storefront fetches aligned: the shortest lifetime can govern an ISR route.
// Live merchant offers have a separate cache policy and must not use this value.
export const contentRevalidateSeconds = 60 * 60;

export const contentCacheTags = {
  product: "sanity:product",
  category: "sanity:category",
  collection: "sanity:collection",
  guide: "sanity:guide",
  merchant: "sanity:merchant",
  homepageSettings: "sanity:homepageSettings",
  "sanity.imageAsset": "sanity:imageAsset",
} as const;
