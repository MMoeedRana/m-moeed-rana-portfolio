import Link from "next/link";
import type { SiteData } from "@/content/types";
import { Reveal } from "./Reveal";
import { HeroCanvas } from "./HeroCanvas";

export function Hero({ site }: { site: SiteData }) {
  const h = site.hero;
  return (
    <header className="sec" style={{ paddingTop: 64 }}>
      <div className="wrap center">
        <Reveal>
          <span className="pill">
            <span className="dot" />
            {h.availability}
          </span>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="h1">
            {h.lines.map((l, i) => (
              <span key={i}>
                {l} <br className="max-sm:hidden" />
              </span>
            ))}
            <span className="text-primary">{h.accent}</span>
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="lead">{h.lead}</p>
        </Reveal>
        <Reveal
          delay={0.24}
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Link className="btn" href={h.primaryCta.href}>
            {h.primaryCta.label}
          </Link>
          <Link className="btn btn-ghost" href={h.secondaryCta.href}>
            {h.secondaryCta.label}
          </Link>
        </Reveal>
        <Reveal delay={0.3}>
          <span className="tagline">{h.tagline}</span>
        </Reveal>
      </div>
      <Reveal delay={0.2} className="wrap">
        <HeroCanvas
          label={h.videoLabel}
          duration={h.videoDuration}
          nodes={h.nodes}
          mediaType={h.mediaType}
          mediaUrl={h.mediaUrl}
        />
        <div className="badges">
          {h.badges.map((b, i) => (
            <span key={b} className="contents">
              {i > 0 && <b />}
              <span className="bitem">
                <i />
                {b}
              </span>
            </span>
          ))}
        </div>
      </Reveal>
    </header>
  );
}
