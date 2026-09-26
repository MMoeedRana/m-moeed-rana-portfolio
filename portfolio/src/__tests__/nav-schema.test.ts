import { describe, expect, it } from "vitest";
import { navItemSchema, socialSchema } from "@/lib/nav-schema";

describe("navItemSchema", () => {
  it("accepts a relative path", () => expect(navItemSchema.safeParse({ label: "Work", href: "/projects", desktop: true, visible: true }).success).toBe(true));
  it("accepts an https URL", () => expect(navItemSchema.safeParse({ label: "Blog", href: "https://example.com", desktop: true, visible: true }).success).toBe(true));
  it("rejects a javascript: URL", () => expect(navItemSchema.safeParse({ label: "Hack", href: "javascript:alert(1)", desktop: true, visible: true }).success).toBe(false));
  it("rejects an empty label", () => expect(navItemSchema.safeParse({ label: "", href: "/", desktop: true, visible: true }).success).toBe(false));
});
describe("socialSchema", () => {
  it("allows a blank URL (WhatsApp/Email derive it)", () => expect(socialSchema.safeParse({ platform: "whatsapp", label: "WhatsApp", url: "", enabled: true, newTab: true }).success).toBe(true));
  it("rejects a non-https URL", () => expect(socialSchema.safeParse({ platform: "custom", label: "Site", url: "ftp://example.com", enabled: true, newTab: true }).success).toBe(false));
});
