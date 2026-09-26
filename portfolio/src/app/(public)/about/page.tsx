import Image from "next/image";
import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { getSite } from "@/lib/site";

export const metadata: Metadata = { title: "About" };

export default async function AboutPage() {
  const site = await getSite(),
    a = site.about;

  return (
    <>
      <section className="sec">
        <div className="wrap split">
          <Reveal className="portrait relative">
            {a.image ? (
              <Image
                src={a.image}
                alt={site.brand.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="rounded-[20px] object-cover"
              />
            ) : (
              <span
                className="font-display text-7xl font-bold text-primary"
                aria-hidden="true"
              >
                {site.brand.initials}
              </span>
            )}
          </Reveal>

          <div>
            <Reveal>
              <span className="eyebrow">{a.eyebrow}</span>
            </Reveal>

            <Reveal delay={0.08}>
              <h1 className="h2" style={{ margin: "14px 0 20px" }}>
                {a.title}
              </h1>
            </Reveal>

            {a.paragraphs.map((p, i) => (
              <Reveal key={i} delay={0.14 + i * 0.06}>
                <p className="mb-4 text-[15.5px]">{p}</p>
              </Reveal>
            ))}

            <Reveal delay={0.26} className="mt-6 flex flex-wrap gap-2.5">
              {a.facts.map((f) => (
                <span key={f} className="fact">
                  {f}
                </span>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      <section style={{ paddingBottom: 72 }}>
        <div className="wrap">
          <div className="sechead">
            <Reveal>
              <span className="eyebrow">{a.path.heading.eyebrow}</span>
              <h2 className="h2" style={{ marginTop: 12 }}>
                {a.path.heading.title}
              </h2>
            </Reveal>
          </div>

          <div>
            {a.path.items.map((t, i) => (
              <Reveal key={t.title} delay={i * 0.08} className="trow">
                <b>{t.when}</b>
                <div>
                  <h3 className="h3 text-[22px] font-medium">{t.title}</h3>
                  <p className="mt-2 text-sm">{t.text}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-8 flex flex-wrap gap-2.5">
            {a.path.skills.map((s) => (
              <span key={s} className="fact">
                {s}
              </span>
            ))}
          </Reveal>

          {a.credentials.items.length > 0 && (
            <>
              <div className="sechead" style={{ marginTop: 72 }}>
                <Reveal>
                  <span className="eyebrow">
                    {a.credentials.heading.eyebrow}
                  </span>
                  <h2 className="h2" style={{ marginTop: 12 }}>
                    {a.credentials.heading.title}
                  </h2>
                </Reveal>
              </div>

              <div className="grid-auto">
                {a.credentials.items.map((c, i) => (
                  <Reveal key={c.title} delay={i * 0.06} className="card">
                    <span className="mono text-[11px] text-primary">
                      {c.kind}
                    </span>
                    <h3 className="h3 mt-2.5 text-[22px] font-medium">
                      {c.title}
                    </h3>
                    <span className="tagline">{c.meta}</span>
                  </Reveal>
                ))}
              </div>
            </>
          )}

          {a.downloads.length > 0 && (
            <div className="grid-auto mt-16">
              {a.downloads.map((d) => (
                <Reveal
                  key={d.title}
                  className="card flex items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="h3 text-[22px] font-medium">{d.title}</h3>
                    <span className="tagline">{d.note}</span>
                  </div>

                  <a
                    className="btn btn-ghost"
                    href={`/api/resume/download?url=${encodeURIComponent(d.url)}`}
                  >
                    Download ↓
                  </a>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
