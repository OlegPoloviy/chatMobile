import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

export const supabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
