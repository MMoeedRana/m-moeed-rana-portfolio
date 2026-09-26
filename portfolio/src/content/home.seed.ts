import type { HomeData } from "./types";

export const homeSeed: HomeData = {
  headings: {
    what: {
      eyebrow: "What I build",
      title: "Digital products that solve real problems",
      lead:
        "Full-stack applications, AI-powered features, and automation workflows built around practical business needs.",
    },

    proof: {
      eyebrow: "Selected work",
      title: "Built for real-world use",
      lead:
        "A selection of production work, experiments, and personal projects.",
    },

    process: {
      eyebrow: "How it works",
      title: "From idea to working product",
    },

    faq: {
      eyebrow: "Before you ask",
      title: "A few common questions",
    },
  },

  pillars: [
    {
      tag: "/01",
      title: "Full-Stack Development",
      text:
        "Modern web applications with responsive interfaces, clean API integration, authentication, dashboards, and scalable data flows.",
      status: "Production-ready web applications",
      stack: "Next.js · React · TypeScript · PostgreSQL",
    },

    {
      tag: "/02",
      title: "AI & Intelligent Features",
      text:
        "AI-powered features including assistants, retrieval-based systems, document workflows, and practical automation.",
      status: "AI features built around real use cases",
      stack: "Python · FastAPI · OpenAI · LangGraph",
    },

    {
      tag: "/03",
      title: "Automation & Integrations",
      text:
        "Connected workflows that reduce repetitive work by linking APIs, business tools, databases, and internal systems.",
      status: "Workflow automation and API integrations",
      stack: "n8n · REST APIs · FastAPI · PostgreSQL",
    },
  ],

  stats: [
    {
      n: 2,
      suffix: "+",
      label: "Years professional experience",
    },
    {
      n: 3,
      suffix: "+",
      label: "Production systems contributed to",
    },
    {
      n: 100,
      suffix: "+",
      label: "APIs integrated across projects",
    },
    {
      n: 5,
      suffix: "+",
      label: "Core technologies used regularly",
    },
  ],

  steps: [
    {
      title: "Understand",
      text:
        "Start with the requirements, existing workflow, users, and technical constraints before writing code.",
    },

    {
      title: "Build",
      text:
        "Develop the interface, APIs, integrations, and core functionality in small, testable steps.",
    },

    {
      title: "Integrate",
      text:
        "Connect the application with the required services, databases, authentication, and external APIs.",
    },

    {
      title: "Ship",
      text:
        "Deploy the finished product, verify the important flows, and continue improving it based on real usage.",
    },
  ],

  faqs: [
    {
      q: "What technologies do you work with?",
      a:
        "My main stack includes Next.js, React, TypeScript, Python, Django, Django REST Framework, FastAPI, and PostgreSQL. I also work with AI and automation tools when they fit the project.",
    },

    {
      q: "Can you work on an existing application?",
      a:
        "Yes. I can work with an existing codebase, add new features, integrate APIs, fix frontend issues, improve workflows, or help connect a frontend with backend services.",
    },

    {
      q: "Do you build AI-powered applications?",
      a:
        "Yes. I work on practical AI features such as AI assistants, retrieval-based applications, API-powered AI workflows, and automation systems.",
    },

    {
      q: "Do you work remotely?",
      a:
        "Yes. I am based in Lahore, Pakistan (UTC+5) and can work remotely with distributed teams.",
    },
  ],

  agent: {
    eyebrow: "Meet my AI assistant",
    title: ["Want to know more?", "Ask my AI."],

    text:
      "My personal AI assistant uses the information available on this website to answer questions about my experience, projects, skills, and services.",

    primary: "Ask my AI →",
    secondary: "Open the AI page",

    status: "AI assistant · grounded in this site",
    ping: "New message",
    placeholder: "Ask about my work…",

    bubbles: [
      "What does Moeed work with?",
      "He works primarily with Next.js, React, TypeScript, Python, Django, FastAPI, and PostgreSQL.",
      "Can he build AI features?",
      "Yes. His projects include AI-powered applications, API integrations, RAG workflows, and automation features.",
    ],

    floaters: [
      "What kind of projects?",
      "Full-stack apps, APIs, AI features, and automation workflows.",
    ],
  },

  cta: {
    title: "Have a product or idea in mind?",
    text:
      "Let's discuss the requirements, technical approach, and the best way to turn it into a working product.",
    label: "Start a Conversation →",
  },
};