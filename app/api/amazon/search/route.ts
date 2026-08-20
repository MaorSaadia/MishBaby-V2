import { NextRequest, NextResponse } from "next/server";
import {
  consumeAmazonSearchQuota,
  createAmazonVisitorHash,
  fetchAndCacheAmazonProducts,
  getAmazonConfig,
  normalizeAmazonSearchFilters,
  normalizeAmazonSearchQuery,
  parseAmazonSearchPage,
  searchAmazonProducts,
} from "@/lib/amazon-creators";

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
  if (!isSameOrigin(request)) return json({ error: "This search request is not allowed." }, 403);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return json({ error: "Send the search as JSON." }, 415);
  }

  let body: unknown;
  try {
    const rawBody = await request.text();
    if (rawBody.length > 1024) return json({ error: "The search request is too large." }, 413);
    body = JSON.parse(rawBody);
  } catch {
    return json({ error: "Enter a valid search." }, 400);
  }

  const record = body && typeof body === "object" ? body as Record<string, unknown> : {};
  const query = normalizeAmazonSearchQuery(record.query);
  const page = parseAmazonSearchPage(record.page);
  const filters = normalizeAmazonSearchFilters(record);
  if (!query || !page || !filters) return json({ error: "Review the search phrase, price range, rating, and sorting options." }, 400);

  const config = getAmazonConfig();
  const visitorIp = getVisitorIp(request);
  if (!config || !visitorIp) return json({ error: "Amazon search is temporarily unavailable." }, 503);

  const cacheLookup = await searchAmazonProducts(query, page, filters, config);
  if (!cacheLookup.ok) return json({ error: "Amazon search is temporarily unavailable." }, 503);
  if (cacheLookup.cached) return json(cacheLookup.data);

  const visitorHash = createAmazonVisitorHash(visitorIp, config.rateLimitSecret);
  const quota = await consumeAmazonSearchQuota(cacheLookup.admin, visitorHash);
  if (!quota.ok) {
    if (quota.reason === "hourly_limit") {
      return json({ error: "You’ve reached the hourly Amazon search limit. Please try again later." }, 429, { "Retry-After": "3600" });
    }
    return json({ error: "Amazon search has reached today’s usage limit. Please try again tomorrow." }, 503);
  }

  const result = await fetchAndCacheAmazonProducts(query, page, filters, config, cacheLookup.cacheKey, cacheLookup.admin);
  if (!result.ok) return json({ error: "Amazon couldn’t complete this search right now. Please try again shortly." }, 503);
  return json(result.data);
}
