import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase = url && anon ? createClient(url, anon) : null;

if (!supabase && typeof window !== "undefined") {
  console.warn(
    "[yt-site] Supabase env vars missing — running in localStorage-only mode.",
  );
}
