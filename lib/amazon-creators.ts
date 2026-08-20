import "server-only";

import { createHash } from "node:crypto";
import { ApiClient, DefaultApi, GetItemsRequestContent, SearchItemsRequestContent } from "@amzn/creatorsapi-nodejs-sdk";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const amazonSearchCacheVersion = "v1";
const amazonOfferLinkCacheVersion = "offer-link-v2";
const amazonOfferDetailsCacheVersion = "offer-details-v1";
const amazonSearchCacheHours = 24;
const amazonOfferCacheHours = 1;
const amazonSearchHourlyLimit = 10;
const amazonSearchDailyLimit = 250;
export const amazonSearchMaximumPage = 3;

export type AmazonSearchItem = {
  asin: string;
  title: string;
  detailPageUrl: string;
  image?: {
    url: string;
    width: number;
    height: number;
  };
};

export type AmazonSearchResponse = {
  query: string;
  page: number;
  totalResultCount: number;
  hasMore: boolean;
  items: AmazonSearchItem[];
};

export type AmazonOfferLink = Pick<AmazonSearchItem, "asin" | "detailPageUrl"> & {
  price?: { displayAmount: string };
  availability?: { type: string; message?: string };
};

export type AmazonOfferLinkResponse = {
  items: AmazonOfferLink[];
  offersUpdatedAt?: string;
};

type CachedAmazonSearchResponse = Omit<AmazonSearchResponse, "query">;

type AmazonConfig = {
  credentialId: string;
  credentialSecret: string;
  credentialVersion: string;
  partnerTag: string;
  marketplace: "www.amazon.com";
  rateLimitSecret: string;
};

type RawAmazonImage = { url?: unknown; width?: unknown; height?: unknown };
type RawAmazonItem = {
  asin?: unknown;
  detailPageURL?: unknown;
  images?: { primary?: { large?: RawAmazonImage } };
  itemInfo?: { title?: { displayValue?: unknown } };
  offersV2?: {
    listings?: Array<{
      availability?: { type?: unknown; message?: unknown };
      price?: { money?: { displayAmount?: unknown } };
      violatesMAP?: unknown;
    }>;
  };
};
type RawAmazonResponse = {
  searchResult?: {
    totalResultCount?: unknown;
    items?: RawAmazonItem[];
  };
};
type RawAmazonItemsResponse = {
  itemsResult?: { items?: RawAmazonItem[] };
};

let api: DefaultApi | undefined;

export function normalizeAmazonSearchQuery(value: unknown) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().replace(/\s+/g, " ");
  return normalized.length >= 2 && normalized.length <= 80 ? normalized : null;
}

export function parseAmazonSearchPage(value: unknown) {
  return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= amazonSearchMaximumPage
    ? Number(value)
    : null;
}

export function getAmazonConfig(): AmazonConfig | null {
  const credentialId = process.env.AMAZON_CREATORS_CREDENTIAL_ID?.trim();
  const credentialSecret = process.env.AMAZON_CREATORS_CREDENTIAL_SECRET?.trim();
  const credentialVersion = process.env.AMAZON_CREATORS_CREDENTIAL_VERSION?.trim();
  const partnerTag = process.env.AMAZON_CREATORS_PARTNER_TAG?.trim();
  const marketplace = process.env.AMAZON_CREATORS_MARKETPLACE?.trim();
  const rateLimitSecret = process.env.AMAZON_SEARCH_RATE_LIMIT_SECRET?.trim();

  if (!credentialId || !credentialSecret || !credentialVersion || !partnerTag || marketplace !== "www.amazon.com" || !rateLimitSecret || rateLimitSecret.length < 32) {
    return null;
  }
  if (!/^(2\.[123]|3\.[123])$/.test(credentialVersion)) return null;

  return { credentialId, credentialSecret, credentialVersion, partnerTag, marketplace, rateLimitSecret };
}

export function createAmazonVisitorHash(ipAddress: string, secret: string) {
  return createHash("sha256").update(`${secret}:${ipAddress}`).digest("hex");
}

function createCacheKey(query: string, page: number, marketplace: string) {
  return createHash("sha256")
    .update(`${amazonSearchCacheVersion}:${marketplace}:${page}:${query.toLocaleLowerCase("en-US")}`)
    .digest("hex");
}

function createOfferCacheKey(version: string, asins: string[], marketplace: string) {
  return createHash("sha256")
    .update(`${version}:${marketplace}:${asins.join(",")}`)
    .digest("hex");
}

function isAmazonDetailPageUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "amazon.com" || url.hostname.endsWith(".amazon.com"));
  } catch {
    return false;
  }
}

function isAmazonImageUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "m.media-amazon.com";
  } catch {
    return false;
  }
}

