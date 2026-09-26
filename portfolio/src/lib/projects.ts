import { and, asc, eq, isNull } from "drizzle-orm";
import { db, hasDb } from "@/db";
import { projects } from "@/db/schema";
import { projectsSeed } from "@/content/projects.seed";
import type { ProjectCard } from "@/content/types";

const pub = and(eq(projects.status, "published"), isNull(projects.deletedAt));
const map = (r: typeof projects.$inferSelect): ProjectCard => {
  const m = r.meta as Partial<ProjectCard>;
  return {
    slug: r.slug,
    title: r.title,
    category: r.category,
    summary: r.summary,
    body: r.body,
    chip: m.chip ?? "",
    tech: m.tech ?? [],
    live: m.live ?? true,
    nda: m.nda ?? false,
    caseStudy: m.caseStudy ?? false,
    image: m.image ?? "",
  };
};
export async function getProjects(): Promise<ProjectCard[]> {
  if (!hasDb) return projectsSeed;
  return (
    await db.select().from(projects).where(pub).orderBy(asc(projects.sortOrder))
  ).map(map);
}
export async function getProject(slug: string): Promise<ProjectCard | null> {
  if (!hasDb) return projectsSeed.find((p) => p.slug === slug) ?? null;
  const [r] = await db
    .select()
    .from(projects)
    .where(and(pub, eq(projects.slug, slug)))
    .limit(1);
  return r ? map(r) : null;
}
