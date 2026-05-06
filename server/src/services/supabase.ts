import { createClient, SupabaseClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabaseUrl: string = process.env.SUPABASE_URL || "";
const supabaseKey: string = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";

if (!supabaseUrl) {
  console.error("❌ CRITICAL: Supabase URL is missing in environment variables.");
}
if (!supabaseKey) {
  console.error("❌ CRITICAL: Supabase Service Role Key (or Anon Key) is missing.");
}

/**
 * Initialized Supabase client for backend operations.
 * Uses the Service Role Key to bypass Row Level Security (RLS) when necessary.
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);
