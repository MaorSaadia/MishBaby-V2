import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { contentCacheTags } from "@/lib/content-cache";

export const runtime = "nodejs";

function json(body: object, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET?.trim();
  if (!secret) return json({ error: "Sanity revalidation is not configured." }, 503);

  let parsed;
  try {
    // Allow Content Lake mutations to propagate before expiring cached queries.
    parsed = await parseBody<unknown>(request, secret, true);
  } catch {
    return json({ error: "Invalid webhook request." }, 400);
  }

  if (parsed.isValidSignature !== true) {
    return json({ error: "Invalid webhook signature." }, 401);
  }

  const body = parsed.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return json({ error: "Expected a document ID and type." }, 400);
  }
  const { _id, _type } = body as Record<string, unknown>;
  if (typeof _id !== "string" || !_id || typeof _type !== "string" || !_type) {
    return json({ error: "Expected a document ID and type." }, 400);
  }

  // Also enforce this here in case the webhook's draft/version settings change.
  if (_id.startsWith("drafts.") || _id.startsWith("versions.")) {
    return json({ revalidated: false, reason: "Unpublished document." });
  }
  if (!Object.prototype.hasOwnProperty.call(contentCacheTags, _type)) {
    return json({ revalidated: false, reason: "Unrelated document type." });
  }

  const tag = contentCacheTags[_type as keyof typeof contentCacheTags];
  try {
    // A webhook needs immediate expiration, not stale-while-revalidate.
    // Dependent pages fetch fresh data on the next request, without a rebuild.
    revalidateTag(tag, { expire: 0 });
    return json({ revalidated: true });
  } catch {
    // Non-2xx lets Sanity retry instead of reporting a successful invalidation.
    return json({ error: "Cache invalidation failed." }, 500);
  }
}
