import { describe, expect, it } from "vitest";
import { BLOCKS, conform, fill } from "@/lib/blocks";

describe("content block validation", () => {
  it("fills missing optional keys from the template", () => {
    const filled = fill({ name: "Moeed" }, BLOCKS.brand.shape);
    expect(filled).toMatchObject({ name: "Moeed", initials: BLOCKS.brand.shape.initials });
  });
  it("conforms a valid brand block", () => {
    const v = fill({ name: "Moeed Rana", initials: "MR", role: "Engineer", tagline: "Lahore" }, BLOCKS.brand.shape);
    expect(() => conform(v, BLOCKS.brand.shape)).not.toThrow();
  });
  it("rejects an unsafe link field", () => {
    const v = fill({ ...BLOCKS.hero.shape, primaryCta: { label: "Go", href: "javascript:alert(1)" } }, BLOCKS.hero.shape);
    expect(() => conform(v, BLOCKS.hero.shape)).toThrow();
  });
  it("rejects an oversized array", () => {
    const big = Array.from({ length: 61 }, () => "x");
    expect(() => conform({ items: big }, BLOCKS.marquee.shape)).toThrow();
  });
  it("flags an invalid contact block via check()", () => {
    const v = fill({ email: "not-an-email", whatsapp: "123", whatsappDisplay: "" }, BLOCKS.contact.shape);
    expect(BLOCKS.contact.check!(v)).toBeTruthy();
  });
 
  it("restores a whole missing array field from the template, not an empty one", () => {
    const legacyHero = { ...BLOCKS.hero.shape, nodes: undefined } as Record<string, unknown>;
    delete legacyHero.nodes;
    const filled = fill(legacyHero, BLOCKS.hero.shape) as { nodes: string[] };
    expect(filled.nodes).toEqual(BLOCKS.hero.shape.nodes);
    expect(filled.nodes.length).toBe(6);
  });
});
