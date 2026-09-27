import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/server/env";
import type { Database } from "./database.types";

// User-scoped client: acts as the signed-in user, so Row Level Security applies (ADR 009).
// Create one per request; never share it across requests.
export async function createUserClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components can't set cookies; proxy.ts refreshes the session (ADR 010).
        }
      },
    },
  });
}
