/* eslint-disable @typescript-eslint/no-explicit-any */
import { siteSeed as s } from "@/content/site.seed";

const c = <T>(x: T): T => structuredClone(x);
export const BLOCKS = {
  brand: {
    label: "Brand",
    shape: c(s.brand),
    check: (d: any) =>
      !d.name || !d.initials ? "Name and initials are required." : null,
  },
  hero: {
    label: "Hero",
    shape: c(s.hero),
    check: (d: any) =>
      !d.lead || !d.lines.length
        ? "Hero needs a lead paragraph and at least one headline line."
        : null,
  },
  marquee: { label: "Marquee", shape: { items: c(s.marquee) } },
  home: { label: "Home sections", shape: c(s.home) },
  services: {
    label: "Services",
    shape: {
      ...c(s.services),
      plans: c(s.services.plans).map((p, i) =>
        i ? p : { ...p, price: "", flag: "" },
      ),
    },
  },
  about: {
    label: "About",
    shape: {
      ...c(s.about),
      image: "",
      downloads: [{ title: "", note: "", url: "" }],
    },
  },
  contact: {
    label: "Contact",
    shape: { ...c(s.contact), calendlyUrl: "" },
    check: (d: any) =>
      d.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)
        ? "Enter a valid email address."
        : !/^\+\d{8,15}$/.test(String(d.whatsapp).replace(/[\s-]/g, ""))
          ? "WhatsApp must be in international format, e.g. +923001234567."
          : null,
  },
  footer: { label: "Footer", shape: { copyright: s.copyright } },
} as const;
export type BlockKey = keyof typeof BLOCKS;

export function fill(v: any, t: any): any {
  if (Array.isArray(t))
    return Array.isArray(v)
      ? v.map((x) => (t[0] && typeof t[0] === "object" ? fill(x, t[0]) : x))
      : [];
  if (t && typeof t === "object") {
    const o = v && typeof v === "object" && !Array.isArray(v) ? v : {};
    return Object.fromEntries(Object.keys(t).map((k) => [k, fill(o[k], t[k])]));
  }
  return v ?? t;
}
const LINK = /(url|href|image)$/i,
  SAFE = /^(\/|https?:\/\/|mailto:|#)/;
export function conform(v: any, t: any, key = ""): any {
  if (typeof t === "string") {
    if (typeof v !== "string") throw new Error(`${key}: text expected`);
    const x = v.trim();
    if (x.length > 4000) throw new Error(`${key}: too long`);
    if (LINK.test(key) && x && !SAFE.test(x))
      throw new Error(`${key}: must start with /, https:// or mailto:`);
    return x;
  }
  if (typeof t === "number") {
    if (typeof v !== "number" || !Number.isFinite(v))
      throw new Error(`${key}: number expected`);
    return v;
  }
  if (typeof t === "boolean") {
    if (typeof v !== "boolean") throw new Error(`${key}: yes/no expected`);
    return v;
  }
  if (Array.isArray(t)) {
    if (!Array.isArray(v) || v.length > 60)
      throw new Error(`${key}: invalid list`);
    return v.map((x) => conform(x, t[0], key));
  }
  if (t && typeof t === "object") {
    if (!v || typeof v !== "object" || Array.isArray(v))
      throw new Error(`${key}: invalid group`);
    return Object.fromEntries(
      Object.keys(t).map((k) => [k, conform(v[k], t[k], k)]),
    );
  }
  throw new Error("Invalid template");
}
