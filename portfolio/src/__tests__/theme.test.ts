import { describe, expect, it } from "vitest";
import { DEFAULT_THEME, themeSchema, themeVars } from "@/lib/theme";

describe("themeSchema", () => {
  it("accepts the default theme", () => expect(themeSchema.safeParse(DEFAULT_THEME).success).toBe(true));
  it("rejects a non-hex color", () => expect(themeSchema.safeParse({ ...DEFAULT_THEME, primary: "orange" }).success).toBe(false));
  it("rejects an out-of-range radius", () => expect(themeSchema.safeParse({ ...DEFAULT_THEME, radiusCard: 999 }).success).toBe(false));
});
describe("themeVars", () => {
  it("keeps original surface colors when unchanged", () => expect(themeVars(DEFAULT_THEME)["--elevated"]).toBe("#211D17"));
  it("derives surfaces from a custom background", () => expect(themeVars({ ...DEFAULT_THEME, background: "#000010" })["--elevated"]).toContain("color-mix"));
});
