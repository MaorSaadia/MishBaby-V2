import { cache } from "react";
import type { CategoryTheme } from "@/lib/category-themes";
import { getPublishedProducts, type Product } from "@/lib/products";
import { sanityClient } from "@/sanity/lib/client";

export type GuideSection = {
  key: string;
  heading: string;
  paragraphs: string[];
  items: string[];
};

export type Guide = {
  id: string;
  createdAt: string;
  updatedAt: string;
  slug: string;
  title: string;
  status: "planned" | "published";
  categoryLabel: string;
  description: string;
  symbol: string;
  colorTheme: CategoryTheme;
  coverImage?: {
    src: string;
    alt: string;
  };
  featured: boolean;
  displayOrder: number;
  readingMinutes?: number;
  introduction?: string;
  sections: GuideSection[];
  relatedProductIds: string[];
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
  ] | order(featured desc, displayOrder asc, _createdAt asc, title asc) {
    "id": _id,
    "createdAt": _createdAt,
    "updatedAt": _updatedAt,
    "slug": slug.current,
    title,
    status,
    categoryLabel,
    description,
    symbol,
    colorTheme,
    "coverImage": select(
      defined(coverImage.asset) => {
        "src": coverImage.asset->url,
        "alt": coalesce(coverImage.alt, title)
      }
    ),
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
    "relatedProductIds": coalesce(relatedProducts[]._ref, []),
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

export async function getPublishedGuidesByProductId(productId: string) {
  const guides = await getPublishedGuides();
  return guides.filter((guide) => guide.relatedProductIds.includes(productId));
}

export async function getPublishedGuidesByCategorySlug(categorySlug: string) {
  const guides = await getPublishedGuides();
  return guides.filter((guide) => guide.relatedCategory?.slug === categorySlug);
}

export async function getPublishedGuideBySlug(slug: string) {
  const [guides, products] = await Promise.all([getPublishedGuides(), getPublishedProducts()]);
  const guide = guides.find((item) => item.slug === slug);
  if (!guide) return undefined;

  const productsById = new Map<string, Product>(products.map((product) => [product.id, product]));
  return {
    ...guide,
    relatedProducts: guide.relatedProductIds
      .map((productId) => productsById.get(productId))
      .filter((product): product is Product => Boolean(product)),
  };
}
