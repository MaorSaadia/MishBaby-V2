import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  createMerchantClickVisitorHash,
  isMerchantClickSurface,
  verifyMerchantClickToken,
} from "@/lib/merchant-clicks";

export const runtime = "nodejs";

const headers = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};

function json(body: object, status: number) {
  return NextResponse.json(body, { status, headers });
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
    if (rawBody.length > 2048) return json({ error: "The request is too large." }, 413);
    body = JSON.parse(rawBody);
  } catch {
    return json({ error: "The request could not be read." }, 400);
  }

  const record = body && typeof body === "object" ? body as Record<string, unknown> : {};
  const identity = typeof record.token === "string" ? verifyMerchantClickToken(record.token) : null;
  if (!identity || !isMerchantClickSurface(record.surface)) {
    return json({ error: "The click details are invalid." }, 400);
  }

  const visitorIp = getVisitorIp(request);
  const visitorHash = visitorIp ? createMerchantClickVisitorHash(visitorIp) : null;
  if (!visitorHash) return json({ error: "Click insights are temporarily unavailable." }, 503);

  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.rpc("record_merchant_click", {
      p_visitor_hash: visitorHash,
      p_product_id: identity.productId,
      p_product_name: identity.productName,
      p_product_slug: identity.productSlug,
      p_merchant_id: identity.merchantId,
      p_merchant_name: identity.merchantName,
      p_affiliate: identity.affiliate,
      p_surface: record.surface,
    });

    if (error) return json({ error: "Click insights are temporarily unavailable." }, 503);
    if (data !== true) return json({ error: "Too many click events were submitted." }, 429);
    return new NextResponse(null, { status: 204, headers });
  } catch {
    return json({ error: "Click insights are temporarily unavailable." }, 503);
  }
}
