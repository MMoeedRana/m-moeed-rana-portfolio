import { desc, sql } from "drizzle-orm";
import Link from "next/link";
import { deleteConversation } from "@/app/admin/actions";
import { when } from "@/components/admin/ui";
import { db } from "@/db";
import { chatMessages, conversations } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export default async function ConversationsAdmin() {
  await requireAdmin();
  const rows = await db
    .select({
      id: conversations.id,
      title: conversations.title,
      createdAt: conversations.createdAt,
      count: sql<number>`count(${chatMessages.id})`,
    })
    .from(conversations)
    .leftJoin(
      chatMessages,
      sql`${chatMessages.conversationId} = ${conversations.id}`,
    )
    .groupBy(conversations.id)
    .orderBy(desc(conversations.createdAt))
    .limit(100);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl">AI Conversations</h1>
      {rows.length === 0 && (
        <p className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          No conversations yet.
        </p>
      )}
      <ul className="grid gap-3">
        {rows.map((r) => (
          <li
            key={r.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 sm:p-5"
          >
            <div className="min-w-0">
              <Link
                href={`/admin/conversations/${r.id}`}
                className="truncate font-medium text-foreground hover:text-primary"
              >
                {r.title || "Untitled"}
              </Link>
              <p className="mt-1 text-xs text-muted-foreground">
                {when(r.createdAt)} · {r.count} messages
              </p>
            </div>
            <form action={deleteConversation.bind(null, r.id)}>
              <button className="rounded-lg border border-border px-3 py-1.5 text-sm text-body hover:border-red-400 hover:text-red-400">
                Delete
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
