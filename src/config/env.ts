import { z } from "zod";

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
});

export const env = envSchema.parse({
  VITE_API_BASE_URL: (import.meta as ImportMeta & {
    env: { VITE_API_BASE_URL: string };
  }).env.VITE_API_BASE_URL,
});