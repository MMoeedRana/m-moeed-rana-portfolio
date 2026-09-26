import { z } from "zod";
export const profileSchema = z.object({
  name: z.string().trim().min(2, "Required").max(80),
  email: z.string().trim().email("Enter a valid email").max(200),
});
export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Required"),
    newPassword: z.string().min(12, "At least 12 characters").max(200),
    confirmPassword: z.string().min(1, "Required"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