function parseAmazonResponse(rawResponse: unknown, query: string, page: number): AmazonSearchResponse {
  const response = rawResponse as RawAmazonResponse;
  const rawItems = Array.isArray(response.searchResult?.items) ? response.searchResult.items : [];
  const items = rawItems.flatMap((rawItem): AmazonSearchItem[] => {
    const asin = typeof rawItem.asin === "string" ? rawItem.asin.trim().toUpperCase() : "";
    const title = typeof rawItem.itemInfo?.title?.displayValue === "string" ? rawItem.itemInfo.title.displayValue.trim() : "";
    const detailPageUrl = typeof rawItem.detailPageURL === "string" ? rawItem.detailPageURL.trim() : "";
    if (!/^[A-Z0-9]{10}$/.test(asin) || !title || !isAmazonDetailPageUrl(detailPageUrl)) return [];

    const rawImage = rawItem.images?.primary?.large;
    const imageUrl = typeof rawImage?.url === "string" ? rawImage.url.trim() : "";
    const width = typeof rawImage?.width === "number" && Number.isFinite(rawImage.width) ? rawImage.width : 0;
    const height = typeof rawImage?.height === "number" && Number.isFinite(rawImage.height) ? rawImage.height : 0;

    return [{
      asin,
      title: title.slice(0, 320),
      detailPageUrl,
      ...(isAmazonImageUrl(imageUrl) && width > 0 && height > 0 ? { image: { url: imageUrl, width, height } } : {}),
    }];
  });
  const rawTotal = response.searchResult?.totalResultCount;
  const totalResultCount = typeof rawTotal === "number" && Number.isInteger(rawTotal) && rawTotal >= 0 ? rawTotal : items.length;
  const maximumVisibleResults = amazonSearchMaximumPage * 10;

  return {
    query,
    page,
    totalResultCount,
    hasMore: page < amazonSearchMaximumPage && page * 10 < Math.min(totalResultCount, maximumVisibleResults),
    items,
  };
}

function getApi(config: AmazonConfig) {
  if (api) return api;
  const client = new ApiClient();
  client.credentialId = config.credentialId;
  client.credentialSecret = config.credentialSecret;
  client.version = config.credentialVersion;
  api = new DefaultApi(client);
  return api;
}

export async function searchAmazonProducts(query: string, page: number, config: AmazonConfig) {
  const admin = createSupabaseAdminClient();
  const cacheKey = createCacheKey(query, page, config.marketplace);
  const now = new Date();
  const { data: cached, error: cacheError } = await admin
    .from("amazon_search_cache")
    .select("payload")
    .eq("cache_key", cacheKey)
    .gt("expires_at", now.toISOString())
    .maybeSingle();
  if (cacheError) return { ok: false as const, reason: "storage_unavailable" as const };
  if (cached?.payload) {
    return {
      ok: true as const,
      data: { ...(cached.payload as CachedAmazonSearchResponse), query },
      cached: true as const,
    };
  }

  return { ok: true as const, cacheKey, admin, cached: false as const };
}

export function normalizeAmazonAsins(value: unknown) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 10) return null;
  const asins = [...new Set(value.map((item) => typeof item === "string" ? item.trim().toUpperCase() : ""))].sort();
  return asins.length > 0 && asins.every((asin) => /^[A-Z0-9]{10}$/.test(asin)) ? asins : null;
}

export async function getCachedAmazonOfferLinks(asins: string[], config: AmazonConfig) {
  const admin = createSupabaseAdminClient();
  const cacheKey = createOfferCacheKey(amazonOfferDetailsCacheVersion, asins, config.marketplace);
  const linkCacheKey = createOfferCacheKey(amazonOfferLinkCacheVersion, asins, config.marketplace);
  const now = new Date().toISOString();
  const { data: cached, error } = await admin
    .from("amazon_search_cache")
    .select("payload")
    .eq("cache_key", cacheKey)
    .gt("expires_at", now)
    .maybeSingle();

  if (error) return { ok: false as const, reason: "storage_unavailable" as const };
  if (cached?.payload) {
    return { ok: true as const, data: cached.payload as AmazonOfferLinkResponse, cached: true as const };
  }

  const { data: linkCache, error: linkCacheError } = await admin
    .from("amazon_search_cache")
    .select("payload")
    .eq("cache_key", linkCacheKey)
    .gt("expires_at", now)
    .maybeSingle();
  if (linkCacheError) return { ok: false as const, reason: "storage_unavailable" as const };

  return {
    ok: true as const,
    cacheKey,
    linkCacheKey,
    admin,
    cached: false as const,
    fallbackData: linkCache?.payload as AmazonOfferLinkResponse | undefined,
  };
}

export async function consumeAmazonSearchQuota(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  visitorHash: string,
) {
  const { data, error } = await admin.rpc("consume_amazon_search_quota", {
    p_visitor_hash: visitorHash,
    p_hourly_limit: amazonSearchHourlyLimit,
    p_daily_limit: amazonSearchDailyLimit,
  });
  const result = Array.isArray(data) ? data[0] : undefined;
  if (error || !result || typeof result.allowed !== "boolean") return { ok: false, reason: "storage_unavailable" as const };
  return result.allowed
    ? { ok: true as const }
    : { ok: false as const, reason: result.reason === "hourly_limit" ? "hourly_limit" as const : "daily_limit" as const };
}

