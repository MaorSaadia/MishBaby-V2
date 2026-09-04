import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { ActiveOffer, Product } from "@/lib/products";

export const merchantClickSurfaces = ["hero", "mobile_tray", "comparison"] as const;
export type MerchantClickSurface = (typeof merchantClickSurfaces)[number];

type MerchantClickIdentity = {
  version: 1;
  productId: string;
  productName: string;
  productSlug: string;
  merchantId: string;
  merchantName: string;
  affiliate: boolean;
};

function getSecret() {
  const secret = process.env.MERCHANT_CLICK_RATE_LIMIT_SECRET?.trim();
  return secret && secret.length >= 32 ? secret : null;
}

function sign(encodedPayload: string, secret: string) {
  return createHmac("sha256", secret)
    .update(`merchant-click:v1:${encodedPayload}`, "utf8")
    .digest("base64url");
}

function isValidIdentity(value: unknown): value is MerchantClickIdentity {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return record.version === 1
    && typeof record.productId === "string" && record.productId.length >= 1 && record.productId.length <= 128
    && typeof record.productName === "string" && record.productName.length >= 1 && record.productName.length <= 160
    && typeof record.productSlug === "string" && record.productSlug.length >= 1 && record.productSlug.length <= 160
    && typeof record.merchantId === "string" && record.merchantId.length >= 1 && record.merchantId.length <= 128
    && typeof record.merchantName === "string" && record.merchantName.length >= 1 && record.merchantName.length <= 120
    && typeof record.affiliate === "boolean";
}

export function createMerchantClickToken(
  product: Pick<Product, "id" | "name" | "slug">,
  offer: Pick<ActiveOffer, "affiliate" | "merchant">,
) {
  const secret = getSecret();
  if (!secret) return undefined;

  const identity: MerchantClickIdentity = {
    version: 1,
    productId: product.id,
    productName: product.name,
    productSlug: product.slug,
    merchantId: offer.merchant.id,
    merchantName: offer.merchant.name,
    affiliate: offer.affiliate,
  };
  const encodedPayload = Buffer.from(JSON.stringify(identity), "utf8").toString("base64url");
  return `${encodedPayload}.${sign(encodedPayload, secret)}`;
}

export function verifyMerchantClickToken(token: string) {
  const secret = getSecret();
  if (!secret || token.length > 1400) return null;

  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;

  try {
    const expected = Buffer.from(sign(parts[0], secret), "base64url");
    const supplied = Buffer.from(parts[1], "base64url");
    if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return null;

    const identity: unknown = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
    return isValidIdentity(identity) ? identity : null;
  } catch {
    return null;
  }
}

export function createMerchantClickVisitorHash(ipAddress: string) {
  const secret = getSecret();
  if (!secret) return null;
  return createHash("sha256").update(`merchant-click-visitor:${secret}:${ipAddress}`).digest("hex");
}

export function isMerchantClickSurface(value: unknown): value is MerchantClickSurface {
  return typeof value === "string" && merchantClickSurfaces.includes(value as MerchantClickSurface);
}
