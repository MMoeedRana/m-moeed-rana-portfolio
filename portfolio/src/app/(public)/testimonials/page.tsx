import type { Metadata } from "next";
import { asc, eq } from "drizzle-orm";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { db, hasDb } from "@/db";
import { testimonials } from "@/db/schema";

export const metadata: Metadata = { title: "Testimonials" };
export const dynamic = "force-dynamic";

async function loadTestimonials() {
  if (!hasDb) return { rows: [], dbError: false };
  try {
    return {
      rows: await db
        .select()
        .from(testimonials)
        .where(eq(testimonials.status, "published"))
        .orderBy(asc(testimonials.sortOrder)),
      dbError: false,
    };
  } catch {
    return { rows: [] as (typeof testimonials.$inferSelect)[], dbError: true };
  }
}

export default async function TestimonialsPage() {
  const { rows, dbError } = await loadTestimonials();
  return (
    <>
      <header className="sec" style={{ paddingBottom: 44 }}>
        <div className="wrap">
          <Reveal>
            <span className="eyebrow">After launch</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="h1" style={{ margin: "14px 0 18px" }}>
              Don&apos;t take it from me.
            </h1>
          </Reveal>
          {rows.length > 0 && (
            <Reveal delay={0.14}>
              <p className="lead">
                Every quote below followed a shipped, running system.
              </p>
            </Reveal>
          )}
        </div>
      </header>
      <section style={{ paddingBottom: 72 }}>
        <div className="wrap">
          {dbError ? (
            <Reveal
              className="card"
              style={{ maxWidth: 620, borderColor: "var(--p45)" }}
            >
              <p className="text-[15px] text-foreground">
                Testimonials couldn&apos;t load.
              </p>
              <p className="mt-2 text-sm">
                This usually means the database is missing a recent table. Run{" "}
                <code className="mono rounded bg-deep px-1.5 py-0.5 text-xs">
                  npm run db:migrate
                </code>{" "}
                and reload.
              </p>
            </Reveal>
          ) : rows.length === 0 ? (
            <Reveal className="card" style={{ maxWidth: 560 }}>
              <p className="text-[15px]">
                Client testimonials will appear here as projects wrap up.
              </p>
              <Link className="alink mt-3 inline-block" href="/projects">
                See the live work →
              </Link>
            </Reveal>
          ) : (
            <div className="grid-auto">
              {rows.map((t, i) => (
                <Reveal
                  key={t.id}
                  delay={(i % 3) * 0.08}
                  className="card grid gap-3.5"
                >
                  <span className="score">{t.rating.toFixed(1)} / 5.0</span>
                  <p className="quote">&ldquo;{t.quote}&rdquo;</p>
                  <div className="who">
                    <b>{t.authorName}</b>
                    <span>
                      {[t.authorRole, t.source].filter(Boolean).join(" · ")}
                    </span>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
          <div className="card mt-14 flex flex-wrap items-center justify-between gap-6">
            <div>
              <h3 className="h3 text-[22px] font-medium">
                Your quote goes here next.
              </h3>
              <p className="mt-2 text-sm">
                Every engagement starts with one free scoping call.
              </p>
            </div>
            <div className="flex flex-wrap gap-3.5">
              <Link className="btn" href="/contact">
                Book a Call →
              </Link>
              <Link className="btn btn-ghost" href="/projects">
                See the live work →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
