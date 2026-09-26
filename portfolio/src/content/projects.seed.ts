import type { ProjectCard } from "./types";

const p = (
  slug: string,
  title: string,
  category: ProjectCard["category"],
  summary: string,
  chip: string,
  tech: string[],
  o: Partial<ProjectCard> = {},
): ProjectCard => ({
  slug,
  title,
  category,
  summary,
  chip,
  tech,
  live: true,
  nda: false,
  caseStudy: false,
  body: "",
  image: "",
  ...o,
});

export const projectsSeed: ProjectCard[] = [
  p(
    "ai-assistant",
    "AI Assistant",
    "llm",
    "An AI-powered assistant that answers questions using a structured knowledge base and application data.",
    "AI · RAG",
    ["Next.js", "FastAPI", "OpenAI", "PostgreSQL"],
    {
      caseStudy: true,
      body: "A full-stack AI assistant with a modern web interface, API-based AI integration, structured knowledge retrieval, and persistent application data.",
    },
  ),

  p(
    "workflow-automation",
    "Workflow Automation",
    "auto",
    "Automated business workflows that connect forms, APIs, databases, notifications, and external services.",
    "Automation",
    ["n8n", "REST APIs", "Next.js", "PostgreSQL"],
    {
      caseStudy: true,
      body: "A reusable automation architecture for connecting business systems and reducing repetitive manual operations through API-driven workflows.",
    },
  ),

  p(
    "healthcare-platform",
    "Healthcare Platform",
    "llm",
    "A modern healthcare application with dashboards, patient workflows, referrals, records, and AI-assisted features.",
    "Healthcare · Full-Stack",
    ["Next.js", "Django", "PostgreSQL", "OpenAI"],
  ),

  p(
    "business-dashboard",
    "Business Dashboard",
    "auto",
    "A responsive dashboard for managing users, records, workflows, analytics, and application activity.",
    "Dashboard",
    ["Next.js", "React", "REST APIs", "PostgreSQL"],
  ),

  p(
    "docs-collaboration",
    "Collaborative Editor",
    "llm",
    "A browser-based collaborative document application with real-time editing and modern productivity features.",
    "Collaboration",
    ["Next.js", "TypeScript", "Liveblocks", "Tiptap"],
  ),

  p(
    "ecommerce-platform",
    "E-Commerce Platform",
    "auto",
    "A modern shopping platform with product management, authentication, cart, checkout, and an admin workflow.",
    "E-Commerce",
    ["Next.js", "Tailwind CSS", "GraphQL", "PostgreSQL"],
  ),

  p(
    "ai-content-platform",
    "AI Content Platform",
    "llm",
    "An AI-powered SaaS application for generating and managing content through an integrated application workflow.",
    "AI · SaaS",
    ["Next.js", "TypeScript", "OpenAI", "Stripe"],
  ),

  p(
    "api-integration-hub",
    "API Integration Hub",
    "auto",
    "A full-stack integration layer connecting frontend applications with multiple external APIs and backend services.",
    "API Integration",
    ["Next.js", "FastAPI", "REST APIs", "PostgreSQL"],
  ),

  p(
    "portfolio-cms",
    "Portfolio CMS",
    "llm",
    "A customizable portfolio and content management system with media storage, editable site content, and an AI assistant.",
    "Full-Stack · CMS",
    ["Next.js", "Drizzle", "Neon", "Cloudinary"],
    {
      caseStudy: true,
      body: "A production-oriented portfolio platform combining a public website, admin CMS, media management, PostgreSQL content storage, and an optional AI assistant service.",
    },
  ),
];