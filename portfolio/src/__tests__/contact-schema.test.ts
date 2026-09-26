import { describe, expect, it } from "vitest";
import { contactSchema } from "@/lib/contact-schema";

describe("contactSchema", () => {
  const valid = { name: "Jane Recruiter", email: "jane@example.com", message: "We'd like to discuss a voice AI project for our clinic." };
  it("accepts a valid submission", () => expect(contactSchema.safeParse(valid).success).toBe(true));
  it("rejects a short name", () => expect(contactSchema.safeParse({ ...valid, name: "J" }).success).toBe(false));
  it("rejects an invalid email", () => expect(contactSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false));
  it("rejects a too-short message", () => expect(contactSchema.safeParse({ ...valid, message: "hi" }).success).toBe(false));
  it("accepts an empty honeypot field", () => expect(contactSchema.safeParse({ ...valid, website: "" }).success).toBe(true));
  it("rejects a filled honeypot field (bot)", () => expect(contactSchema.safeParse({ ...valid, website: "spam" }).success).toBe(false));
});
