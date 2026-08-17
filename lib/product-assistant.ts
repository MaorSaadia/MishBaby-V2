export const productAssistantLimits = {
  nameMin: 3,
  nameMax: 120,
  sourceMin: 20,
  sourceMax: 12_000,
  imageMaxBytes: 5 * 1024 * 1024,
  summaryMin: 20,
  summaryMax: 320,
  highlightMin: 5,
  highlightMax: 140,
  badgeMax: 40,
  imageAltMin: 5,
  imageAltMax: 180,
} as const;

export const acceptedProductImageTypes = ["image/jpeg", "image/png", "image/webp"] as const;

export type ProductSuggestion = {
  summary: string;
  highlights: [string, string, string];
  badge: string;
  imageAlt: string;
  suggestedCategorySlug: string;
};

export function validateProductSuggestion(
  value: unknown,
  allowedCategorySlugs: string[],
): ProductSuggestion | null {
  if (!value || typeof value !== "object") return null;

  const candidate = value as Partial<ProductSuggestion>;
  const highlights = candidate.highlights;

  if (
    typeof candidate.summary !== "string" ||
    candidate.summary.trim().length < productAssistantLimits.summaryMin ||
    candidate.summary.trim().length > productAssistantLimits.summaryMax ||
    !Array.isArray(highlights) ||
    highlights.length !== 3 ||
    highlights.some(
      (highlight) =>
        typeof highlight !== "string" ||
        highlight.trim().length < productAssistantLimits.highlightMin ||
        highlight.trim().length > productAssistantLimits.highlightMax,
    ) ||
    typeof candidate.badge !== "string" ||
    candidate.badge.trim().length > productAssistantLimits.badgeMax ||
    typeof candidate.imageAlt !== "string" ||
    candidate.imageAlt.trim().length < productAssistantLimits.imageAltMin ||
    candidate.imageAlt.trim().length > productAssistantLimits.imageAltMax ||
    typeof candidate.suggestedCategorySlug !== "string" ||
    !allowedCategorySlugs.includes(candidate.suggestedCategorySlug)
  ) {
    return null;
  }

  return {
    summary: candidate.summary.trim(),
    highlights: highlights.map((highlight) => highlight.trim()) as [string, string, string],
    badge: candidate.badge.trim(),
    imageAlt: candidate.imageAlt.trim(),
    suggestedCategorySlug: candidate.suggestedCategorySlug,
  };
}

export function createProductSlug(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96)
    .replace(/-+$/g, "");
}
