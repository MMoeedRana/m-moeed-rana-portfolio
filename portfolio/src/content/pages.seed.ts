import type { AboutData, ServicesData } from "./types";

export const servicesSeed: ServicesData = {
  eyebrow: "Services",
  title: "Practical software, AI, and automation solutions.",
  lead: "From full-stack web applications to AI-powered features and workflow automation, I build solutions around real product requirements.",

  plans: [
    {
      title: "Full-Stack Development",
      blurb:
        "Modern web applications with responsive interfaces, APIs, authentication, dashboards, and database integrations.",
      includes: [
        "Next.js / React frontend development",
        "REST API integration and backend development",
        "Authentication, dashboards, and database workflows",
      ],
      example: "Web applications · Dashboards · SaaS products",
      cta: "Discuss a project →",
    },

    {
      title: "AI-Powered Applications",
      blurb:
        "Useful AI features integrated into web products, internal tools, and business workflows.",
      includes: [
        "AI assistants and API integrations",
        "RAG and knowledge-based applications",
        "AI-powered workflows and automation",
      ],
      example: "AI assistants · RAG · Intelligent workflows",
      cta: "Discuss an AI project →",
    },

    {
      title: "API Integration & Automation",
      blurb:
        "Connect your frontend, backend, databases, and external services into reliable workflows.",
      includes: [
        "Third-party API integrations",
        "n8n and workflow automation",
        "Data, notifications, and business process integrations",
      ],
      example: "API integrations · Automation · Internal tools",
      cta: "Discuss an integration →",
    },
  ],

  models: [
    {
      title: "Project",
      text: "A clearly defined scope with milestones based on the project's requirements.",
    },
    {
      title: "Ongoing",
      text: "Continuous development, improvements, maintenance, and new features after launch.",
    },
  ],

  addonsTitle: "Additional capabilities",

  addons: [
    "Responsive UI development",
    "API integration",
    "Authentication & authorization",
    "Database integration",
    "AI features",
    "Workflow automation",
  ],

  custom: {
    title: "Have something specific in mind?",
    text: "Let's discuss the requirements, technical approach, and the best way to build it.",
    cta: "Start a conversation →",
  },
};

export const aboutSeed: AboutData = {
  eyebrow: "About",
  title: "Software engineer. Builder. Problem solver.",

  paragraphs: [
    "I'm a Full-Stack Developer focused on building modern web applications, API integrations, and practical AI-powered products. My main stack includes Next.js, React, TypeScript, Python, Django, FastAPI, and PostgreSQL.",

    "I've worked on production applications across different domains, contributing to frontend development, API integration, dashboards, authentication, localization, and AI-powered workflows. I enjoy turning product requirements into clean, usable software.",
  ],

  facts: [
    "Based in Lahore, Pakistan",
    "UTC+5 · Available for remote work",
    "Full-Stack · AI · API Integration",
  ],

  path: {
    heading: {
      eyebrow: "The path",
      title: "From web development to AI-powered products",
    },

    items: [
      {
        when: "2024 — 2025",
        title: "Full-Stack Development",
        text: "Worked on modern web applications with Next.js, React, API integrations, authentication, dashboards, and backend services.",
      },

      {
        when: "2025",
        title: "Professional Product Development",
        text: "Contributed to production projects involving frontend applications, API integrations, databases, and business workflows.",
      },

      {
        when: "2026 — Now",
        title: "Full-Stack & AI Development",
        text: "Building and improving production applications while expanding into AI-powered features, automation, RAG systems, and intelligent application workflows.",
      },
    ],

    skills: [
      "Next.js",
      "React",
      "TypeScript",
      "Python",
      "Django",
      "Django REST Framework",
      "FastAPI",
      "PostgreSQL",
      "n8n",
      "OpenAI",
      "LangGraph",
    ],
  },

  credentials: {
    heading: {
      eyebrow: "Credentials",
      title: "Education & certifications",
    },

    items: [
      {
        kind: "Education",
        title: "BS Software Engineering",
        meta: "Virtual University",
      },
      {
        kind: "Award",
        title: "Gold Medal — TalentScope AI",
        meta: "PNY Trainings",
      },
      {
        kind: "Certification",
        title: "Agentic AI Diploma",
        meta: "PNY Trainings",
      },
      {
        kind: "Certification",
        title: "Full-Stack Web Development",
        meta: "PNY Trainings",
      },
    ],
  },

  downloads: [],
  resumeUrl: "",
};