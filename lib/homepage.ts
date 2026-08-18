import { cache } from "react";
import { getPublishedProducts, type Product } from "@/lib/products";
import { sanityClient } from "@/sanity/lib/client";

const homepageProductLimit = 12;

export const getHomepageFeaturedProducts = cache(async () => {
  const [selectedProductIds, publishedProducts] = await Promise.all([
    sanityClient.fetch<string[] | null>(
      `*[_type == "homepageSettings" && _id == "homepageSettings"][0].featuredProducts[]._ref`,
      {},
      { next: { revalidate: 60 } },
    ),
    getPublishedProducts(),
  ]);

  if (!selectedProductIds?.length) {
    return publishedProducts.slice(0, homepageProductLimit);
  }

  const productsById = new Map<string, Product>(publishedProducts.map((product) => [product.id, product]));
  return selectedProductIds
    .map((productId) => productsById.get(productId))
    .filter((product): product is Product => Boolean(product))
    .slice(0, homepageProductLimit);
});
