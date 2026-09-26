export type NavItem = { label: string; href: string; desktop: boolean };
export type Social = {
  platform:
    | "linkedin"
    | "github"
    | "whatsapp"
    | "email"
    | "twitter"
    | "instagram"
    | "youtube"
    | "custom";
  label: string;
  url: string;
  enabled: boolean;
  newTab: boolean;
};
export type Branding = {
  logoUrl: string;
  faviconUrl: string;
  ogImageUrl: string;
  seoTitle: string;
  seoDescription: string;
};
export type Cta = { label: string; href: string };
export type HeroBlock = {
  availability: string;
  lines: string[];
  accent: string;
  lead: string;
  primaryCta: Cta;
  secondaryCta: Cta;
  tagline: string;
  videoLabel: string;
  videoDuration: string;
  badges: string[];
  mediaType: "none" | "video" | "image";
  mediaUrl: string;
  nodes: string[];
};
export type SiteData = {
  brand: { name: string; initials: string; role: string; tagline: string };
  contact: {
    email: string;
    whatsapp: string;
    whatsappDisplay: string;
    calendlyUrl?: string;
  };
  nav: NavItem[];
  cta: Cta & { visible: boolean };
  socials: Social[];
  hero: HeroBlock;
  marquee: string[];
  copyright: string;
  home: HomeData;
  branding: Branding;
  projectCategories: { slug: string; label: string }[];
  contactOptions: { projectTypes: string[]; budgets: string[] };
  themes: NamedTheme[];
  services: ServicesData;
  about: AboutData;
};
export type ProjectCard = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  chip: string;
  tech: string[];
  live: boolean;
  nda: boolean;
  caseStudy: boolean;
  body: string;
  image: string;
};
export type Heading = { eyebrow: string; title: string; lead?: string };
export type NamedTheme = {
  id: string;
  name: string;
  tokens: import("@/lib/theme").Theme;
};
export type HomeData = {
  headings: Record<"what" | "proof" | "process" | "faq", Heading>;
  pillars: {
    tag: string;
    title: string;
    text: string;
    status: string;
    stack: string;
  }[];
  stats: { n: number; suffix: string; label: string }[];
  steps: { title: string; text: string }[];
  faqs: { q: string; a: string }[];
  agent: {
    eyebrow: string;
    title: string[];
    text: string;
    primary: string;
    secondary: string;
    status: string;
    ping: string;
    placeholder: string;
    bubbles: [string, string, string, string];
    floaters: [string, string];
  };
  cta: { title: string; text: string; label: string };
};
export type ServicesData = {
  eyebrow: string;
  title: string;
  lead: string;
  plans: {
    title: string;
    blurb: string;
    includes: string[];
    example: string;
    price?: string;
    flag?: string;
    cta: string;
  }[];
  models: { title: string; text: string }[];
  addonsTitle: string;
  addons: string[];
  custom: { title: string; text: string; cta: string };
};
export type AboutData = {
  eyebrow: string;
  title: string;
  paragraphs: string[];
  facts: string[];
  image?: string;
  path: {
    heading: Heading;
    items: { when: string; title: string; text: string }[];
    skills: string[];
  };
  credentials: {
    heading: Heading;
    items: { kind: string; title: string; meta: string }[];
  };
  downloads: { title: string; note: string; url: string }[];
  resumeUrl: string;
};
