import Link from "next/link";
import type { Heading, ProjectCard, SiteData } from "@/content/types";
import { CountUp } from "./CountUp";
import { PhoneMock } from "./PhoneMock";
import { ProjectCardView } from "./ProjectCardView";
import { Reveal } from "./Reveal";

const Head = ({ h, right }: { h: Heading; right?: React.ReactNode }) => (
  <div className="sechead">
    <Reveal>
      <span className="eyebrow">{h.eyebrow}</span>
      <h2 className="h2" style={{ marginTop: 12 }}>
        {h.title}
      </h2>
      {h.lead && <p className="lead">{h.lead}</p>}
    </Reveal>
    {right}
  </div>
);

export function HomeSections({
  site,
  projects,
}: {
  site: SiteData;
  projects: ProjectCard[];
}) {
  const h = site.home,
    a = h.agent;
  return (
    <>
      <section className="sec">
        <div className="wrap">
          <Head h={h.headings.what} />
          <div className="grid3">
            {h.pillars.map((p, i) => (
              <Reveal
                key={p.tag}
                delay={i * 0.1}
                className="card"
                style={{ display: "grid", gap: 13, justifyItems: "start" }}
              >
                <span className="mono text-[13px] text-primary">{p.tag}</span>
                <h3 className="h3 text-[22px] font-medium">{p.title}</h3>
                <p className="text-[15px]">{p.text}</p>
                <span className="mono text-[11px] text-primary-muted">
                  {p.status}
                </span>
                <span className="tagline">{p.stack}</span>
                <Link className="alink" href="/services">
                  Explore →
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Head
            h={h.headings.proof}
            right={
              <Link className="alink" href="/projects">
                View all {projects.length} systems →
              </Link>
            }
          />
          <div className="grid3">
            {projects.slice(0, 3).map((p, i) => (
              <ProjectCardView key={p.slug} p={p} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap split">
          <div>
            <Reveal>
              <span className="eyebrow">{a.eyebrow}</span>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="h2" style={{ margin: "14px 0 18px" }}>
                {a.title[0]}
                <br />
                {a.title[1]}
              </h2>
            </Reveal>
            <Reveal delay={0.14}>
              <p className="lead">{a.text}</p>
            </Reveal>
            <Reveal
              delay={0.2}
              style={{
                display: "flex",
                gap: 14,
                flexWrap: "wrap",
                marginTop: 26,
              }}
            >
              <Link className="btn" href="/ask-my-ai">
                {a.primary}
              </Link>
              <Link className="btn btn-ghost" href="/ask-my-ai">
                {a.secondary}
              </Link>
            </Reveal>
          </div>
          <Reveal>
            <PhoneMock name={site.brand.name} a={a} />
          </Reveal>
        </div>
      </section>

      <div className="wrap">
        <Reveal className="stats">
          {h.stats.map((s) => (
            <div key={s.label} className="stat">
              <CountUp n={s.n} suffix={s.suffix} />
              <span>{s.label}</span>
            </div>
          ))}
        </Reveal>
      </div>

      <section className="sec">
        <div className="wrap">
          <Head h={h.headings.process} />
          <div className="steps">
            {h.steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.08} className="step">
                <div className="bar">
                  <em />
                  {i < h.steps.length - 1 && <i />}
                </div>
                <h3 className="h3 text-[22px] font-medium">
                  <span className="n">{String(i + 1).padStart(2, "0")}</span>
                  {s.title}
                </h3>
                <p className="mt-2.5 text-sm">{s.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap" style={{ maxWidth: 920 }}>
          <Head h={h.headings.faq} />
          {h.faqs.map((f, i) => (
            <Reveal key={f.q}>
              <details className="faq" open={i === 0}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="sec">
        <div className="wrap center">
          <Reveal>
            <h2 className="h2" style={{ maxWidth: "18ch" }}>
              {h.cta.title}
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="lead" style={{ maxWidth: "52ch" }}>
              {h.cta.text}
            </p>
          </Reveal>
          <Reveal delay={0.14}>
            <Link className="btn btn-big" href="/contact">
              {h.cta.label}
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
