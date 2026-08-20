import { NextRequest, NextResponse } from "next/server";
import {
  consumeAmazonSearchQuota,
  createAmazonVisitorHash,
  fetchAndCacheAmazonOfferLinks,
  getAmazonConfig,
  getCachedAmazonOfferLinks,
  normalizeAmazonAsins,
} from "@/lib/amazon-creators";

export const runtime = "nodejs";

const responseHeaders = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};

function json(body: object, status = 200, extraHeaders?: Record<string, string>) {
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
  if (!isSameOrigin(request)) return json({ error: "This Amazon offer request is not allowed." }, 403);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return json({ error: "Send the Amazon offer request as JSON." }, 415);
  }

  let body: unknown;
  try {
    const rawBody = await request.text();
    if (rawBody.length > 1024) return json({ error: "The Amazon offer request is too large." }, 413);
    body = JSON.parse(rawBody);
  } catch {
    return json({ error: "The Amazon offer request is invalid." }, 400);
  }

  const record = body && typeof body === "object" ? body as Record<string, unknown> : {};
  const asins = normalizeAmazonAsins(record.asins);
  if (!asins) return json({ error: "Choose between one and ten valid Amazon products." }, 400);

  const config = getAmazonConfig();
  const visitorIp = getVisitorIp(request);
  if (!config || !visitorIp) return json({ error: "Amazon offers are temporarily unavailable." }, 503);

  const cacheLookup = await getCachedAmazonOfferLinks(asins, config);
  if (!cacheLookup.ok) return json({ error: "Amazon offers are temporarily unavailable." }, 503);
  if (cacheLookup.cached) return json(cacheLookup.data);

  const quota = await consumeAmazonSearchQuota(
    cacheLookup.admin,
    createAmazonVisitorHash(visitorIp, config.rateLimitSecret),
  );
  if (!quota.ok) {
    if (quota.reason === "hourly_limit") {
      return json({ error: "The hourly Amazon request limit has been reached." }, 429, { "Retry-After": "3600" });
    }
    return json({ error: "Amazon offers have reached today’s usage limit." }, 503);
  }

  const result = await fetchAndCacheAmazonOfferLinks(asins, config, cacheLookup.cacheKey, cacheLookup.admin);
  if (!result.ok) return json({ error: "Amazon offers are temporarily unavailable." }, 503);
  return json(result.data);
}
