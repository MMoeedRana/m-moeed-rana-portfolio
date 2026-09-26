import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db, hasDb } from "@/db";
import { chatMessages, contentBlocks, conversations } from "@/db/schema";

const schema = z.object({
  message: z.string().trim().min(1).max(1000),
  mode: z.enum(["auto", "portfolio", "recruiter"]).default("auto"),
  sessionId: z.string().min(8).max(64),
  conversationId: z.string().uuid().optional(),
});
const hits = new Map<string, number[]>();
const err = (m: string, status: number) =>
  NextResponse.json({ error: m }, { status });

export async function POST(req: Request) {
  const { AI_ENABLED, AI_SERVICE_URL, INTERNAL_API_KEY } = process.env;
  if (AI_ENABLED !== "true" || !AI_SERVICE_URL || !INTERNAL_API_KEY)
    return err("AI assistant is currently unavailable.", 503);

  const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local",
    now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 600_000);
  if (recent.length >= 15)
    return err(
      "You're sending messages too quickly. Please wait a few minutes.",
      429,
    );
  hits.set(ip, [...recent, now]);

  const p = schema.safeParse(await req.json().catch(() => null));
  if (!p.success) return err("Invalid request.", 400);
  const b = p.data;

  let convId: string | null = null,
    history: { role: string; content: string }[] = [];
  if (hasDb) {
    const [st] = await db
      .select()
      .from(contentBlocks)
      .where(eq(contentBlocks.key, "ai_settings"))
      .limit(1);
    const s = { storeConversations: true, history: 8, ...(st?.data ?? {}) } as {
      storeConversations: boolean;
      history: number;
    };
    if (s.storeConversations) {
      if (b.conversationId) {
        const [c] = await db
          .select({ id: conversations.id })
          .from(conversations)
          .where(
            and(
              eq(conversations.id, b.conversationId),
              eq(conversations.sessionId, b.sessionId),
            ),
          )
          .limit(1);
        convId = c?.id ?? null;
      }
      if (convId)
        history = (
          await db
            .select({ role: chatMessages.role, content: chatMessages.content })
            .from(chatMessages)
            .where(eq(chatMessages.conversationId, convId))
            .orderBy(desc(chatMessages.createdAt))
            .limit(s.history)
        ).reverse();
      else
        convId = (
          await db
            .insert(conversations)
            .values({ sessionId: b.sessionId, title: b.message.slice(0, 60) })
            .returning({ id: conversations.id })
        )[0].id;
      await db
        .insert(chatMessages)
        .values({ conversationId: convId, role: "user", content: b.message });
    }
  }

  const up = await fetch(`${AI_SERVICE_URL}/ai/stream`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-internal-key": INTERNAL_API_KEY,
    },
    body: JSON.stringify({ message: b.message, mode: b.mode, history }),
    signal: AbortSignal.timeout(60_000),
  }).catch(() => null);
  if (!up?.ok || !up.body)
    return err(
      "AI service is temporarily unavailable. Please try again shortly.",
      502,
    );

  let text = "",
    sources: string[] = [],
    buf = "";
  const dec = new TextDecoder(),
    cid = convId;

  const tee = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, ctl) {
      ctl.enqueue(chunk);

      buf += dec.decode(chunk, {
        stream: true,
      });

      const parts = buf.split("\n\n");

      buf = parts.pop() ?? "";

      for (const part of parts) {
        try {
          if (!part.startsWith("data:")) continue;

          const e = JSON.parse(part.slice(5).trim());

          if (e.type === "token") {
            text += e.text ?? "";
          }

          if (e.type === "sources") {
            sources = e.sources ?? [];
          }

          if (e.type === "error") {
            console.error("AI service SSE error:", e.error);
          }
        } catch (error) {
          console.error("Failed to parse AI SSE event:", part, error);
        }
      }
    },

    async flush() {
      if (cid && text) {
        await db.insert(chatMessages).values({
          conversationId: cid,
          role: "assistant",
          content: text,
          metadata: { sources },
        });
      }
    },
  });
  return new Response(up.body.pipeThrough(tee), {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-store",
      "x-conversation-id": convId ?? "",
    },
  });
}
