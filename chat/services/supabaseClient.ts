import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

export const supabaseClient = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL as string,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string
);
