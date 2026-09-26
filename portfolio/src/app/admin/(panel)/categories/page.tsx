import { asc } from "drizzle-orm";
import { CategoriesEditor } from "@/components/admin/CategoriesEditor";
import { db } from "@/db";
import { projectCategories } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export default async function CategoriesPage() {
  await requireAdmin();
  const rows = await db
    .select({ slug: projectCategories.slug, label: projectCategories.label })
    .from(projectCategories)
    .orderBy(asc(projectCategories.sortOrder));
  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl">Project Categories</h1>
      <CategoriesEditor initial={rows} />
    </div>
  );
}
