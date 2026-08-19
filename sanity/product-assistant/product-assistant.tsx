"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Box, Button, Card, Container, Flex, Heading, Spinner, Text } from "@sanity/ui";
import { useClient } from "sanity";
import { useRouter } from "sanity/router";
import {
  acceptedProductImageTypes,
  createProductSlug,
  productAssistantLimits,
  type ProductSuggestion,
  validateProductSuggestion,
} from "@/lib/product-assistant";
import styles from "./product-assistant.module.css";

const apiVersion = "2026-08-16";

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

type MerchantOption = {
  id: string;
  name: string;
};

type OfferInput = {
  key: string;
  merchantId: string;
  url: string;
};

type AssistantResponse = {
  suggestion?: ProductSuggestion;
  error?: string;
};

function newOffer(): OfferInput {
  return { key: crypto.randomUUID(), merchantId: "", url: "" };
}

function isValidHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function ProductAssistant() {
  const client = useClient({ apiVersion });
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [merchants, setMerchants] = useState<MerchantOption[]>([]);
  const [name, setName] = useState("");
  const [sourceDescription, setSourceDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [offers, setOffers] = useState<OfferInput[]>([newOffer()]);
  const [suggestion, setSuggestion] = useState<ProductSuggestion | null>(null);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState("");
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const imagePreviewUrl = useMemo(() => (image ? URL.createObjectURL(image) : ""), [image]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  useEffect(() => {
    let active = true;

    Promise.all([
      client.fetch<CategoryOption[]>(`
        *[_type == "category" && defined(name) && defined(slug.current)] | order(displayOrder asc, name asc) {
          "id": _id,
          name,
          "slug": slug.current
        }
      `),
      client.fetch<MerchantOption[]>(`
        *[_type == "merchant" && defined(name) && defined(slug.current)] | order(coalesce(displayOrder, 100) asc, name asc) {
          "id": _id,
          name
        }
      `),
    ])
      .then(([categoryOptions, merchantOptions]) => {
        if (!active) return;
        setCategories(categoryOptions);
        setMerchants(merchantOptions);
      })
      .catch(() => {
        if (active) setError("Categories and merchants could not be loaded from Sanity.");
      })
      .finally(() => {
        if (active) setLoadingOptions(false);
      });

    return () => {
      active = false;
    };
  }, [client]);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const nextImage = event.target.files?.[0] ?? null;
    setError("");

    if (!nextImage) {
      setImage(null);
      return;
    }

    if (!acceptedProductImageTypes.includes(nextImage.type as (typeof acceptedProductImageTypes)[number])) {
      setImage(null);
      event.target.value = "";
      setError("Use a JPEG, PNG, or WebP product image.");
      return;
    }

    if (nextImage.size > productAssistantLimits.imageMaxBytes) {
      setImage(null);
      event.target.value = "";
      setError("The product image must be no larger than 5 MB.");
      return;
    }

    setImage(nextImage);
  }

  function updateOffer(key: string, field: "merchantId" | "url", value: string) {
    setOffers((current) => current.map((offer) => (offer.key === key ? { ...offer, [field]: value } : offer)));
  }

  function removeOffer(key: string) {
    setOffers((current) => current.filter((offer) => offer.key !== key));
  }

  async function generateCopy(event: FormEvent) {
    event.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const trimmedSource = sourceDescription.trim();
    if (trimmedName.length < productAssistantLimits.nameMin || trimmedName.length > productAssistantLimits.nameMax) {
      setError("Enter a product name between 3 and 120 characters.");
      return;
    }
    if (trimmedSource.length < productAssistantLimits.sourceMin || trimmedSource.length > productAssistantLimits.sourceMax) {
      setError("Paste a source description between 20 and 12,000 characters.");
      return;
    }
    if (!image) {
      setError("Upload a product image before generating copy.");
      return;
    }
    if (categories.length === 0) {
      setError("Publish at least one category before generating a product.");
      return;
    }

    const token = client.config().token;
    if (!token) {
      setError("Your Studio session token is unavailable. Refresh Studio and sign in again.");
      return;
    }

    const formData = new FormData();
    formData.set("name", trimmedName);
    formData.set("sourceDescription", trimmedSource);
    formData.set("image", image);

    setGenerating(true);
    try {
      const response = await fetch("/api/studio/product-copy", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const result = (await response.json()) as AssistantResponse;

      if (!response.ok || !result.suggestion) {
        throw new Error(result.error || "Product copy could not be generated.");
      }

      setSuggestion(result.suggestion);
      setSelectedCategorySlug(result.suggestion.suggestedCategorySlug);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Product copy could not be generated.");
    } finally {
      setGenerating(false);
    }
  }

  function validateDraft() {
    const slug = createProductSlug(name);
    if (!slug) return "Enter a product name that can be used in a URL.";
    if (!image) return "Upload a product image.";
    if (!suggestion) return "Generate the product copy before creating a draft.";
    if (!validateProductSuggestion({ ...suggestion, suggestedCategorySlug: selectedCategorySlug }, categories.map((item) => item.slug))) {
      return "Review the generated fields. One or more values are missing or too long.";
    }
    if (!categories.some((category) => category.slug === selectedCategorySlug)) return "Choose a category.";
    if (offers.length === 0) return "Add at least one merchant offer.";

    const merchantIds = offers.map((offer) => offer.merchantId);
    if (merchantIds.some((merchantId) => !merchants.some((merchant) => merchant.id === merchantId))) {
      return "Choose a merchant for every offer.";
    }
    if (new Set(merchantIds).size !== merchantIds.length) return "Each merchant can only appear once.";
    if (offers.some((offer) => !isValidHttpsUrl(offer.url.trim()))) return "Every affiliate URL must be a valid HTTPS URL.";
    return "";
  }

  async function createDraft() {
    setError("");
    const validationError = validateDraft();
    if (validationError) {
      setError(validationError);
      return;
    }

    const confirmedSuggestion = validateProductSuggestion(
      { ...suggestion, suggestedCategorySlug: selectedCategorySlug },
      categories.map((category) => category.slug),
    );
    const category = categories.find((item) => item.slug === selectedCategorySlug);
    if (!confirmedSuggestion || !category || !image) return;

    const slug = createProductSlug(name);
    setCreating(true);
    let uploadedAssetId = "";

    try {
      const duplicateCount = await client.fetch<number>(
        `count(*[_type == "product" && slug.current == $slug])`,
        { slug },
        { perspective: "raw" },
      );
      if (duplicateCount > 0) throw new Error("A published product or draft already uses this product name and slug.");

      const asset = await client.assets.upload("image", image, { filename: image.name });
      uploadedAssetId = asset._id;

      const logicalDocumentId = `product-${crypto.randomUUID()}`;
      const draftDocumentId = `drafts.${logicalDocumentId}`;
      const today = new Date().toISOString().slice(0, 10);

      await client.create({
        _id: draftDocumentId,
        _type: "product",
        name: name.trim(),
        slug: { _type: "slug", current: slug },
        category: { _type: "reference", _ref: category.id },
        summary: confirmedSuggestion.summary,
        highlights: confirmedSuggestion.highlights,
        ...(confirmedSuggestion.badge ? { badge: confirmedSuggestion.badge } : {}),
        image: {
          _type: "image",
          asset: { _type: "reference", _ref: asset._id },
          alt: confirmedSuggestion.imageAlt,
        },
        offers: offers.map((offer) => ({
          _key: offer.key.replaceAll("-", ""),
          _type: "productOffer",
          merchant: { _type: "reference", _ref: offer.merchantId },
          status: "active",
          url: offer.url.trim(),
          affiliate: true,
          lastVerifiedAt: today,
        })),
      });

      uploadedAssetId = "";
      router.navigateIntent("edit", { id: logicalDocumentId, type: "product" });
    } catch (caughtError) {
      if (uploadedAssetId) {
        try {
          await client.delete(uploadedAssetId);
        } catch {
          // Sanity may retain an unreferenced asset if cleanup is unavailable.
        }
      }
      setError(caughtError instanceof Error ? caughtError.message : "The Sanity draft could not be created.");
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
                <Heading size={3}>AI Product Assistant</Heading>
                <Text muted size={1} className={styles.heroText}>
                  Turn merchant details into clear MishBaby copy, review every field, then create a Sanity draft.
                </Text>
              </Box>
            </Flex>
          </Card>

          {error && (
            <Card padding={4} radius={2} tone="critical" role="alert">
              <Text size={1}>{error}</Text>
            </Card>
          )}

          <form onSubmit={generateCopy}>
            <div className={styles.stack5}>
              <Card padding={5} radius={3} shadow={1}>
                <div className={styles.stack4}>
                  <Heading size={2}>1. Product source</Heading>
                  <label className={styles.field}>
                    <span>Product name</span>
                    <input value={name} onChange={(event) => setName(event.target.value)} maxLength={productAssistantLimits.nameMax} placeholder="Baby Grip Socks Slippers" />
                  </label>
                  <label className={styles.field}>
                    <span>Merchant product description</span>
                    <textarea value={sourceDescription} onChange={(event) => setSourceDescription(event.target.value)} maxLength={productAssistantLimits.sourceMax} rows={8} placeholder="Paste the useful product facts from Amazon or AliExpress here..." />
                    <small>This source text is sent to Gemini but is not saved to Sanity.</small>
                  </label>
                  <label className={styles.field}>
                    <span>Product image</span>
                    <input type="file" accept={acceptedProductImageTypes.join(",")} onChange={handleImageChange} />
                    <small>JPEG, PNG, or WebP. Maximum 5 MB.</small>
                  </label>
                  {/* A local blob preview is intentionally not routed through Next Image. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {imagePreviewUrl && <img className={styles.imagePreview} src={imagePreviewUrl} alt="Selected product preview" />}
                </div>
              </Card>

              <Card padding={5} radius={3} shadow={1}>
                <div className={styles.stack4}>
                  <Flex align="center" justify="space-between" gap={3}>
                    <Heading size={2}>2. Merchant offers</Heading>
                    <Button type="button" mode="ghost" text="Add offer" onClick={() => setOffers((current) => [...current, newOffer()])} />
                  </Flex>
                  {loadingOptions ? (
                    <Flex align="center" gap={2}><Spinner muted /><Text muted size={1}>Loading merchants...</Text></Flex>
                  ) : merchants.length === 0 ? (
                    <Text muted size={1}>Create and publish a merchant before adding offers.</Text>
                  ) : (
                    <div className={styles.stack3}>
                      {offers.map((offer, index) => (
                        <div className={styles.offerRow} key={offer.key}>
                          <label className={styles.field}>
                            <span>Merchant {index + 1}</span>
                            <select value={offer.merchantId} onChange={(event) => updateOffer(offer.key, "merchantId", event.target.value)}>
                              <option value="">Choose merchant</option>
                              {merchants.map((merchant) => <option key={merchant.id} value={merchant.id}>{merchant.name}</option>)}
                            </select>
                          </label>
                          <label className={styles.field}>
                            <span>Affiliate URL</span>
                            <input type="url" value={offer.url} onChange={(event) => updateOffer(offer.key, "url", event.target.value)} placeholder="https://..." />
                          </label>
                          <Button type="button" mode="bleed" tone="critical" text="Remove" disabled={offers.length === 1} onClick={() => removeOffer(offer.key)} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              <Flex justify="flex-end">
                <Button type="submit" text={suggestion ? "Regenerate copy" : "Generate copy"} tone="primary" loading={generating} disabled={generating || creating || loadingOptions} />
              </Flex>
            </div>
          </form>

          {suggestion && (
            <Card padding={5} radius={3} shadow={1}>
              <div className={styles.stack4}>
                <Box>
                  <Heading size={2}>3. Review and create draft</Heading>
                  <Text muted size={1} className={styles.sectionText}>Edit anything Gemini suggested before saving it to Sanity.</Text>
                </Box>
                <label className={styles.field}>
                  <span>Category</span>
                  <select value={selectedCategorySlug} onChange={(event) => setSelectedCategorySlug(event.target.value)}>
                    <option value="">Choose category</option>
                    {categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}
                  </select>
                </label>
                <label className={styles.field}>
                  <span>Short description</span>
                  <textarea rows={5} maxLength={productAssistantLimits.summaryMax} value={suggestion.summary} onChange={(event) => setSuggestion({ ...suggestion, summary: event.target.value })} />
                </label>
                <fieldset className={styles.fieldset}>
                  <legend>Why it may be useful</legend>
                  <div className={styles.stack3}>
                    {suggestion.highlights.map((highlight, index) => (
                      <input
                        key={index}
                        maxLength={productAssistantLimits.highlightMax}
                        value={highlight}
                        onChange={(event) => {
                          const highlights = [...suggestion.highlights] as [string, string, string];
                          highlights[index] = event.target.value;
                          setSuggestion({ ...suggestion, highlights });
                        }}
                        aria-label={`Product highlight ${index + 1}`}
                      />
                    ))}
                  </div>
                </fieldset>
                <label className={styles.field}>
                  <span>Badge <small>(optional)</small></span>
                  <input maxLength={productAssistantLimits.badgeMax} value={suggestion.badge} onChange={(event) => setSuggestion({ ...suggestion, badge: event.target.value })} />
                </label>
                <label className={styles.field}>
                  <span>Image alternative text</span>
                  <input maxLength={productAssistantLimits.imageAltMax} value={suggestion.imageAlt} onChange={(event) => setSuggestion({ ...suggestion, imageAlt: event.target.value })} />
                </label>
                <Card padding={4} radius={2} tone="caution">
                  <Text size={1}>Approval creates a draft only. Open it in the product editor for a final review, then publish it manually when ready.</Text>
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
