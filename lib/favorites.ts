import "server-only";

import { createServerSupabaseClient } from "./supabase/server";

export async function getFavoriteProductIds(userId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("product_favorites")
    .select("product_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return {
    productIds: data?.map((favorite) => favorite.product_id as string) ?? [],
    error: Boolean(error),
  };
}
