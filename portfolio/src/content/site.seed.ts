import { aboutSeed, servicesSeed } from "./pages.seed";
import { homeSeed } from "./home.seed";
import type { SiteData } from "./types";

export const siteSeed: SiteData = {
  brand: {
    name: "Moeed Rana",
    initials: "MR",
    role: "Full-Stack Developer",
    tagline: "Full-Stack Developer · Lahore, Pakistan · UTC+5",
  },

  contact: {
    email: process.env.OWNER_EMAIL ?? "",
    whatsapp: process.env.OWNER_WHATSAPP ?? "",
    whatsappDisplay: process.env.OWNER_WHATSAPP_DISPLAY ?? "",
  },

  nav: [
    { label: "Home", href: "/", desktop: false },
    { label: "Work", href: "/projects", desktop: true },
    { label: "Services", href: "/services", desktop: true },
    { label: "Ask my AI", href: "/ask-my-ai", desktop: true },
    { label: "About", href: "/about", desktop: true },
    { label: "Contact", href: "/contact", desktop: true },
  ],

  cta: {
    label: "Let's Talk",
    href: "/contact",
    visible: true,
  },

  socials: [
    {
      platform: "linkedin",
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/mmoeedrana/",
      enabled: true,
      newTab: true,
    },
    {
      platform: "github",
      label: "GitHub",
      url: "https://github.com/MMoeedRana",
      enabled: true,
      newTab: true,
    },
    {
      platform: "whatsapp",
      label: "WhatsApp",
      url: "",
      enabled: false,
      newTab: true,
    },
  ],

  hero: {
    availability: "Open to new opportunities",
    lines: [
      "I build modern web applications",
      "and practical AI-powered products",
    ],
    accent: "from idea to production.",

    lead:
      "Full-stack development, API integrations, AI-powered features, and workflow automation built with modern technologies and real product requirements.",

    primaryCta: {
      label: "Let's Work Together →",
      href: "/contact",
    },

    secondaryCta: {
      label: "View My Work ↓",
      href: "/projects",
    },

    tagline: "FULL-STACK · AI · API INTEGRATION",

    videoLabel: "View project introduction",
    videoDuration: "",

    mediaType: "none",
    mediaUrl: "",

    nodes: [
      "Next.js",
      "React",
      "Python",
      "FastAPI",
      "PostgreSQL",
      "OpenAI",
    ],

    badges: [
      "Full-Stack Developer",
      "AI & Automation",
    ],
  },

  marquee: [
    "NEXT.JS",
    "REACT",
    "PYTHON",
    "DJANGO",
    "FASTAPI",
    "POSTGRESQL",
  ],

  projectCategories: [
    {
      slug: "voice",
      label: "AI",
    },
    {
      slug: "auto",
      label: "Automation",
    },
    {
      slug: "llm",
      label: "Full-Stack",
    },
  ],

  contactOptions: {
    projectTypes: [
      "Full-stack application",
      "AI-powered application",
      "API integration",
      "Automation / workflow",
      "Not sure yet",
    ],

    budgets: [
      "Discuss requirements",
      "Small project",
      "Medium project",
      "Larger project",
    ],
  },

  themes: [],

  home: homeSeed,
  services: servicesSeed,
  about: aboutSeed,

  branding: {
    logoUrl: "",
    faviconUrl: "",
    ogImageUrl: "",
    seoTitle: "Moeed Rana — Full-Stack Developer",
    seoDescription:
      "Portfolio of Moeed Rana — Full-Stack Developer specializing in Next.js, React, Python, APIs, AI-powered applications, and automation.",
  },

  copyright: "© 2026 Moeed Rana. All rights reserved.",
};