export async function fetchAndCacheAmazonProducts(
  query: string,
  page: number,
  config: AmazonConfig,
  cacheKey: string,
  admin: ReturnType<typeof createSupabaseAdminClient>,
) {
  const requestContent = new SearchItemsRequestContent();
  requestContent.partnerTag = config.partnerTag;
  requestContent.keywords = query;
  requestContent.searchIndex = "Baby";
  requestContent.itemCount = 10;
  requestContent.itemPage = page;
  requestContent.languagesOfPreference = ["en_US"];
  requestContent.resources = ["images.primary.large", "itemInfo.title"];

  try {
    const rawResponse = await getApi(config).searchItems(config.marketplace, { searchItemsRequestContent: requestContent });
    const data = parseAmazonResponse(rawResponse, query, page);
    const cachePayload: CachedAmazonSearchResponse = {
      page: data.page,
      totalResultCount: data.totalResultCount,
      hasMore: data.hasMore,
      items: data.items,
    };
    const expiresAt = new Date(Date.now() + amazonSearchCacheHours * 60 * 60 * 1000).toISOString();
    const { error } = await admin.from("amazon_search_cache").upsert({
      cache_key: cacheKey,
      payload: cachePayload,
      expires_at: expiresAt,
    }, { onConflict: "cache_key" });
    if (error) return { ok: false as const, reason: "storage_unavailable" as const };
    return { ok: true as const, data, cached: false as const };
  } catch {
    return { ok: false as const, reason: "amazon_unavailable" as const };
  }
}

export async function fetchAndCacheAmazonOfferLinks(
  asins: string[],
  config: AmazonConfig,
  cacheKey: string,
  linkCacheKey: string,
  admin: ReturnType<typeof createSupabaseAdminClient>,
) {
  const requestContent = new GetItemsRequestContent(config.partnerTag, asins);
  requestContent.languagesOfPreference = ["en_US"];
  requestContent.resources = ["offersV2.listings.price", "offersV2.listings.availability"];

  try {
    const rawResponse = await getApi(config).getItems(config.marketplace, requestContent) as RawAmazonItemsResponse;
    const rawItems = Array.isArray(rawResponse.itemsResult?.items) ? rawResponse.itemsResult.items : [];
    const offersUpdatedAt = new Date().toISOString();
    const data: AmazonOfferLinkResponse = {
      offersUpdatedAt,
      items: rawItems.flatMap((rawItem): AmazonOfferLink[] => {
        const asin = typeof rawItem.asin === "string" ? rawItem.asin.trim().toUpperCase() : "";
        const detailPageUrl = typeof rawItem.detailPageURL === "string" ? rawItem.detailPageURL.trim() : "";
        if (!/^[A-Z0-9]{10}$/.test(asin) || !asins.includes(asin) || !isAmazonDetailPageUrl(detailPageUrl)) return [];

        const listing = Array.isArray(rawItem.offersV2?.listings) ? rawItem.offersV2.listings[0] : undefined;
        const displayAmount = typeof listing?.price?.money?.displayAmount === "string"
          ? listing.price.money.displayAmount.trim()
          : "";
        const availabilityType = typeof listing?.availability?.type === "string"
          ? listing.availability.type.trim().toUpperCase()
          : "";
        const availabilityMessage = typeof listing?.availability?.message === "string"
          ? listing.availability.message.trim()
          : "";

        return [{
          asin,
          detailPageUrl,
          ...(listing?.violatesMAP !== true && displayAmount && displayAmount.length <= 64
            ? { price: { displayAmount } }
            : {}),
          ...(availabilityType && availabilityType.length <= 32
            ? { availability: {
                type: availabilityType,
                ...(availabilityMessage && availabilityMessage.length <= 160 ? { message: availabilityMessage } : {}),
              } }
            : {}),
        }];
      }),
    };
    const linkData: AmazonOfferLinkResponse = {
      items: data.items.map(({ asin, detailPageUrl }) => ({ asin, detailPageUrl })),
    };
    const offerExpiresAt = new Date(Date.now() + amazonOfferCacheHours * 60 * 60 * 1000).toISOString();
    const linkExpiresAt = new Date(Date.now() + amazonSearchCacheHours * 60 * 60 * 1000).toISOString();
    const { error } = await admin.from("amazon_search_cache").upsert([
      { cache_key: cacheKey, payload: data, expires_at: offerExpiresAt },
      { cache_key: linkCacheKey, payload: linkData, expires_at: linkExpiresAt },
    ], { onConflict: "cache_key" });
    if (error) return { ok: false as const, reason: "storage_unavailable" as const };
    return { ok: true as const, data, cached: false as const };
  } catch {
    return { ok: false as const, reason: "amazon_unavailable" as const };
  }
}
