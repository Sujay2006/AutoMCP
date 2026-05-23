// Browser-safe Supabase client. Only ever reads with the anon key — write
// paths go through the FastAPI backend, which uses the service-role key
// server-side.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!url || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in .env.local",
    );
  }
  if (!_client) {
    _client = createClient(url, anonKey, {
      auth: { persistSession: false },
    });
  }
  return _client;
}
