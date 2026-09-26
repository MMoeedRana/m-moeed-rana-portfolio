import Image from "next/image";
import Link from "next/link";
import type { ProjectCard } from "@/content/types";
import { Reveal } from "./Reveal";

export function ProjectCardView({
  p,
  delay = 0,
}: {
  p: ProjectCard;
  delay?: number;
}) {
  return (
    <Reveal delay={delay} className="card pcard">
      <div className="thumb">
        {p.image && (
          <Image
            src={p.image}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        )}

        {(p.live || p.nda) && (
          <span
            className="live"
            style={p.nda ? { color: "var(--primary)" } : undefined}
          >
            <i />
            {p.nda ? "NDA" : "LIVE"}
          </span>
        )}

        {!p.image && (
          <span className="play sm">
            <i />
          </span>
        )}
      </div>

      <div className="pb">
        <h3 className="h3 text-[22px] font-medium">{p.title}</h3>

        <p className="text-[15px]">{p.summary}</p>

        {p.chip && <span className="chip">{p.chip}</span>}

        <span className="tagline">{p.tech.join(" · ")}</span>

        {p.caseStudy && (
          <Link className="alink" href={`/projects/${p.slug}`}>
            Case study →
          </Link>
        )}
      </div>
    </Reveal>
  );
}