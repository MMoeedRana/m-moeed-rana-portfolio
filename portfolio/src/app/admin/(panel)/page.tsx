import { count, desc, eq } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/db";
import { contactMessages as m } from "@/db/schema";
import { Badge, when } from "@/components/admin/ui";

export default async function Dashboard() {
  const [byStatus, [failed], recent] = await Promise.all([
    db.select({ s: m.status, c: count() }).from(m).groupBy(m.status),
    db.select({ c: count() }).from(m).where(eq(m.notifyStatus, "failed")),
    db.select().from(m).orderBy(desc(m.createdAt)).limit(5),
  ]);
  const n = (s: string) => byStatus.find((x) => x.s === s)?.c ?? 0;
  const cards = [
    { label: "Total messages", v: byStatus.reduce((a, x) => a + x.c, 0) },
    { label: "Unread", v: n("new"), hot: n("new") > 0 },
    { label: "Archived", v: n("archived") },
    { label: "Email failures", v: failed.c, hot: failed.c > 0 },
  ];
  return (
    <div className="space-y-8">
      <h1 className="text-2xl sm:text-3xl">Dashboard</h1>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`rounded-2xl border bg-card p-4 transition-transform hover:-translate-y-1 sm:p-6 ${c.hot ? "border-primary/50" : "border-border"}`}
          >
            <p className="mono text-[11px] text-muted-foreground">{c.label}</p>
            <p
              className={`mt-2 font-mono text-3xl sm:text-4xl ${c.hot ? "text-primary" : "text-foreground"}`}
            >
              {c.v}
            </p>
          </div>
        ))}
      </div>
      <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg">Recent messages</h2>
          <Link href="/admin/messages" className="text-sm text-primary">
            View all →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">No messages yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {recent.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-foreground">
                    {r.name}{" "}
                    <span className="text-muted-foreground">· {r.email}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {when(r.createdAt)}
                  </p>
                </div>
                <Badge tone={r.status === "new" ? "primary" : "muted"}>
                  {r.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
