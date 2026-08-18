import { categoryThemeOptions, type CategoryTheme } from "@/lib/category-themes";

export const guideAssistantLimits = {
  topicMin: 5,
  topicMax: 160,
  notesMin: 20,
  notesMax: 12_000,
  audienceMax: 160,
  titleMin: 5,
  titleMax: 120,
  categoryLabelMin: 2,
  categoryLabelMax: 60,
  descriptionMin: 20,
  descriptionMax: 240,
  symbolMax: 8,
  readingMinutesMin: 1,
  readingMinutesMax: 120,
  introductionMin: 40,
  introductionMax: 700,
  sectionMin: 3,
  sectionMax: 5,
  sectionHeadingMin: 3,
  sectionHeadingMax: 120,
  paragraphMin: 30,
  paragraphMax: 700,
  paragraphsPerSectionMin: 1,
  paragraphsPerSectionMax: 3,
  itemsPerSectionMax: 6,
  itemMin: 3,
  itemMax: 180,
  imagePromptMin: 80,
  imagePromptMax: 1_500,
} as const;

export const guideColorThemes = categoryThemeOptions.map(({ value }) => value);

export type GuideAssistantSection = {
  heading: string;
  paragraphs: string[];
  items: string[];
};

export type GuideSuggestion = {
  title: string;
  categoryLabel: string;
  description: string;
  symbol: string;
  colorTheme: CategoryTheme;
  readingMinutes: number;
  introduction: string;
  sections: GuideAssistantSection[];
  suggestedCategorySlug: string;
  coverImagePrompt: string;
};

function isTrimmedStringWithin(value: unknown, min: number, max: number) {
  return typeof value === "string" && value.trim().length >= min && value.trim().length <= max;
}

export function validateGuideSuggestion(
  value: unknown,
  allowedCategorySlugs: string[],
): GuideSuggestion | null {
  if (!value || typeof value !== "object") return null;

  const candidate = value as Partial<GuideSuggestion>;
  if (
    !isTrimmedStringWithin(candidate.title, guideAssistantLimits.titleMin, guideAssistantLimits.titleMax) ||
    !isTrimmedStringWithin(candidate.categoryLabel, guideAssistantLimits.categoryLabelMin, guideAssistantLimits.categoryLabelMax) ||
    !isTrimmedStringWithin(candidate.description, guideAssistantLimits.descriptionMin, guideAssistantLimits.descriptionMax) ||
    !isTrimmedStringWithin(candidate.symbol, 1, guideAssistantLimits.symbolMax) ||
    !guideColorThemes.includes(candidate.colorTheme as CategoryTheme) ||
    !Number.isInteger(candidate.readingMinutes) ||
    Number(candidate.readingMinutes) < guideAssistantLimits.readingMinutesMin ||
    Number(candidate.readingMinutes) > guideAssistantLimits.readingMinutesMax ||
    !isTrimmedStringWithin(candidate.introduction, guideAssistantLimits.introductionMin, guideAssistantLimits.introductionMax) ||
    !Array.isArray(candidate.sections) ||
    candidate.sections.length < guideAssistantLimits.sectionMin ||
    candidate.sections.length > guideAssistantLimits.sectionMax ||
    typeof candidate.suggestedCategorySlug !== "string" ||
    !allowedCategorySlugs.includes(candidate.suggestedCategorySlug) ||
    !isTrimmedStringWithin(candidate.coverImagePrompt, guideAssistantLimits.imagePromptMin, guideAssistantLimits.imagePromptMax)
  ) {
    return null;
  }

  const sections: GuideAssistantSection[] = [];
  for (const section of candidate.sections) {
    if (
      !section ||
      typeof section !== "object" ||
      !isTrimmedStringWithin(section.heading, guideAssistantLimits.sectionHeadingMin, guideAssistantLimits.sectionHeadingMax) ||
      !Array.isArray(section.paragraphs) ||
      section.paragraphs.length < guideAssistantLimits.paragraphsPerSectionMin ||
      section.paragraphs.length > guideAssistantLimits.paragraphsPerSectionMax ||
      section.paragraphs.some((paragraph) => !isTrimmedStringWithin(paragraph, guideAssistantLimits.paragraphMin, guideAssistantLimits.paragraphMax)) ||
      !Array.isArray(section.items) ||
      section.items.length > guideAssistantLimits.itemsPerSectionMax ||
      section.items.some((item) => !isTrimmedStringWithin(item, guideAssistantLimits.itemMin, guideAssistantLimits.itemMax))
    ) {
      return null;
    }

    sections.push({
      heading: section.heading.trim(),
      paragraphs: section.paragraphs.map((paragraph) => paragraph.trim()),
      items: section.items.map((item) => item.trim()),
    });
  }

  return {
    title: candidate.title!.trim(),
    categoryLabel: candidate.categoryLabel!.trim(),
    description: candidate.description!.trim(),
    symbol: candidate.symbol!.trim(),
    colorTheme: candidate.colorTheme as CategoryTheme,
    readingMinutes: Number(candidate.readingMinutes),
    introduction: candidate.introduction!.trim(),
    sections,
    suggestedCategorySlug: candidate.suggestedCategorySlug,
    coverImagePrompt: candidate.coverImagePrompt!.trim(),
  };
}

export function createGuideSlug(title: string) {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96)
    .replace(/-+$/g, "");
}
