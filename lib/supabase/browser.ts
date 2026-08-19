"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabasePublishableKey, supabaseUrl } from "./config";

let browserClient: SupabaseClient | undefined;

export function getBrowserSupabaseClient() {
  if (!isSupabaseConfigured) return null;

  browserClient ??= createBrowserClient(supabaseUrl, supabasePublishableKey);
  return browserClient;
}
