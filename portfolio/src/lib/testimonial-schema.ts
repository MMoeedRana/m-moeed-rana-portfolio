import { z } from "zod";
export const testimonialSchema = z.object({
  quote: z.string().trim().min(10, "Write at least 10 characters").max(600),
  authorName: z.string().trim().min(2, "Required").max(80),
  authorRole: z.string().trim().max(120),
  source: z.string().trim().max(60),
  rating: z.number().int().min(1).max(5),
  featured: z.boolean(),
  status: z.enum(["draft", "published", "unpublished"]),
  sortOrder: z.number().int().min(0).max(999),
});
export type TestimonialInput = z.infer<typeof testimonialSchema>;
