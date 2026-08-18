import { cache } from "react";
import type { CategoryTheme } from "@/lib/category-themes";
import { sanityClient } from "@/sanity/lib/client";

export type GuideSection = {
  key: string;
  heading: string;
  paragraphs: string[];
  items: string[];
};

export type Guide = {
  id: string;
  slug: string;
  title: string;
  status: "planned" | "published";
  categoryLabel: string;
  description: string;
  symbol: string;
  colorTheme: CategoryTheme;
  featured: boolean;
  displayOrder: number;
  readingMinutes?: number;
  introduction?: string;
  sections: GuideSection[];
  relatedCategory?: {
    slug: string;
    label: string;
  };
};

const guidesQuery = `
  *[
    _type == "guide" &&
    defined(title) &&
    defined(slug.current) &&
    defined(status) &&
    defined(categoryLabel) &&
    defined(description) &&
    defined(symbol) &&
    defined(colorTheme)
  ] | order(featured desc, displayOrder asc, title asc) {
    "id": _id,
    "slug": slug.current,
    title,
    status,
    categoryLabel,
    description,
    symbol,
    colorTheme,
    "featured": coalesce(featured, false),
    "displayOrder": coalesce(displayOrder, 100),
    readingMinutes,
    introduction,
    "sections": coalesce(sections[]{
      "key": _key,
      heading,
      "paragraphs": coalesce(paragraphs, []),
      "items": coalesce(items, [])
    }, []),
    "relatedCategory": relatedCategory->{
      "slug": slug.current,
      "label": name
    }
  }
`;

export const getGuides = cache(async () => {
  return sanityClient.fetch<Guide[]>(guidesQuery, {}, { next: { revalidate: 60 } });
});

export async function getPublishedGuides() {
  const guides = await getGuides();
  return guides.filter((guide) => guide.status === "published");
}

export async function getPublishedGuideBySlug(slug: string) {
  const guides = await getPublishedGuides();
  return guides.find((guide) => guide.slug === slug);
}
