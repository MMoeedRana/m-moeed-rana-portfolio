import { and, asc, eq, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { db } from "@/db";
import { projectCategories, projects } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import type { ProjectInput } from "@/lib/project-schema";

export default async function EditProject({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;

  if (!z.string().uuid().safeParse(id).success) {
    notFound();
  }

  const [[r], categories] = await Promise.all([
    db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.id, id),
          isNull(projects.deletedAt),
        ),
      )
      .limit(1),

    db
      .select({
        slug: projectCategories.slug,
        label: projectCategories.label,
      })
      .from(projectCategories)
      .orderBy(asc(projectCategories.sortOrder)),
  ]);

  if (!r) {
    notFound();
  }

  const m = r.meta as {
    chip?: string;
    tech?: string[];
    live?: boolean;
    nda?: boolean;
    caseStudy?: boolean;
    image?: string;
  };

  const defaults: ProjectInput = {
    title: r.title,
    slug: r.slug,
    category: r.category as ProjectInput["category"],
    summary: r.summary,
    body: r.body,
    chip: m.chip ?? "",
    tech: (m.tech ?? []).join(", "),
    live: m.live ?? true,
    nda: m.nda ?? false,
    caseStudy: m.caseStudy ?? false,
    image: m.image ?? "",
    status: r.status,
    sortOrder: r.sortOrder,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl">Edit project</h1>

      <ProjectForm
        id={r.id}
        defaults={defaults}
        categories={categories}
      />
    </div>
  );
}