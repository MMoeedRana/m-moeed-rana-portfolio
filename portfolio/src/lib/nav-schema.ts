import { z } from "zod";

const href = z
  .string()
  .trim()
  .min(1)
  .max(200)
  .refine(
    (v) => /^(\/|https?:\/\/|#)/.test(v),
    "Must start with /, https:// or #",
  );
export const navItemSchema = z.object({
  label: z.string().trim().min(1, "Required").max(30),
  href,
  desktop: z.boolean(),
  visible: z.boolean(),
});
export const ctaSchema = z.object({
  label: z.string().trim().min(1, "Required").max(30),
  href,
  visible: z.boolean(),
});
export const socialSchema = z.object({
  platform: z.enum([
    "linkedin",
    "github",
    "whatsapp",
    "email",
    "twitter",
    "instagram",
    "youtube",
    "custom",
  ]),
  label: z.string().trim().min(1, "Required").max(30),
  url: z
    .string()
    .trim()
    .max(300)
    .refine(
      (v) => v === "" || /^(https?:\/\/|mailto:)/.test(v),
      "Use an https:// URL (or leave blank for WhatsApp/Email)",
    ),
  enabled: z.boolean(),
  newTab: z.boolean(),
});
