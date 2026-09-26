import { asc, eq } from "drizzle-orm";
import { ThemeEditor } from "@/components/admin/ThemeEditor";
import { db } from "@/db";
import { themeSettings } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { themeSchema } from "@/lib/theme";
import { getTheme } from "@/lib/theme-server";

export default async function ThemePage() {
  await requireAdmin();
  const [active, rows] = await Promise.all([
    getTheme(),
    db
      .select()
      .from(themeSettings)
      .where(eq(themeSettings.isActive, false))
      .orderBy(asc(themeSettings.createdAt)),
  ]);
  const presets = rows.flatMap((r) => {
    const p = themeSchema.safeParse(r.tokens);
    return p.success ? [{ id: r.id, name: r.name, tokens: p.data }] : [];
  });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl">Theme</h1>
      <ThemeEditor initial={active} presets={presets} />
    </div>
  );
}
