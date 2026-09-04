export const productAssistantLimits = {
  nameMin: 3,
  nameMax: 120,
  sourceMin: 20,
  sourceMax: 12_000,
  imageMaxBytes: 5 * 1024 * 1024,
  summaryMin: 20,
  summaryMax: 320,
  bestForMin: 20,
  bestForMax: 160,
  factLabelMin: 2,
  factLabelMax: 40,
  factValueMin: 3,
  factValueMax: 140,
  considerationMin: 10,
  considerationMax: 180,
  highlightMin: 5,
  highlightMax: 140,
  badgeMax: 40,
  imageAltMin: 5,
  imageAltMax: 180,
} as const;

export const acceptedProductImageTypes = ["image/jpeg", "image/png", "image/webp"] as const;

export type ProductKeyFact = {
  label: string;
  value: string;
};

export type ProductSuggestion = {
  summary: string;
  highlights: [string, string, string];
  bestFor: string;
  keyFacts: [ProductKeyFact, ProductKeyFact, ProductKeyFact];
  considerations: [string, string, string];
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
  const keyFacts = candidate.keyFacts;
  const considerations = candidate.considerations;
  const normalizedFactLabels = Array.isArray(keyFacts)
    ? keyFacts.map((fact) => typeof fact?.label === "string" ? fact.label.trim().toLocaleLowerCase() : "")
    : [];

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
    typeof candidate.bestFor !== "string" ||
    candidate.bestFor.trim().length < productAssistantLimits.bestForMin ||
    candidate.bestFor.trim().length > productAssistantLimits.bestForMax ||
    !Array.isArray(keyFacts) ||
    keyFacts.length !== 3 ||
    keyFacts.some(
      (fact) =>
        !fact ||
        typeof fact.label !== "string" ||
        fact.label.trim().length < productAssistantLimits.factLabelMin ||
        fact.label.trim().length > productAssistantLimits.factLabelMax ||
        typeof fact.value !== "string" ||
        fact.value.trim().length < productAssistantLimits.factValueMin ||
        fact.value.trim().length > productAssistantLimits.factValueMax,
    ) ||
    new Set(normalizedFactLabels).size !== normalizedFactLabels.length ||
    !Array.isArray(considerations) ||
    considerations.length !== 3 ||
    considerations.some(
      (consideration) =>
        typeof consideration !== "string" ||
        consideration.trim().length < productAssistantLimits.considerationMin ||
        consideration.trim().length > productAssistantLimits.considerationMax,
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
    bestFor: candidate.bestFor.trim(),
    keyFacts: keyFacts.map((fact) => ({
      label: fact.label.trim(),
      value: fact.value.trim(),
    })) as [ProductKeyFact, ProductKeyFact, ProductKeyFact],
    considerations: considerations.map((consideration) => consideration.trim()) as [string, string, string],
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
