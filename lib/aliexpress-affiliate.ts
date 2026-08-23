import "server-only";

import { createHash, createHmac } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const aliexpressEndpoint = "https://api-sg.aliexpress.com/sync";
const aliexpressMethod = "aliexpress.affiliate.product.query";
const aliexpressSearchCacheVersion = "v2";
const aliexpressSearchCacheHours = 1;
const aliexpressSearchHourlyLimit = 10;
const aliexpressSearchDailyLimit = 200;
export const aliexpressSearchMaximumPage = 3;

export type AliExpressSearchItem = {
  productId: string;
  title: string;
  promotionUrl: string;
  image?: { url: string };
  salePrice?: { amount: string; currency: "USD" };
  originalPrice?: { amount: string; currency: "USD" };
  positiveFeedback?: number;
  recentSales?: number;
};

export type AliExpressSearchResponse = {
  query: string;
  page: number;
  totalResultCount: number;
  hasMore: boolean;
  items: AliExpressSearchItem[];
};

type CachedAliExpressSearchResponse = Omit<AliExpressSearchResponse, "query">;

type AliExpressConfig = {
  appKey: string;
  appSecret: string;
  trackingId: string;
  rateLimitSecret: string;
};

type RawAliExpressProduct = {
  product_id?: unknown;
  product_title?: unknown;
  product_main_image_url?: unknown;
  promotion_link?: unknown;
  target_sale_price?: unknown;
  target_sale_price_currency?: unknown;
  sale_price?: unknown;
  sale_price_currency?: unknown;
  target_original_price?: unknown;
  target_original_price_currency?: unknown;
  original_price?: unknown;
  original_price_currency?: unknown;
  evaluate_rate?: unknown;
  lastest_volume?: unknown;
};

type RawAliExpressResponse = {
  aliexpress_affiliate_product_query_response?: {
    resp_result?: {
      resp_code?: unknown;
      result?: {
        current_page_no?: unknown;
        total_page_no?: unknown;
        total_record_count?: unknown;
        products?: { product?: unknown } | unknown[];
      };
    };
  };
  error_response?: unknown;
};

export function normalizeAliExpressSearchQuery(value: unknown) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().replace(/\s+/g, " ");
  return normalized.length >= 2 && normalized.length <= 80 ? normalized : null;
}

export function parseAliExpressSearchPage(value: unknown) {
  return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= aliexpressSearchMaximumPage
    ? Number(value)
    : null;
}

export function getAliExpressConfig(): AliExpressConfig | null {
  const appKey = process.env.ALIEXPRESS_APP_KEY?.trim();
  const appSecret = process.env.ALIEXPRESS_APP_SECRET?.trim();
  const trackingId = process.env.ALIEXPRESS_TRACKING_ID?.trim();
  const rateLimitSecret = process.env.ALIEXPRESS_SEARCH_RATE_LIMIT_SECRET?.trim();

  if (!appKey || !appSecret || !trackingId || !rateLimitSecret || rateLimitSecret.length < 32) return null;
  if (appKey.length > 128 || appSecret.length > 256 || trackingId.length > 128) return null;
  return { appKey, appSecret, trackingId, rateLimitSecret };
}

export function createAliExpressVisitorHash(ipAddress: string, secret: string) {
  return createHash("sha256").update(`${secret}:${ipAddress}`).digest("hex");
}

function createCacheKey(query: string, page: number) {
  return createHash("sha256")
    .update(`${aliexpressSearchCacheVersion}:US:USD:EN:${page}:${query.toLocaleLowerCase("en-US")}`)
    .digest("hex");
}

function formatIopTimestamp(date = new Date()) {
  return String(date.getTime());
}

export function signAliExpressTopRequest(parameters: Record<string, string>, secret: string) {
  const signatureInput = Object.entries(parameters)
    .filter(([key, value]) => key !== "sign" && value.length > 0)
    .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
    .map(([key, value]) => `${key}${value}`)
    .join("");

  return createHmac("sha256", secret).update(signatureInput, "utf8").digest("hex").toUpperCase();
}

function isAliExpressPromotionUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:"
      && (url.hostname === "aliexpress.com" || url.hostname.endsWith(".aliexpress.com"));
  } catch {
    return false;
  }
}

function isAliExpressImageUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:"
      && (url.hostname === "alicdn.com"
        || url.hostname.endsWith(".alicdn.com")
        || url.hostname === "aliexpress-media.com"
        || url.hostname.endsWith(".aliexpress-media.com"));
  } catch {
    return false;
  }
}

function normalizedText(value: unknown, maximumLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").slice(0, maximumLength);
}

function normalizedInteger(value: unknown) {
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value.trim()) : Number.NaN;
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 1_000_000_000 ? parsed : undefined;
}

function normalizedPercentage(value: unknown) {
  if (typeof value !== "string" && typeof value !== "number") return undefined;
  const parsed = Number(String(value).trim().replace(/%$/, ""));
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 100 ? Math.round(parsed * 10) / 10 : undefined;
}

function normalizedUsdPrice(amount: unknown, currency: unknown) {
  if (String(currency).trim().toUpperCase() !== "USD") return undefined;
  const normalized = typeof amount === "number" ? String(amount) : typeof amount === "string" ? amount.trim() : "";
  if (!/^(?:0|[1-9]\d{0,5})(?:\.\d{1,2})?$/.test(normalized)) return undefined;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 100_000) return undefined;
  return { amount: parsed.toFixed(2), currency: "USD" as const };
}

function rawProducts(value: RawAliExpressResponse) {
  const products = value.aliexpress_affiliate_product_query_response?.resp_result?.result?.products;
  if (Array.isArray(products)) return products as RawAliExpressProduct[];
  if (products && typeof products === "object" && "product" in products) {
    const entries = products.product;
    return Array.isArray(entries) ? entries as RawAliExpressProduct[] : entries && typeof entries === "object" ? [entries as RawAliExpressProduct] : [];
  }
  return [];
}

function parseAliExpressResponse(rawResponse: unknown, query: string, requestedPage: number): AliExpressSearchResponse | null {
  const response = rawResponse as RawAliExpressResponse;
  const responseRoot = response.aliexpress_affiliate_product_query_response?.resp_result;
  if (Number(responseRoot?.resp_code) !== 200 || !responseRoot?.result) return null;

  const items = rawProducts(response).flatMap((rawItem): AliExpressSearchItem[] => {
    const productId = String(rawItem.product_id ?? "").trim();
    const title = normalizedText(rawItem.product_title, 320);
    const promotionUrl = normalizedText(rawItem.promotion_link, 2048);
    if (!/^\d{5,24}$/.test(productId) || !title || !isAliExpressPromotionUrl(promotionUrl)) return [];

    const imageUrl = normalizedText(rawItem.product_main_image_url, 2048);
    const salePrice = normalizedUsdPrice(
      rawItem.target_sale_price ?? rawItem.sale_price,
      rawItem.target_sale_price_currency ?? rawItem.sale_price_currency,
    );
    const candidateOriginalPrice = normalizedUsdPrice(
      rawItem.target_original_price ?? rawItem.original_price,
      rawItem.target_original_price_currency ?? rawItem.original_price_currency,
    );
    const originalPrice = salePrice && candidateOriginalPrice && Number(candidateOriginalPrice.amount) > Number(salePrice.amount)
      ? candidateOriginalPrice
      : undefined;
    const positiveFeedback = normalizedPercentage(rawItem.evaluate_rate);
    const recentSales = normalizedInteger(rawItem.lastest_volume);

    return [{
      productId,
      title,
      promotionUrl,
      ...(isAliExpressImageUrl(imageUrl) ? { image: { url: imageUrl } } : {}),
      ...(salePrice ? { salePrice } : {}),
      ...(originalPrice ? { originalPrice } : {}),
      ...(positiveFeedback !== undefined ? { positiveFeedback } : {}),
      ...(recentSales !== undefined ? { recentSales } : {}),
    }];
  });

  const result = responseRoot.result;
  const responsePage = normalizedInteger(result.current_page_no) ?? requestedPage;
  const totalResultCount = normalizedInteger(result.total_record_count) ?? items.length;
  const totalPageCount = normalizedInteger(result.total_page_no) ?? Math.ceil(totalResultCount / 10);

  return {
    query,
    page: Math.min(Math.max(responsePage, 1), aliexpressSearchMaximumPage),
    totalResultCount,
    hasMore: requestedPage < aliexpressSearchMaximumPage && requestedPage < totalPageCount,
    items,
  };
}

