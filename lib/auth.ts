import { isSupabaseConfigured } from "./supabase/config";
import { createServerSupabaseClient } from "./supabase/server";

export const minimumPasswordLength = 8;

export function sanitizeReturnPath(value: FormDataEntryValue | string | null | undefined, fallback = "/account") {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }

  try {
    const url = new URL(value, "https://mishbaby.local");
    return url.origin === "https://mishbaby.local" ? `${url.pathname}${url.search}${url.hash}` : fallback;
  } catch {
    return fallback;
  }
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured) return null;
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser();
  return error ? null : data.user;
}
