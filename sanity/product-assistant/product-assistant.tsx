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
import type { AmazonSearchItem, AmazonSearchResponse } from "@/lib/amazon-creators";
import { useStudioSessionToken } from "@/sanity/lib/use-studio-session-token";
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
  slug: string;
};

type OfferInput = {
  key: string;
  merchantId: string;
  url: string;
  amazonAsin: string;
};

type AssistantResponse = {
  suggestion?: ProductSuggestion;
  error?: string;
};

function newOffer(): OfferInput {
  return { key: crypto.randomUUID(), merchantId: "", url: "", amazonAsin: "" };
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
  const studioToken = useStudioSessionToken();
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
  const [amazonQuery, setAmazonQuery] = useState("");
  const [amazonResults, setAmazonResults] = useState<AmazonSearchItem[]>([]);
  const [selectedAmazonItem, setSelectedAmazonItem] = useState<AmazonSearchItem | null>(null);
  const [amazonSearching, setAmazonSearching] = useState(false);
  const [amazonMessage, setAmazonMessage] = useState("");

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
          name,
          "slug": slug.current
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

  function updateOffer(key: string, field: "merchantId" | "url" | "amazonAsin", value: string) {
    setOffers((current) => current.map((offer) => (offer.key === key ? { ...offer, [field]: value } : offer)));
  }

  function updateOfferMerchant(key: string, merchantId: string) {
    const merchant = merchants.find((option) => option.id === merchantId);
    setOffers((current) => current.map((offer) => offer.key === key
      ? { ...offer, merchantId, ...(merchant?.slug !== "amazon" ? { amazonAsin: "" } : {}) }
      : offer));
  }

  function removeOffer(key: string) {
    setOffers((current) => current.filter((offer) => offer.key !== key));
  }

  async function searchAmazon(event: FormEvent) {
    event.preventDefault();
    const normalized = amazonQuery.trim().replace(/\s+/g, " ");
    setAmazonMessage("");
    if (normalized.length < 2 || normalized.length > 80) {
      setAmazonMessage("Enter between 2 and 80 characters.");
      return;
    }

    setAmazonSearching(true);
    try {
      const response = await fetch("/api/amazon/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: normalized, page: 1 }),
      });
      const result = await response.json() as AmazonSearchResponse & { error?: string };
      if (!response.ok) throw new Error(result.error || "Amazon search is temporarily unavailable.");
      setAmazonResults(result.items);
      if (result.items.length === 0) setAmazonMessage("Amazon did not return any results for that search.");
    } catch (caughtError) {
      setAmazonResults([]);
      setAmazonMessage(caughtError instanceof Error ? caughtError.message : "Amazon search is temporarily unavailable.");
    } finally {
      setAmazonSearching(false);
    }
  }

  async function selectAmazonResult(item: AmazonSearchItem) {
    setError("");
    setAmazonMessage("");
    const amazonMerchant = merchants.find((merchant) => merchant.slug === "amazon");
    if (!amazonMerchant) {
      setAmazonMessage("Create and publish a merchant with the slug amazon before selecting a result.");
      return;
    }

    try {
      const duplicateCount = await client.fetch<number>(
        `count(*[_type == "product" && count(offers[amazonAsin == $asin]) > 0])`,
        { asin: item.asin },
        { perspective: "raw" },
      );
      if (duplicateCount > 0) {
        setAmazonMessage("A published product or draft already uses this Amazon ASIN.");
        return;
      }

      setSelectedAmazonItem(item);
      setSuggestion(null);
      setOffers((current) => {
        const existingIndex = current.findIndex((offer) => offer.merchantId === amazonMerchant.id);
        if (existingIndex >= 0) {
          return current.map((offer, index) => index === existingIndex
            ? { ...offer, amazonAsin: item.asin, url: "" }
            : offer);
        }
        const emptyIndex = current.findIndex((offer) => !offer.merchantId && !offer.url && !offer.amazonAsin);
        if (emptyIndex >= 0) {
          return current.map((offer, index) => index === emptyIndex
            ? { ...offer, merchantId: amazonMerchant.id, amazonAsin: item.asin, url: "" }
            : offer);
        }
        return [...current, { ...newOffer(), merchantId: amazonMerchant.id, amazonAsin: item.asin }];
      });
      setAmazonMessage("Amazon ASIN added. Write original MishBaby details and upload an approved image below.");
    } catch {
      setAmazonMessage("The ASIN could not be checked against Sanity. Please try again.");
    }
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

    if (studioToken === undefined) {
      setError("Your Studio session is still loading. Please wait a moment and try again.");
      return;
    }
    if (!studioToken) {
      setError("Studio could not verify your session. Sign out of Studio, then sign in again.");
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
        headers: { Authorization: `Bearer ${studioToken}` },
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
    for (const offer of offers) {
      const merchant = merchants.find((option) => option.id === offer.merchantId);
      const asin = offer.amazonAsin.trim().toUpperCase();
      if (asin && !/^[A-Z0-9]{10}$/.test(asin)) return "Amazon ASINs must contain exactly 10 letters or numbers.";
      if (merchant?.slug === "amazon" && asin) continue;
      if (!isValidHttpsUrl(offer.url.trim())) return "Every offer requires a valid HTTPS URL, unless it uses an Amazon ASIN.";
    }
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
    const amazonAsin = offers.find((offer) => offer.amazonAsin)?.amazonAsin.trim().toUpperCase() ?? "";
    setCreating(true);
    let uploadedAssetId = "";

    try {
      const duplicateCount = await client.fetch<number>(
        `count(*[_type == "product" && (slug.current == $slug || ($amazonAsin != "" && count(offers[amazonAsin == $amazonAsin]) > 0))])`,
        { slug, amazonAsin },
        { perspective: "raw" },
      );
      if (duplicateCount > 0) throw new Error("A published product or draft already uses this product slug or Amazon ASIN.");

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
          ...(offer.url.trim() ? { url: offer.url.trim() } : {}),
          ...(offer.amazonAsin.trim() ? { amazonAsin: offer.amazonAsin.trim().toUpperCase() } : {}),
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

          <Card padding={5} radius={3} shadow={1}>
            <div className={styles.stack4}>
              <Box>
                <Heading size={2}>Find a product on Amazon</Heading>
                <Text muted size={1} className={styles.sectionText}>
                  Search Amazon US, select a reference, then write original MishBaby content. Only the ASIN is saved to Sanity.
                </Text>
              </Box>
              <form onSubmit={searchAmazon}>
                <Flex align="flex-end" gap={3} wrap="wrap">
                  <label className={`${styles.field} ${styles.amazonSearchField}`}>
                    <span>Amazon Baby search</span>
                    <input value={amazonQuery} onChange={(event) => setAmazonQuery(event.target.value)} minLength={2} maxLength={80} placeholder="Bottle warmer" />
                  </label>
                  <Button type="submit" text="Search Amazon" tone="primary" loading={amazonSearching} disabled={amazonSearching || loadingOptions} />
                </Flex>
              </form>
              {amazonMessage && <Text size={1} muted>{amazonMessage}</Text>}
              {selectedAmazonItem && (
                <Card padding={4} radius={2} tone="positive">
                  <Flex align="center" gap={3}>
                    {selectedAmazonItem.image && (
                      // Amazon's image remains a temporary API reference and is never uploaded to Sanity.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className={styles.amazonReferenceImage} src={selectedAmazonItem.image.url} alt="" />
                    )}
                    <div className={styles.amazonReferenceText}>
                      <Text weight="semibold" size={1}>{selectedAmazonItem.title}</Text>
                      <Text muted size={1}>ASIN {selectedAmazonItem.asin} selected</Text>
                    </div>
                  </Flex>
                </Card>
              )}
              {amazonResults.length > 0 && (
                <div className={styles.amazonResults}>
                  {amazonResults.map((item) => (
                    <article key={item.asin} className={styles.amazonResult}>
                      <div className={styles.amazonResultImage}>
                        {item.image ? (
                          // Amazon's image is displayed directly and is not persisted by MishBaby.
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.image.url} alt="" />
                        ) : <span>No image</span>}
                      </div>
                      <div className={styles.amazonResultBody}>
                        <Text size={1} weight="semibold">{item.title}</Text>
                        <Text muted size={1}>ASIN {item.asin}</Text>
                        <Button type="button" mode="ghost" text={selectedAmazonItem?.asin === item.asin ? "Selected" : "Use as reference"} disabled={selectedAmazonItem?.asin === item.asin} onClick={() => void selectAmazonResult(item)} />
                      </div>
                    </article>
                  ))}
                </div>
              )}
              <Card padding={3} radius={2} tone="caution">
                <Text size={1}>Amazon titles, images, and API URLs are temporary reference content. Upload your approved image and write MishBaby’s own product details before creating the draft.</Text>
              </Card>
            </div>
          </Card>

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
                            <select value={offer.merchantId} onChange={(event) => updateOfferMerchant(offer.key, event.target.value)}>
                              <option value="">Choose merchant</option>
                              {merchants.map((merchant) => <option key={merchant.id} value={merchant.id}>{merchant.name}</option>)}
                            </select>
                          </label>
                          <div className={styles.offerDestinations}>
                            <label className={styles.field}>
                              <span>Affiliate URL {merchants.find((merchant) => merchant.id === offer.merchantId)?.slug === "amazon" && <small>(optional with ASIN)</small>}</span>
                              <input type="url" value={offer.url} onChange={(event) => updateOffer(offer.key, "url", event.target.value)} placeholder="https://..." />
                            </label>
                            {merchants.find((merchant) => merchant.id === offer.merchantId)?.slug === "amazon" && (
                              <label className={styles.field}>
                                <span>Amazon ASIN <small>(Creator API)</small></span>
                                <input value={offer.amazonAsin} onChange={(event) => updateOffer(offer.key, "amazonAsin", event.target.value.toUpperCase())} maxLength={10} placeholder="B0XXXXXXXX" />
                              </label>
                            )}
                          </div>
                          <Button type="button" mode="bleed" tone="critical" text="Remove" disabled={offers.length === 1} onClick={() => removeOffer(offer.key)} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              <Flex justify="flex-end">
                <Button type="submit" text={suggestion ? "Regenerate copy" : "Generate copy"} tone="primary" loading={generating} disabled={generating || creating || loadingOptions || studioToken === undefined} />
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
