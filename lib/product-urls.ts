export const reservedProductSlugs = [
  "about",
  "account",
  "advertise",
  "affiliate-disclosure",
  "aliexpress-finds",
  "amazon-finds",
  "api",
  "auth",
  "categories",
  "collections",
  "favicon.ico",
  "forgot-password",
  "guides",
  "opengraph-image",
  "privacy",
  "products",
  "robots.txt",
  "sign-in",
  "sign-up",
  "sitemap.xml",
  "studio",
  "terms",
  "update-password",
] as const;

const reservedProductSlugSet = new Set<string>(reservedProductSlugs);

export function isReservedProductSlug(slug: string | undefined) {
  return Boolean(slug && reservedProductSlugSet.has(slug.trim().toLocaleLowerCase()));
}

export function getProductPath(slug: string) {
  return `/${slug}`;
}

export function getProductUrl(siteUrl: string, slug: string) {
  return `${siteUrl.replace(/\/$/, "")}${getProductPath(slug)}`;
}
