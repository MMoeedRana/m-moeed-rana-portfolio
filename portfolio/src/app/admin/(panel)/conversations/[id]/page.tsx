import { asc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { when } from "@/components/admin/ui";
import { db } from "@/db";
import { chatMessages } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export default async function ConversationDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const rows = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.conversationId, id))
    .orderBy(asc(chatMessages.createdAt));
  if (rows.length === 0) notFound();
  return (
    <div className="space-y-6">
      <Link href="/admin/conversations" className="tagline inline-block">
        ← All conversations
      </Link>
      <h1 className="text-2xl sm:text-3xl">Conversation</h1>
      <ul className="grid gap-3">
        {rows.map((m) => (
          <li
            key={m.id}
            className={`max-w-[85%] rounded-xl border p-4 text-[14.5px] ${m.role === "user" ? "ml-auto border-primary/30 bg-elevated" : "border-border bg-card"}`}
          >
            <p className="mono mb-1.5 text-[10px] text-muted-foreground">
              {m.role} · {when(m.createdAt)}
            </p>
            <p className="whitespace-pre-wrap break-words text-body">
              {m.content}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
