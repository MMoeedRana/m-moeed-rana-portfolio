import { describe, expect, it } from "vitest";
import { projectSchema, slugify } from "@/lib/project-schema";

describe("slugify", () => {
  it("lowercases and dashes", () => expect(slugify("DOCSURE AI!!")).toBe("docsure-ai"));
  it("trims stray dashes", () => expect(slugify("  --Todo AI--  ")).toBe("todo-ai"));
});
describe("projectSchema", () => {
  const base = { title: "DOCSURE", slug: "docsure", category: "voice" as const, summary: "Voice AI that books appointments end-to-end for clinics.", body: "", chip: "", tech: "Vapi, n8n", live: true, nda: false, caseStudy: true, image: "", status: "published" as const, sortOrder: 0 };
  it("accepts a valid project", () => expect(projectSchema.safeParse(base).success).toBe(true));
  it("rejects an uppercase slug", () => expect(projectSchema.safeParse({ ...base, slug: "DocSure" }).success).toBe(false));
  it("accepts a /media image", () => expect(projectSchema.safeParse({ ...base, image: "/media/abc123.png" }).success).toBe(true));
  it("rejects a data: URI image", () => expect(projectSchema.safeParse({ ...base, image: "data:image/png;base64,AAAA" }).success).toBe(false));
});
