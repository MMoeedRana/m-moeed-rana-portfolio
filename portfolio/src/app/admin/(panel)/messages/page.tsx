import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/db";
import { contactMessages as m } from "@/db/schema";
import { deleteMessage, setMessageStatus } from "@/app/admin/actions";
import { Badge, when } from "@/components/admin/ui";

const tabs = ["all", "new", "read", "archived"] as const;
const mail = (s: string) =>
  (s === "sent" ? "success" : s === "failed" ? "danger" : "muted") as
    | "success"
    | "danger"
    | "muted";

export default async function Messages({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const f = tabs.find((t) => t === status && t !== "all") as
    | "new"
    | "read"
    | "archived"
    | undefined;
  const rows = await db
    .select()
    .from(m)
    .where(f ? eq(m.status, f) : undefined)
    .orderBy(desc(m.createdAt))
    .limit(50);
  const btn =
    "rounded-lg border border-border px-3 py-1.5 text-sm text-body transition-colors hover:border-muted-foreground hover:text-foreground";
  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl">Contact Messages</h1>
      <div className="flex flex-wrap gap-2" role="tablist">
        {tabs.map((t) => (
          <Link
            key={t}
            href={t === "all" ? "/admin/messages" : `?status=${t}`}
            className={`pill capitalize ${(f ?? "all") === t ? "!border-primary !bg-primary !text-on-primary" : ""}`}
          >
            {t}
          </Link>
        ))}
      </div>
      {rows.length === 0 && (
        <p className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Nothing here yet.
        </p>
      )}
      <ul className="grid gap-4">
        {rows.map((r) => (
          <li
            key={r.id}
            className={`rounded-2xl border bg-card p-4 sm:p-6 ${r.status === "new" ? "border-primary/40" : "border-border"}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{r.name}</p>
                <a
                  href={`mailto:${r.email}`}
                  className="break-all text-sm text-primary"
                >
                  {r.email}
                </a>
                <p className="mt-1 text-xs text-muted-foreground">
                  {when(r.createdAt)}
                  {r.projectType ? ` · ${r.projectType}` : ""}
                  {r.budget ? ` · ${r.budget}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge tone={r.status === "new" ? "primary" : "muted"}>
                  {r.status}
                </Badge>
                <Badge tone={mail(r.notifyStatus)}>
                  owner mail: {r.notifyStatus}
                </Badge>
                <Badge tone={mail(r.autoreplyStatus)}>
                  auto-reply: {r.autoreplyStatus}
                </Badge>
              </div>
            </div>
            <p className="mt-4 whitespace-pre-wrap break-words text-[15px] text-body">
              {r.message}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a
                className={`${btn} !border-primary !text-primary`}
                href={`mailto:${r.email}?subject=${encodeURIComponent("Re: your message")}&body=${encodeURIComponent(`\n\n--- ${r.name} wrote ---\n${r.message}`)}`}
              >
                Reply
              </a>
              {r.status !== "read" && (
                <form action={setMessageStatus.bind(null, r.id, "read")}>
                  <button className={btn}>Mark read</button>
                </form>
              )}
              {r.status !== "new" && (
                <form action={setMessageStatus.bind(null, r.id, "new")}>
                  <button className={btn}>Mark unread</button>
                </form>
              )}
              {r.status !== "archived" ? (
                <form action={setMessageStatus.bind(null, r.id, "archived")}>
                  <button className={btn}>Archive</button>
                </form>
              ) : (
                <form action={deleteMessage.bind(null, r.id)}>
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
