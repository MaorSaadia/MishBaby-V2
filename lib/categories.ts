import { cache } from "react";
import type { CategoryTheme } from "@/lib/category-themes";
import { sanityClient } from "@/sanity/lib/client";

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  introduction: string;
  symbol: string;
  colorTheme: CategoryTheme;
  topics: string[];
  displayOrder: number;
};

const publishedCategoriesQuery = `
  *[
    _type == "category" &&
    defined(name) &&
    defined(slug.current) &&
    defined(description) &&
    defined(introduction) &&
    defined(symbol) &&
    defined(colorTheme)
  ] | order(displayOrder asc, name asc) {
    "id": _id,
    "slug": slug.current,
    name,
    description,
    introduction,
    symbol,
    colorTheme,
    "topics": coalesce(topics, []),
    "displayOrder": coalesce(displayOrder, 100)
  }
`;

export const getPublishedCategories = cache(async () => {
  return sanityClient.fetch<Category[]>(publishedCategoriesQuery, {}, { next: { revalidate: 60 } });
});

export async function getCategoryBySlug(slug: string) {
  const categories = await getPublishedCategories();
  return categories.find((category) => category.slug === slug);
}
