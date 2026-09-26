import { z } from "zod";

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

export const projectSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(80),

  slug: z
    .string()
    .trim()
    .min(2, "Slug is required")
    .max(60)
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      "Lowercase letters, numbers and dashes only",
    ),

  // Dynamic project category slug from projectCategories table
  category: z
    .string()
    .trim()
    .min(1, "Category is required")
    .max(40)
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      "Invalid category",
    ),

  summary: z
    .string()
    .trim()
    .min(10, "Write at least 10 characters")
    .max(300),

  body: z.string().trim().max(4000),

  chip: z.string().trim().max(60),

  tech: z.string().trim().max(200),

  live: z.boolean(),

  nda: z.boolean(),

  caseStudy: z.boolean(),

  image: z
    .string()
    .trim()
    .max(300)
    .refine(
      (v) =>
        !v ||
        /^(\/media\/[\w.-]+|https:\/\/\S+)$/.test(v),
      "Use an uploaded image or an https:// URL",
    ),

  status: z.enum(["draft", "published", "unpublished"]),

  sortOrder: z
    .number()
    .int()
    .min(0)
    .max(999),
});

export type ProjectInput = z.infer<typeof projectSchema>;