export async function searchAliExpressProducts(query: string, page: number) {
  let admin: ReturnType<typeof createSupabaseAdminClient>;
  try {
    admin = createSupabaseAdminClient();
  } catch {
    return { ok: false as const, reason: "storage_unavailable" as const };
  }

  const cacheKey = createCacheKey(query, page);
  const { data: cached, error } = await admin
    .from("aliexpress_search_cache")
    .select("payload")
    .eq("cache_key", cacheKey)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error) return { ok: false as const, reason: "storage_unavailable" as const };
  if (cached?.payload) {
    return {
      ok: true as const,
      data: { ...(cached.payload as CachedAliExpressSearchResponse), query },
      cached: true as const,
    };
  }

  return { ok: true as const, cacheKey, admin, cached: false as const };
}

export async function consumeAliExpressSearchQuota(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  visitorHash: string,
) {
  const { data, error } = await admin.rpc("consume_aliexpress_search_quota", {
    p_visitor_hash: visitorHash,
    p_hourly_limit: aliexpressSearchHourlyLimit,
    p_daily_limit: aliexpressSearchDailyLimit,
  });
  const result = Array.isArray(data) ? data[0] : undefined;
  if (error || !result || typeof result.allowed !== "boolean") return { ok: false as const, reason: "storage_unavailable" as const };
  return result.allowed
    ? { ok: true as const }
    : { ok: false as const, reason: result.reason === "hourly_limit" ? "hourly_limit" as const : "daily_limit" as const };
}

export async function fetchAndCacheAliExpressProducts(
  query: string,
  page: number,
  config: AliExpressConfig,
  cacheKey: string,
  admin: ReturnType<typeof createSupabaseAdminClient>,
) {
  const parameters: Record<string, string> = {
    method: aliexpressMethod,
    app_key: config.appKey,
    sign_method: "sha256",
    timestamp: formatIopTimestamp(),
    format: "json",
    simplify: "false",
    keywords: query,
    page_no: String(page),
    page_size: "10",
    platform_product_type: "ALL",
    target_currency: "USD",
    target_language: "EN",
    tracking_id: config.trackingId,
    ship_to_country: "US",
  };
  parameters.sign = signAliExpressTopRequest(parameters, config.appSecret);

  try {
    const response = await fetch(aliexpressEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: new URLSearchParams(parameters),
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
    if (!response.ok) return { ok: false as const, reason: "aliexpress_unavailable" as const };

    const rawResponse: unknown = await response.json();
    const data = parseAliExpressResponse(rawResponse, query, page);
    if (!data) return { ok: false as const, reason: "aliexpress_unavailable" as const };

    const cachePayload: CachedAliExpressSearchResponse = {
      page: data.page,
      totalResultCount: data.totalResultCount,
      hasMore: data.hasMore,
      items: data.items,
    };
    const expiresAt = new Date(Date.now() + aliexpressSearchCacheHours * 60 * 60 * 1000).toISOString();
    const { error } = await admin.from("aliexpress_search_cache").upsert({
      cache_key: cacheKey,
      payload: cachePayload,
      expires_at: expiresAt,
    }, { onConflict: "cache_key" });
    if (error) return { ok: false as const, reason: "storage_unavailable" as const };

    return { ok: true as const, data, cached: false as const };
  } catch {
    return { ok: false as const, reason: "aliexpress_unavailable" as const };
  }
}
