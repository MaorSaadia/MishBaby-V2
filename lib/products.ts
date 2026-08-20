import { cache } from "react";
import { sanityClient } from "@/sanity/lib/client";

export type Merchant = {
  id: string;
  name: string;
  logo?: {
    src: string;
  } | null;
};

export type ProductImage = {
  src: string;
  alt: string;
  blurDataURL?: string;
};

export type ActiveOffer = {
  id: string;
  status: "active";
  url?: string;
  amazonAsin?: string;
  affiliate: boolean;
  lastVerifiedAt: string;
  merchant: Merchant;
};

export type Product = {
  id: string;
  slug: string;
  categorySlug: string;
  name: string;
  summary: string;
  highlights: string[];
  image?: ProductImage;
  badge?: string;
  offers: ActiveOffer[];
};

export type ProductSearchItem = Pick<Product, "slug" | "name" | "summary" | "image">;

const publishedProductsQuery = `
  *[
    _type == "product" &&
    defined(name) &&
    defined(slug.current) &&
    defined(category->slug.current) &&
    defined(summary) &&
    defined(image.asset)
  ] | order(_createdAt desc) {
    "id": _id,
    "slug": slug.current,
    "categorySlug": category->slug.current,
    name,
    summary,
    "highlights": coalesce(highlights, []),
    badge,
    "image": {
      "src": image.asset->url,
      "alt": coalesce(image.alt, name),
      "blurDataURL": image.asset->metadata.lqip
    },
    "offers": offers[
      status == "active" &&
      (defined(url) || defined(amazonAsin)) &&
      defined(lastVerifiedAt) &&
      defined(merchant->slug.current)
    ] | order(coalesce(merchant->displayOrder, 100) asc, merchant->name asc) {
      "id": _key,
      status,
      url,
      amazonAsin,
      "affiliate": coalesce(affiliate, true),
      lastVerifiedAt,
      "merchant": merchant->{
        "id": slug.current,
        name,
        "logo": select(
          defined(logo.asset) => {
            "src": logo.asset->url
          }
        )
      }
    }
  }
`;

export const getPublishedProducts = cache(async () => {
  return sanityClient.fetch<Product[]>(publishedProductsQuery, {}, { next: { revalidate: 60 } });
});

const productSearchItemsQuery = `
  *[
    _type == "product" &&
    defined(name) &&
    defined(slug.current) &&
    defined(summary) &&
    defined(image.asset)
  ] | order(name asc) {
    "slug": slug.current,
    name,
    summary,
    "image": {
      "src": image.asset->url,
      "alt": coalesce(image.alt, name)
    }
  }
`;

export const getProductSearchItems = cache(async () => {
  return sanityClient.fetch<ProductSearchItem[]>(productSearchItemsQuery, {}, { next: { revalidate: 60 } });
});

export async function getProductsByCategory(categorySlug: string) {
  const products = await getPublishedProducts();
  return products.filter((product) => product.categorySlug === categorySlug);
}

export async function getProductBySlug(slug: string) {
  const products = await getPublishedProducts();
  return products.find((product) => product.slug === slug);
}
