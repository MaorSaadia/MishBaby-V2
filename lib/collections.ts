import { cache } from "react";
import { getPublishedProducts, type Product } from "@/lib/products";
import { sanityClient } from "@/sanity/lib/client";

type CollectionRecord = {
  id: string;
  slug: string;
  name: string;
  description: string;
  badge?: string;
  productIds: string[];
  updatedAt: string;
};

export type ProductCollection = Omit<CollectionRecord, "productIds"> & {
  products: Product[];
};

const publishedCollectionsQuery = `
  *[
    _type == "collection" &&
    defined(name) &&
    defined(slug.current) &&
    defined(description) &&
    count(products) >= 2
  ] | order(_createdAt desc) {
    "id": _id,
    "slug": slug.current,
    name,
    description,
    badge,
    "productIds": products[]._ref,
    "updatedAt": _updatedAt
  }
`;

export const getPublishedCollections = cache(async () => {
  const [records, products] = await Promise.all([
    sanityClient.fetch<CollectionRecord[]>(publishedCollectionsQuery, {}, { next: { revalidate: 60 } }),
    getPublishedProducts(),
  ]);
  const productsById = new Map(products.map((product) => [product.id, product]));

  return records
    .map(({ productIds, ...collection }) => ({
      ...collection,
      products: productIds.flatMap((id) => {
        const product = productsById.get(id);
        return product ? [product] : [];
      }),
    }))
    .filter((collection) => collection.products.length >= 2);
});

export async function getCollectionBySlug(slug: string) {
  const collections = await getPublishedCollections();
  return collections.find((collection) => collection.slug === slug);
}
