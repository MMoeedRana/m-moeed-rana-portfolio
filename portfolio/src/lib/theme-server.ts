import "server-only";
import { eq } from "drizzle-orm";
import { db, hasDb } from "@/db";
import { themeSettings } from "@/db/schema";
import { DEFAULT_THEME, themeSchema, type Theme } from "./theme";

export async function getTheme(): Promise<Theme> {
  if (!hasDb) return DEFAULT_THEME;
  const [row] = await db
    .select()
    .from(themeSettings)
    .where(eq(themeSettings.isActive, true))
    .limit(1);
  const p = themeSchema.safeParse(row?.tokens);
  return p.success ? p.data : DEFAULT_THEME;
}
