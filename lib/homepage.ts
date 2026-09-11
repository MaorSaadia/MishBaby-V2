import { cache } from "react";
import { contentRevalidateSeconds } from "@/lib/content-cache";
import { getPublishedProducts, type Product } from "@/lib/products";
import { sanityClient } from "@/sanity/lib/client";

const homepageProductLimit = 12;

type HomepageProductSelections = {
  bestSellerProductIds?: string[] | null;
} | null;

export type HomepageProductSections = {
  bestSellerProducts: Product[];
  featuredProducts: Product[];
};

function resolveSelectedProducts(productIds: string[] | null | undefined, productsById: Map<string, Product>) {
  return (productIds ?? [])
    .map((productId) => productsById.get(productId))
    .filter((product): product is Product => Boolean(product))
    .slice(0, homepageProductLimit);
}

export const getHomepageProductSections = cache(async (): Promise<HomepageProductSections> => {
  const [selections, publishedProducts] = await Promise.all([
    sanityClient.fetch<HomepageProductSelections>(
      `*[_type == "homepageSettings" && _id == "homepageSettings"][0]{
        "bestSellerProductIds": featuredProducts[]._ref
      }`,
      {},
      { next: { revalidate: contentRevalidateSeconds } },
    ),
    getPublishedProducts(),
  ]);

  const productsById = new Map<string, Product>(publishedProducts.map((product) => [product.id, product]));
  const featuredProducts = publishedProducts.slice(0, homepageProductLimit);
  const selectedBestSellers = resolveSelectedProducts(selections?.bestSellerProductIds, productsById);

  return {
    bestSellerProducts: selectedBestSellers.length > 0 ? selectedBestSellers : featuredProducts.slice(0, 5),
    featuredProducts,
  };
});

export const getHomepageFeaturedProducts = cache(async () => {
  const { bestSellerProducts } = await getHomepageProductSections();
  return bestSellerProducts;
});
