import { asc } from "drizzle-orm";
import { EMPTY, ProjectForm } from "@/components/admin/ProjectForm";
import { db } from "@/db";
import { projectCategories } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export default async function NewProject() {
  await requireAdmin();
  const categories = await db
    .select({ slug: projectCategories.slug, label: projectCategories.label })
    .from(projectCategories)
    .orderBy(asc(projectCategories.sortOrder));
  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl">New project</h1>
      <ProjectForm
        id={null}
        defaults={{ ...EMPTY, category: categories[0]?.slug ?? "" }}
        categories={categories}
      />
    </div>
  );
}
