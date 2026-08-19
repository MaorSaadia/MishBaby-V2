export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
export const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export function requireSupabaseConfig() {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase authentication is not configured.");
  }

  return { url: supabaseUrl, publishableKey: supabasePublishableKey };
}

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return (configuredUrl || "http://localhost:3000").replace(/\/$/, "");
}
