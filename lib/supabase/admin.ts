import "server-only";
import { createClient } from "@supabase/supabase-js";

/** Klien service-role: MELEWATI RLS. Hanya untuk kode server tepercaya
 *  (Quick-Action berbasis token, audit log, cron). */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SECRET_KEY belum diisi di .env.local",
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
