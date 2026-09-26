import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { db, hasDb } from "@/db";
import { contactMessages } from "@/db/schema";
import { contactSchema } from "@/lib/contact-schema";
import { getSite } from "@/lib/site";

const hits = new Map<string, number[]>();
const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
const line = (s = "") => s.replace(/[\r\n]+/g, " ").trim();

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const now = Date.now(),
    recent = (hits.get(ip) ?? []).filter((t) => now - t < 3_600_000);
  if (recent.length >= 5)
    return NextResponse.json(
      { error: "Too many messages. Please try again later." },
      { status: 429 },
    );
  hits.set(ip, [...recent, now]);

  const parsed = contactSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  const d = parsed.data;
  if (d.website) return NextResponse.json({ ok: true });

  let rowId: string | null = null;
  if (hasDb) {
    const [r] = await db
      .insert(contactMessages)
      .values({
        name: d.name,
        email: d.email,
        projectType: d.projectType,
        budget: d.budget,
        message: d.message,
        ipHash: createHash("sha256").update(ip).digest("hex"),
      })
      .returning({ id: contactMessages.id });
    rowId = r.id;
  }
  const { RESEND_API_KEY, MAIL_FROM } = process.env,
    site = await getSite(),
    to = site.contact.email || process.env.OWNER_EMAIL;
  if (!RESEND_API_KEY || !MAIL_FROM || !to) {
    if (rowId)
      await db
        .update(contactMessages)
        .set({
          notifyStatus: "skipped",
          autoreplyStatus: "skipped",
          mailError: "Email not configured",
        })
        .where(eq(contactMessages.id, rowId));
    return rowId
      ? NextResponse.json({ ok: true })
      : NextResponse.json(
          { error: "Email service is not configured." },
          { status: 503 },
        );
  }

  const resend = new Resend(RESEND_API_KEY);
  const owner = await resend.emails.send({
    from: MAIL_FROM,
    to,
    replyTo: d.email,
    subject: `[Portfolio] ${line(d.name)} — ${line(d.projectType) || "new message"}`,
    html: `<h2>New message from your portfolio</h2><p><b>Name:</b> ${esc(d.name)}<br><b>Email:</b> ${esc(d.email)}<br><b>Project:</b> ${esc(d.projectType ?? "—")}<br><b>Budget:</b> ${esc(d.budget ?? "—")}</p><p style="white-space:pre-wrap">${esc(d.message)}</p><p style="color:#888">Hit Reply to answer ${esc(d.name)} directly.</p>`,
    text: `From: ${d.name} <${d.email}>\nProject: ${d.projectType ?? "-"}\nBudget: ${d.budget ?? "-"}\n\n${d.message}`,
  });
  const auto = await resend.emails
    .send({
      from: MAIL_FROM,
      to: d.email,
      replyTo: to,
      subject: `Thanks for reaching out, ${line(d.name).split(" ")[0]}`,
      html: `<p>Hi ${esc(d.name)},</p><p>Thanks for contacting me — I've received your message and will get back to you within 24 hours.</p><p>— ${esc(site.brand.name)}</p>`,
      text: `Hi ${d.name},\n\nThanks for contacting me — I've received your message and will get back to you within 24 hours.\n\n— ${site.brand.name}`,
    })
    .catch((e) => ({ error: { message: String(e) } }));

  if (rowId)
    await db
      .update(contactMessages)
      .set({
        notifyStatus: owner.error ? "failed" : "sent",
        autoreplyStatus: auto.error ? "failed" : "sent",
        mailError: owner.error?.message ?? auto.error?.message ?? null,
      })
      .where(eq(contactMessages.id, rowId));
  if (owner.error && !rowId)
    return NextResponse.json(
      { error: "Could not send your message. Please try again." },
      { status: 502 },
    );

  if (process.env.N8N_CONTACT_WEBHOOK_URL) {
    fetch(process.env.N8N_CONTACT_WEBHOOK_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: d.name,
        email: d.email,
        projectType: d.projectType,
        budget: d.budget,
        message: d.message,
        receivedAt: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(5000),
    }).catch(() => null);
  }
  return NextResponse.json({ ok: true });
}
