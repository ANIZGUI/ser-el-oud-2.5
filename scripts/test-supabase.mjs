import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "vite";

const env = loadEnv("development", process.cwd(), "");
const supabaseUrl = env.VITE_SUPABASE_URL?.trim() ?? "";
const supabaseKey =
  env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ??
  env.VITE_SUPABASE_ANON_KEY?.trim() ??
  "";

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "[ERROR] Supabase is not configured. Create .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const { data, error } = await supabase
  .from("orders")
  .select("id, created_at")
  .limit(1);

if (error) {
  console.error("[ERROR] Supabase query failed:", error.message);
  if (error.code) console.error("Code:", error.code);
  if (error.details) console.error("Details:", error.details);
  if (error.hint) console.error("Hint:", error.hint);
  process.exit(1);
}

console.log("[OK] Supabase connected. The orders table is readable.");
console.log(`Rows returned: ${data?.length ?? 0}`);
