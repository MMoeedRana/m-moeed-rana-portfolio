import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { getSite } from "@/lib/site";

export const metadata: Metadata = { title: "Services" };
export default async function ServicesPage() {
  const s = (await getSite()).services;
  return (
    <>
      <header className="sec" style={{ paddingBottom: 48 }}>
        <div className="wrap">
          <Reveal>
            <span className="eyebrow">{s.eyebrow}</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="h1" style={{ margin: "14px 0 18px" }}>
              {s.title}
            </h1>
          </Reveal>
          <Reveal delay={0.14}>
            <p className="lead">{s.lead}</p>
          </Reveal>
        </div>
      </header>
      <section style={{ paddingBottom: 72 }}>
        <div className="wrap">
          <div className="grid3" style={{ alignItems: "stretch" }}>
            {s.plans.map((p, i) => (
              <Reveal
                key={p.title}
                delay={i * 0.1}
                className={`card price${p.flag ? " hot" : ""}`}
              >
                {p.flag && <span className="flag">{p.flag}</span>}
                <h3 className="h3 text-[22px] font-medium">{p.title}</h3>
                <p className="text-sm text-muted-foreground">{p.blurb}</p>
                <div className="inc">
                  {p.includes.map((x) => (
                    <div key={x}>
                      <i />
                      {x}
                    </div>
                  ))}
                </div>
                <span className="mono text-[10px] text-primary-muted">
                  {p.example}
                </span>
                <div>
                  <span className="tagline">
                    {p.price ? "Starting at" : "Pricing"}
                  </span>
                  <div className="cost">
                    <b>{p.price || "Fixed quote"}</b>
                    <span className="text-sm text-muted-foreground">
                      {p.price ? "/ scoped MVP" : "after one free call"}
                    </span>
                  </div>
                </div>
                <Link
                  className={`btn ${p.flag ? "" : "btn-ghost"}`}
                  href="/contact"
                >
                  {p.cta}
                </Link>
              </Reveal>
            ))}
          </div>
          <div className="grid-auto mt-6">
            {s.models.map((m, i) => (
              <Reveal key={m.title} delay={i * 0.08} className="card">
                <span className="mono text-[11px] text-primary">{m.title}</span>
                <p className="mt-2.5 text-sm">{m.text}</p>
              </Reveal>
            ))}
          </div>
          {s.addons.length > 0 && (
            <Reveal className="card mt-6">
              <span className="mono text-[11px] text-primary">
                {s.addonsTitle}
              </span>
              <div className="mt-3.5 flex flex-wrap gap-2.5">
                {s.addons.map((a) => (
                  <span key={a} className="fact">
                    {a}
                  </span>
                ))}
              </div>
            </Reveal>
          )}
          <Reveal className="card mt-6 flex flex-wrap items-center justify-between gap-6">
            <div>
              <h3 className="h3 text-[22px] font-medium">{s.custom.title}</h3>
              <p className="mt-2 text-sm">{s.custom.text}</p>
            </div>
            <Link className="btn" href="/contact">
              {s.custom.cta}
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
