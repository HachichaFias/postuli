import "server-only";
import { z } from "zod";

// The only place that reads process.env (ADR 008). Each story adds the keys it needs.
const schema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  SUPABASE_SECRET_KEY: z.string().min(1),
});

export const env = schema.parse(process.env);
