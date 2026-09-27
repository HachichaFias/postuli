import "server-only";
import { z } from "zod";

// The only place that reads process.env (ADR 008). Each story adds the keys it needs.
const schema = z.object({
  DATABASE_URL: z.string().url(),
});

export const env = schema.parse(process.env);
