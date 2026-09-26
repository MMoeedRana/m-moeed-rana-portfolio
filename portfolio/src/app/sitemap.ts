import type { MetadataRoute } from "next";
import { db, hasDb } from "@/db";
import { projects } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const routes = [
    "",
    "/projects",
    "/services",
    "/about",
    "/testimonials",
    "/contact",
    "/ask-my-ai",
  ].map((p) => ({ url: `${base}${p}`, lastModified: new Date() }));
  if (!hasDb) return routes;
  const rows = await db
    .select({ slug: projects.slug, updatedAt: projects.updatedAt })
    .from(projects)
    .where(and(eq(projects.status, "published"), isNull(projects.deletedAt)));
  return [
    ...routes,
    ...rows.map((r) => ({
      url: `${base}/projects/${r.slug}`,
      lastModified: r.updatedAt,
    })),
  ];
}
