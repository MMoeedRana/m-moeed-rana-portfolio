import { getSite } from "@/lib/site";
import { getProjects } from "@/lib/projects";
import { Hero } from "@/components/Hero";
import { HomeSections } from "@/components/HomeSections";

export default async function Home() {
  const [site, projects] = await Promise.all([getSite(), getProjects()]);
  const items = [...site.marquee, ...site.marquee];
  return (
    <>
      <Hero site={site} />
      <div className="mq" aria-label="Trusted by the teams behind">
        <div className="mq-track">
          {items.map((m, i) => (
            <span key={i}>{m}</span>
          ))}
        </div>
      </div>
      <HomeSections site={site} projects={projects} />
    </>
  );
}
