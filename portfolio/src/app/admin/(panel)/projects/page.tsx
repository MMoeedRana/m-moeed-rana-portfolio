import { asc, isNull } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/db";
import { projects as pr } from "@/db/schema";
import { deleteProject, setProjectStatus } from "@/app/admin/actions";
import { Badge } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";

export default async function ProjectsAdmin() {
  await requireAdmin();
  const rows = await db
    .select()
    .from(pr)
    .where(isNull(pr.deletedAt))
    .orderBy(asc(pr.sortOrder));
  const btn =
    "rounded-lg border border-border px-3 py-1.5 text-sm text-body transition-colors hover:border-muted-foreground hover:text-foreground";
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl">Projects</h1>
        <Link href="/admin/projects/new" className="btn !py-2.5 !text-sm">
          New project
        </Link>
      </div>
      {rows.length === 0 && (
        <p className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          No projects yet.
        </p>
      )}
      <ul className="grid gap-3">
        {rows.map((r) => (
          <li
            key={r.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{r.title}</p>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                /{r.slug} · order {r.sortOrder}
              </p>
              <div className="mt-2 flex gap-2">
                <Badge tone={r.status === "published" ? "success" : "muted"}>
                  {r.status}
                </Badge>
                <Badge>{r.category}</Badge>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link className={btn} href={`/admin/projects/${r.id}`}>
                Edit
              </Link>
              <form
                action={setProjectStatus.bind(
                  null,
                  r.id,
                  r.status === "published" ? "unpublished" : "published",
                )}
              >
                <button className={btn}>
                  {r.status === "published" ? "Unpublish" : "Publish"}
                </button>
              </form>
              {r.status !== "published" && (
                <form action={deleteProject.bind(null, r.id)}>
                  <button
                    className={`${btn} hover:!border-red-400 hover:!text-red-400`}
                  >
                    Delete
                  </button>
                </form>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
