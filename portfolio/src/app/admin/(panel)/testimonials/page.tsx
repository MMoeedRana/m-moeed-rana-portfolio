import { asc } from "drizzle-orm";
import Link from "next/link";
import { deleteTestimonial, setTestimonialStatus } from "@/app/admin/actions";
import { Badge } from "@/components/admin/ui";
import { db } from "@/db";
import { testimonials } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export default async function TestimonialsAdmin() {
  await requireAdmin();
  const rows = await db
    .select()
    .from(testimonials)
    .orderBy(asc(testimonials.sortOrder));
  const btn =
    "rounded-lg border border-border px-3 py-1.5 text-sm text-body hover:border-muted-foreground hover:text-foreground";
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl">Testimonials</h1>
        <Link href="/admin/testimonials/new" className="btn !py-2.5 !text-sm">
          New testimonial
        </Link>
      </div>
      {rows.length === 0 && (
        <p className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          None yet — add a real client quote once a project wraps up.
        </p>
      )}
      <ul className="grid gap-3">
        {rows.map((r) => (
          <li
            key={r.id}
            className="rounded-2xl border border-border bg-card p-4 sm:p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="line-clamp-2 text-[15px] text-foreground">
                  &ldquo;{r.quote}&rdquo;
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {r.authorName} · {r.authorRole || "—"}
                </p>
              </div>
              <Badge tone={r.status === "published" ? "success" : "muted"}>
                {r.status}
              </Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link className={btn} href={`/admin/testimonials/${r.id}`}>
                Edit
              </Link>
              <form
                action={setTestimonialStatus.bind(
                  null,
                  r.id,
                  r.status === "published" ? "unpublished" : "published",
                )}
              >
                <button className={btn}>
                  {r.status === "published" ? "Unpublish" : "Publish"}
                </button>
              </form>
              <form action={deleteTestimonial.bind(null, r.id)}>
                <button
                  className={`${btn} hover:!border-red-400 hover:!text-red-400`}
                >
                  Delete
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
