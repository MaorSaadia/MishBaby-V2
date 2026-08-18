"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Box, Button, Card, Container, Flex, Heading, Spinner, Text } from "@sanity/ui";
import { useClient } from "sanity";
import { useRouter } from "sanity/router";
import { categoryThemeOptions } from "@/lib/category-themes";
import {
  createGuideSlug,
  guideAssistantLimits,
  type GuideSuggestion,
  validateGuideSuggestion,
} from "@/lib/guide-assistant";
import styles from "../product-assistant/product-assistant.module.css";

const apiVersion = "2026-08-18";

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

type AssistantResponse = {
  suggestion?: GuideSuggestion;
  error?: string;
};

export function GuideAssistant() {
  const client = useClient({ apiVersion });
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [sourceNotes, setSourceNotes] = useState("");
  const [suggestion, setSuggestion] = useState<GuideSuggestion | null>(null);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState("");
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    client
      .fetch<CategoryOption[]>(`
        *[_type == "category" && defined(name) && defined(slug.current)] | order(displayOrder asc, name asc) {
          "id": _id,
          name,
          "slug": slug.current
        }
      `)
      .then((categoryOptions) => {
        if (active) setCategories(categoryOptions);
      })
      .catch(() => {
        if (active) setError("Categories could not be loaded from Sanity.");
      })
      .finally(() => {
        if (active) setLoadingOptions(false);
      });

    return () => {
      active = false;
    };
  }, [client]);

  async function generateGuide(event: FormEvent) {
    event.preventDefault();
    setError("");
    setCopied(false);

    const trimmedTopic = topic.trim();
    const trimmedNotes = sourceNotes.trim();
    if (trimmedTopic.length < guideAssistantLimits.topicMin || trimmedTopic.length > guideAssistantLimits.topicMax) {
      setError("Enter a guide topic between 5 and 160 characters.");
      return;
    }
    if (trimmedNotes.length < guideAssistantLimits.notesMin || trimmedNotes.length > guideAssistantLimits.notesMax) {
      setError("Enter source notes between 20 and 12,000 characters.");
      return;
    }
    if (audience.trim().length > guideAssistantLimits.audienceMax) {
      setError("The audience description must be no longer than 160 characters.");
      return;
    }
    if (categories.length === 0) {
      setError("Publish at least one category before generating a guide.");
      return;
    }

    const token = client.config().token;
    if (!token) {
      setError("Your Studio session token is unavailable. Refresh Studio and sign in again.");
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch("/api/studio/guide-copy", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic: trimmedTopic, sourceNotes: trimmedNotes, audience: audience.trim() }),
      });
      const result = (await response.json()) as AssistantResponse;

      if (!response.ok || !result.suggestion) {
        throw new Error(result.error || "Guide content could not be generated.");
      }

      setSuggestion(result.suggestion);
      setSelectedCategorySlug(result.suggestion.suggestedCategorySlug);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Guide content could not be generated.");
    } finally {
      setGenerating(false);
    }
  }

  function updateSection(sectionIndex: number, nextSection: GuideSuggestion["sections"][number]) {
    if (!suggestion) return;
    const sections = [...suggestion.sections];
    sections[sectionIndex] = nextSection;
    setSuggestion({ ...suggestion, sections });
  }

  async function copyImagePrompt() {
    if (!suggestion) return;
    try {
      await navigator.clipboard.writeText(suggestion.coverImagePrompt);
      setCopied(true);
    } catch {
      setError("The image prompt could not be copied. Select the text and copy it manually.");
    }
  }

  function validateDraft() {
    if (!suggestion) return "Generate the guide before creating a draft.";
    const slug = createGuideSlug(suggestion.title);
    if (!slug) return "Enter a guide title that can be used in a URL.";
    const confirmedSuggestion = validateGuideSuggestion(
      { ...suggestion, suggestedCategorySlug: selectedCategorySlug },
      categories.map((category) => category.slug),
    );
    if (!confirmedSuggestion) return "Review the generated fields. One or more values are missing or outside the allowed length.";
    if (!categories.some((category) => category.slug === selectedCategorySlug)) return "Choose a related product category.";
    return "";
  }

  async function createDraft() {
    setError("");
    const validationError = validateDraft();
    if (validationError) {
      setError(validationError);
      return;
    }

    const confirmedSuggestion = validateGuideSuggestion(
      { ...suggestion, suggestedCategorySlug: selectedCategorySlug },
      categories.map((category) => category.slug),
    );
    const category = categories.find((item) => item.slug === selectedCategorySlug);
    if (!confirmedSuggestion || !category) return;

    const slug = createGuideSlug(confirmedSuggestion.title);
    setCreating(true);
    try {
      const duplicateCount = await client.fetch<number>(
        `count(*[_type == "guide" && slug.current == $slug])`,
        { slug },
        { perspective: "raw" },
      );
      if (duplicateCount > 0) throw new Error("A published guide or draft already uses this title and slug.");

      const logicalDocumentId = `guide-${crypto.randomUUID()}`;
      await client.create({
        _id: `drafts.${logicalDocumentId}`,
        _type: "guide",
        title: confirmedSuggestion.title,
        slug: { _type: "slug", current: slug },
        status: "published",
        categoryLabel: confirmedSuggestion.categoryLabel,
        description: confirmedSuggestion.description,
        symbol: confirmedSuggestion.symbol,
        colorTheme: confirmedSuggestion.colorTheme,
        featured: false,
        displayOrder: 100,
        readingMinutes: confirmedSuggestion.readingMinutes,
        introduction: confirmedSuggestion.introduction,
        sections: confirmedSuggestion.sections.map((section) => ({
          _key: crypto.randomUUID().replaceAll("-", ""),
          _type: "guideSection",
          heading: section.heading,
          paragraphs: section.paragraphs,
          ...(section.items.length > 0 ? { items: section.items } : {}),
        })),
        relatedCategory: { _type: "reference", _ref: category.id },
        coverImagePrompt: confirmedSuggestion.coverImagePrompt,
      });

      router.navigateIntent("edit", { id: logicalDocumentId, type: "guide" });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "The Sanity guide draft could not be created.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <Box padding={4} className={styles.page}>
      <Container width={2}>
        <div className={styles.stack5}>
          <Card padding={5} radius={3} shadow={1} tone="primary">
            <Flex align="center" gap={3}>
              <span className={styles.heroIcon} aria-hidden="true">✦</span>
              <Box>
                <Heading size={3}>AI Guide Assistant</Heading>
                <Text muted size={1} className={styles.heroText}>
                  Turn a topic and your notes into an editable MishBaby guide and a ready-to-copy cover-image prompt.
                </Text>
              </Box>
            </Flex>
          </Card>

          {error && (
            <Card padding={4} radius={2} tone="critical" role="alert">
              <Text size={1}>{error}</Text>
            </Card>
          )}

          <form onSubmit={generateGuide}>
            <div className={styles.stack5}>
              <Card padding={5} radius={3} shadow={1}>
                <div className={styles.stack4}>
                  <Heading size={2}>1. Guide brief</Heading>
                  <label className={styles.field}>
                    <span>Topic or working title</span>
                    <input value={topic} onChange={(event) => setTopic(event.target.value)} maxLength={guideAssistantLimits.topicMax} placeholder="How to choose a baby monitor" />
                  </label>
                  <label className={styles.field}>
                    <span>Audience <small>(optional)</small></span>
                    <input value={audience} onChange={(event) => setAudience(event.target.value)} maxLength={guideAssistantLimits.audienceMax} placeholder="First-time parents preparing a nursery" />
                  </label>
                  <label className={styles.field}>
                    <span>Source notes and points to cover</span>
                    <textarea value={sourceNotes} onChange={(event) => setSourceNotes(event.target.value)} maxLength={guideAssistantLimits.notesMax} rows={10} placeholder="Paste trustworthy notes, important product considerations, and the questions the guide should answer..." />
                    <small>Your notes are sent to Gemini but are not saved to Sanity.</small>
                  </label>
                </div>
              </Card>

              <Flex justify="flex-end">
                <Button type="submit" text={suggestion ? "Regenerate guide" : "Generate guide"} tone="primary" loading={generating} disabled={generating || creating || loadingOptions} />
              </Flex>
            </div>
          </form>

          {loadingOptions && (
            <Flex align="center" gap={2}><Spinner muted /><Text muted size={1}>Loading categories...</Text></Flex>
          )}

          {suggestion && (
            <Card padding={5} radius={3} shadow={1}>
              <div className={styles.stack4}>
                <Box>
                  <Heading size={2}>2. Review and create draft</Heading>
                  <Text muted size={1} className={styles.sectionText}>Edit every field before saving. The source notes are never stored.</Text>
                </Box>

                <label className={styles.field}>
                  <span>Guide title</span>
                  <input maxLength={guideAssistantLimits.titleMax} value={suggestion.title} onChange={(event) => setSuggestion({ ...suggestion, title: event.target.value })} />
                </label>
                <label className={styles.field}>
                  <span>Related product category</span>
                  <select value={selectedCategorySlug} onChange={(event) => setSelectedCategorySlug(event.target.value)}>
                    <option value="">Choose category</option>
                    {categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}
                  </select>
                </label>

                <div className={styles.offerRow}>
                  <label className={styles.field}>
                    <span>Guide category label</span>
                    <input maxLength={guideAssistantLimits.categoryLabelMax} value={suggestion.categoryLabel} onChange={(event) => setSuggestion({ ...suggestion, categoryLabel: event.target.value })} />
                  </label>
                  <label className={styles.field}>
                    <span>Color theme</span>
                    <select value={suggestion.colorTheme} onChange={(event) => setSuggestion({ ...suggestion, colorTheme: event.target.value as GuideSuggestion["colorTheme"] })}>
                      {categoryThemeOptions.map((theme) => <option key={theme.value} value={theme.value}>{theme.title}</option>)}
                    </select>
                  </label>
                  <label className={styles.field}>
                    <span>Symbol</span>
                    <input maxLength={guideAssistantLimits.symbolMax} value={suggestion.symbol} onChange={(event) => setSuggestion({ ...suggestion, symbol: event.target.value })} />
                  </label>
                </div>

                <label className={styles.field}>
                  <span>Card description</span>
                  <textarea rows={4} maxLength={guideAssistantLimits.descriptionMax} value={suggestion.description} onChange={(event) => setSuggestion({ ...suggestion, description: event.target.value })} />
                </label>
                <label className={styles.field}>
                  <span>Reading time in minutes</span>
                  <input type="number" min={guideAssistantLimits.readingMinutesMin} max={guideAssistantLimits.readingMinutesMax} value={suggestion.readingMinutes} onChange={(event) => setSuggestion({ ...suggestion, readingMinutes: Number(event.target.value) })} />
                </label>
                <label className={styles.field}>
                  <span>Introduction</span>
                  <textarea rows={6} maxLength={guideAssistantLimits.introductionMax} value={suggestion.introduction} onChange={(event) => setSuggestion({ ...suggestion, introduction: event.target.value })} />
                </label>

                <fieldset className={styles.fieldset}>
                  <legend>Article sections</legend>
                  <div className={styles.stack4}>
                    {suggestion.sections.map((section, sectionIndex) => (
                      <Card key={sectionIndex} padding={4} radius={2} border>
                        <div className={styles.stack3}>
                          <label className={styles.field}>
                            <span>Section {sectionIndex + 1} heading</span>
                            <input maxLength={guideAssistantLimits.sectionHeadingMax} value={section.heading} onChange={(event) => updateSection(sectionIndex, { ...section, heading: event.target.value })} />
                          </label>
                          {section.paragraphs.map((paragraph, paragraphIndex) => (
                            <label className={styles.field} key={paragraphIndex}>
                              <span>Paragraph {paragraphIndex + 1}</span>
                              <textarea rows={5} maxLength={guideAssistantLimits.paragraphMax} value={paragraph} onChange={(event) => {
                                const paragraphs = [...section.paragraphs];
                                paragraphs[paragraphIndex] = event.target.value;
                                updateSection(sectionIndex, { ...section, paragraphs });
                              }} />
                            </label>
                          ))}
                          {section.items.length > 0 && (
                            <div className={styles.stack3}>
                              <Text size={1} weight="semibold">Checklist items</Text>
                              {section.items.map((item, itemIndex) => (
                                <Flex align="center" gap={2} key={itemIndex}>
                                  <Box flex={1}>
                                    <label className={styles.field}>
                                      <span className="sr-only">Checklist item {itemIndex + 1}</span>
                                      <input maxLength={guideAssistantLimits.itemMax} value={item} onChange={(event) => {
                                        const items = [...section.items];
                                        items[itemIndex] = event.target.value;
                                        updateSection(sectionIndex, { ...section, items });
                                      }} />
                                    </label>
                                  </Box>
                                  <Button mode="bleed" tone="critical" text="Remove" onClick={() => updateSection(sectionIndex, { ...section, items: section.items.filter((_, index) => index !== itemIndex) })} />
                                </Flex>
                              ))}
                            </div>
                          )}
                          {section.items.length < guideAssistantLimits.itemsPerSectionMax && (
                            <Flex justify="flex-start">
                              <Button mode="ghost" text="Add checklist item" onClick={() => updateSection(sectionIndex, { ...section, items: [...section.items, "Add a useful checklist item"] })} />
                            </Flex>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </fieldset>

                <Card padding={4} radius={2} tone="primary">
                  <div className={styles.stack3}>
                    <Flex align="center" justify="space-between" gap={3} wrap="wrap">
                      <Box>
                        <Text size={1} weight="semibold">Cover-image prompt</Text>
                        <Text muted size={1}>Copy this into ChatGPT image generation or another image generator.</Text>
                      </Box>
                      <Button mode="ghost" text={copied ? "Copied" : "Copy image prompt"} onClick={copyImagePrompt} />
                    </Flex>
                    <label className={styles.field}>
                      <span className="sr-only">Cover-image prompt</span>
                      <textarea rows={8} maxLength={guideAssistantLimits.imagePromptMax} value={suggestion.coverImagePrompt} onChange={(event) => {
                        setCopied(false);
                        setSuggestion({ ...suggestion, coverImagePrompt: event.target.value });
                      }} />
                    </label>
                  </div>
                </Card>

                <Card padding={4} radius={2} tone="caution">
                  <Text size={1}>Approval creates an unpublished draft only. Review the article, generate and upload its cover image, add accurate alternative text, then publish manually.</Text>
                </Card>
                <Flex justify="flex-end">
                  <Button text="Approve and create draft" tone="positive" loading={creating} disabled={generating || creating} onClick={createDraft} />
                </Flex>
              </div>
            </Card>
          )}
        </div>
      </Container>
    </Box>
  );
}
