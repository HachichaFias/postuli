import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/server/env";
import type { Database } from "./database.types";

// Secret-key client: bypasses Row Level Security (ADR 009). Only for admin scripts, background
// jobs and event writes — never for work done on behalf of a signed-in user.
export function createAdminClient() {
  return createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
