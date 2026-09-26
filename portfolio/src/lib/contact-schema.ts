import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(200),
  projectType: z.string().trim().max(100).optional(),
  budget: z.string().trim().max(50).optional(),
  message: z
    .string()
    .trim()
    .min(10, "Tell me a bit more (10+ characters)")
    .max(4000),
  website: z.string().max(0).optional(),
});
export type ContactInput = z.infer<typeof contactSchema>;
