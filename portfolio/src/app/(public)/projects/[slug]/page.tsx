import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/Reveal";
import { getProject } from "@/lib/projects";

type P = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const p = await getProject((await params).slug);
  return p ? { title: p.title, description: p.summary } : {};
}
export default async function ProjectPage({ params }: P) {
  const p = await getProject((await params).slug);
  if (!p) notFound();
  return (
    <section className="sec" style={{ paddingTop: 56 }}>
      <div className="wrap" style={{ maxWidth: 980 }}>
        <Link
          className="tagline inline-block"
          href="/projects"
          style={{ marginBottom: 26 }}
        >
          ← All work
        </Link>
        <div className="flex flex-wrap gap-2.5">
          {p.live && <span className="chip">Live</span>}
          {p.nda && <span className="chip">Under NDA</span>}
          {p.chip && <span className="chip">{p.chip}</span>}
        </div>
        <Reveal>
          <h1 className="h1" style={{ margin: "16px 0 18px" }}>
            {p.title}
          </h1>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="lead">{p.summary}</p>
        </Reveal>
        <div className="mt-6 flex flex-wrap gap-2.5">
          {p.tech.map((t) => (
            <span key={t} className="fact">
              {t}
            </span>
          ))}
        </div>
        {p.body && (
          <Reveal className="mt-12">
            <span className="eyebrow">The build</span>
            <p className="mt-3.5 text-[15.5px]">{p.body}</p>
          </Reveal>
        )}
        <Reveal className="card mt-14 flex flex-wrap items-center justify-between gap-6">
          <div>
            <h3 className="h3 text-[22px] font-medium">
              Want something like this?
            </h3>
            <p className="mt-2 text-sm">Scoped on one free call.</p>
          </div>
          <Link className="btn" href="/contact">
            Book a Call →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
