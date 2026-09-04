import { createClient } from "next-sanity";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sanityDataset, sanityProjectId } from "@/sanity/env";

export const runtime = "nodejs";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!token || !sanityProjectId) return errorResponse("You must be signed in to MishBaby Studio.", 401);

  const days = Number(request.nextUrl.searchParams.get("days") ?? "30");
  if (![7, 30, 90].includes(days)) return errorResponse("Choose a supported reporting period.", 400);

  const authenticatedClient = createClient({
    projectId: sanityProjectId,
    dataset: sanityDataset,
    apiVersion: "2026-09-04",
    useCdn: false,
    token,
  });

  try {
    await authenticatedClient.users.getById("me");
  } catch {
    return errorResponse("Your Studio session could not be verified. Please sign in again.", 401);
  }

  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.rpc("get_merchant_click_insights", { p_days: days });
    if (error || !data || typeof data !== "object") {
      return errorResponse("Click insights are temporarily unavailable.", 503);
    }
    return NextResponse.json({ insights: data }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return errorResponse("Click insights are temporarily unavailable.", 503);
  }
}
