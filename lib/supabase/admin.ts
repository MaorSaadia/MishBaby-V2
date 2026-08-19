import "server-only";

import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./config";

export function createSupabaseAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!supabaseUrl || !secretKey) throw new Error("Supabase admin access is not configured.");

  return createClient(supabaseUrl, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
