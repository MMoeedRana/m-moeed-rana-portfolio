import type { Metadata } from "next";
import Link from "next/link";
import { ProjectsGrid } from "@/components/ProjectsGrid";
import { Reveal } from "@/components/Reveal";
import { getProjects } from "@/lib/projects";
import { getSite } from "@/lib/site";

export const metadata: Metadata = { title: "Work" };
export default async function ProjectsPage() {
  const [projects, site] = await Promise.all([getProjects(), getSite()]);
  return (
    <>
      <header className="sec" style={{ paddingBottom: 48 }}>
        <div className="wrap">
          <Reveal>
            <span className="eyebrow">The proof</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="h1" style={{ margin: "14px 0 18px" }}>
              {projects.length} systems shipped.
            </h1>
          </Reveal>
          <Reveal delay={0.14}>
            <p className="lead">
              Voice agents, automations, and LLM platforms — built for real
              users.
            </p>
          </Reveal>
        </div>
      </header>
      <section style={{ paddingBottom: 72 }}>
        <div className="wrap">
          {projects.length ? (
            <ProjectsGrid
              projects={projects}
              categories={site.projectCategories}
            />
          ) : (
            <p className="tagline">No published projects yet.</p>
          )}
          <div className="center" style={{ marginTop: 64 }}>
            <Reveal>
              <h2 className="h2" style={{ maxWidth: "16ch" }}>
                Want yours on this wall?
              </h2>
            </Reveal>
            <Reveal delay={0.08}>
              <Link className="btn" href="/contact">
                Book a Call →
              </Link>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
