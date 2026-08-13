import { supabase } from "./utils/supabase";

async function testConnection() {
  if (!supabase) {
    console.error(
      "[ERROR] Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env.local."
    );
    return;
  }

  const { data, error } = await supabase
    .from("orders")
    .select("id, created_at")
    .limit(1);

  if (error) {
    console.error("[ERROR] Supabase connection failed:", error.message);
  } else {
    console.log("[OK] Supabase connected. The orders table is readable.");
    console.log(`Rows returned: ${data?.length ?? 0}`);
  }
}

testConnection();
