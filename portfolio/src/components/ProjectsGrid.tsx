"use client";
import { useState } from "react";
import type { ProjectCard } from "@/content/types";
import { ProjectCardView } from "./ProjectCardView";

type Category = { slug: string; label: string };

export function ProjectsGrid({
  projects,
  categories,
}: {
  projects: ProjectCard[];
  categories: Category[];
}) {
  const [f, setF] = useState<string>("all");
  const used = new Set(projects.map((p) => p.category));
  const filters: Category[] = [
    { slug: "all", label: "All" },
    ...categories.filter((c) => used.has(c.slug)),
  ];
  const list = projects.filter((p) => f === "all" || p.category === f);
  return (
    <>
      <div
        className="mt-6 flex flex-wrap gap-2.5"
        role="group"
        aria-label="Filter projects"
      >
        {filters.map((c) => (
          <button
            key={c.slug}
            aria-pressed={f === c.slug}
            onClick={() => setF(c.slug)}
            className={`pill cursor-pointer ${f === c.slug ? "!border-primary !bg-primary !text-on-primary" : ""}`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="grid3 mt-12">
        {list.map((p, i) => (
          <ProjectCardView key={p.slug + f} p={p} delay={(i % 3) * 0.1} />
        ))}
      </div>
    </>
  );
}
