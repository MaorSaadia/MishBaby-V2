import { NextRequest, NextResponse } from "next/server";
import {
  consumeAliExpressTrendingQuota,
  createAliExpressVisitorHash,
  fetchAndCacheAliExpressTrendingProducts,
  getAliExpressConfig,
  getCachedAliExpressTrendingProducts,
  parseAliExpressSearchPage,
  parseAliExpressTrendingCategory,
} from "@/lib/aliexpress-affiliate";

export const runtime = "nodejs";

const responseHeaders = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};

function json(body: object, status = 200, extraHeaders?: HeadersInit) {
  return NextResponse.json(body, { status, headers: { ...responseHeaders, ...extraHeaders } });
}

function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === request.nextUrl.origin;
  } catch {
    return false;
  }
}

function getVisitorIp(request: NextRequest) {
  const forwarded = request.headers.get("x-vercel-forwarded-for") ?? request.headers.get("x-forwarded-for");
  const address = forwarded?.split(",")[0]?.trim();
  if (address && address.length <= 64) return address;
  return process.env.NODE_ENV === "development" ? "local-development" : null;
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return json({ error: "This request is not allowed." }, 403);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return json({ error: "Send this request as JSON." }, 415);
  }

  let body: unknown;
  try {
    const rawBody = await request.text();
    if (rawBody.length > 512) return json({ error: "The request is too large." }, 413);
    body = JSON.parse(rawBody);
  } catch {
    return json({ error: "Choose a valid baby-product category." }, 400);
  }

  const record = body && typeof body === "object" ? body as Record<string, unknown> : {};
  const categoryKey = parseAliExpressTrendingCategory(record.category);
  const page = parseAliExpressSearchPage(record.page);
  if (!categoryKey || !page) return json({ error: "Choose a valid baby-product category and page." }, 400);

  const config = getAliExpressConfig();
  const visitorIp = getVisitorIp(request);
  if (!config || !visitorIp) return json({ error: "Trending AliExpress products are temporarily unavailable." }, 503);

  const cacheLookup = await getCachedAliExpressTrendingProducts(categoryKey, page);
  if (!cacheLookup.ok) return json({ error: "Trending AliExpress products are temporarily unavailable." }, 503);
  if (cacheLookup.cached) return json(cacheLookup.data);

  const quota = await consumeAliExpressTrendingQuota(
    cacheLookup.admin,
    createAliExpressVisitorHash(visitorIp, config.rateLimitSecret, "trending"),
  );
  if (!quota.ok) {
    if (quota.reason === "hourly_limit") {
      return json({ error: "You've reached the hourly AliExpress request limit. Please try again later." }, 429, { "Retry-After": "3600" });
    }
    return json({ error: "AliExpress has reached today's usage limit. Please try again tomorrow." }, 503);
  }

  const result = await fetchAndCacheAliExpressTrendingProducts(
    categoryKey,
    page,
    config,
    cacheLookup.cacheKey,
    cacheLookup.admin,
  );
  if (!result.ok) return json({ error: "AliExpress couldn't load trending baby products right now. Please try again shortly." }, 503);
  return json(result.data);
}
