import { asc } from "drizzle-orm";

import { db, hasDb } from "@/db";

import {
  brandingSettings,
  contactOptions,
  contentBlocks,
  navigationItems,
  projectCategories,
  socialLinks,
  themeSettings,
} from "@/db/schema";

import { siteSeed } from "@/content/site.seed";

import type {
  AboutData,
  HeroBlock,
  HomeData,
  ServicesData,
  SiteData,
  Social,
} from "@/content/types";

import { BLOCKS, fill } from "@/lib/blocks";
import { themeSchema } from "@/lib/theme";

export const whatsappUrl = (phone: string) =>
  `https://wa.me/${phone.replace(/\D/g, "")}`;

/**
 * Reads the public site configuration from Postgres.
 *
 * Falls back to the typed seed only when DATABASE_URL is unavailable
 * or required base content has not been created yet.
 */
export async function getSite(): Promise<SiteData> {
  if (!hasDb) {
    return siteSeed;
  }

  const [
    blocks,
    nav,
    socials,
    [branding],
    categories,
    options,
    themeRows,
  ] = await Promise.all([
    db.select().from(contentBlocks),

    db
      .select()
      .from(navigationItems)
      .orderBy(asc(navigationItems.sortOrder)),

    db
      .select()
      .from(socialLinks)
      .orderBy(asc(socialLinks.sortOrder)),

    db
      .select()
      .from(brandingSettings)
      .limit(1),

    // Dynamic project categories from the database
    db
      .select({
        slug: projectCategories.slug,
        label: projectCategories.label,
      })
      .from(projectCategories)
      .orderBy(asc(projectCategories.sortOrder)),

    db
      .select()
      .from(contactOptions)
      .orderBy(asc(contactOptions.sortOrder)),

    db
      .select()
      .from(themeSettings)
      .orderBy(asc(themeSettings.sortOrder)),
  ]);

  const b = Object.fromEntries(
    blocks.map((x) => [x.key, x.data]),
  );

  // If the main brand block has not been created yet,
  // use the seed configuration.
  if (!b.brand) {
    return siteSeed;
  }

  const cta = nav.find((n) => n.isCta);

  const themes = themeRows
    .filter((r) => r.inSwitcher)
    .flatMap((r) => {
      const p = themeSchema.safeParse(r.tokens);

      return p.success
        ? [
            {
              id: r.id,
              name: r.name,
              tokens: p.data,
            },
          ]
        : [];
    });

  const projectTypes = options
    .filter((o) => o.kind === "projectType")
    .map((o) => o.label);

  const budgets = options
    .filter((o) => o.kind === "budget")
    .map((o) => o.label);

  return {
    brand: fill(
      b.brand,
      BLOCKS.brand.shape,
    ) as SiteData["brand"],

    contact: fill(
      b.contact,
      BLOCKS.contact.shape,
    ) as SiteData["contact"],

    hero: fill(
      b.hero,
      BLOCKS.hero.shape,
    ) as HeroBlock,

    home: fill(
      b.home ?? siteSeed.home,
      BLOCKS.home.shape,
    ) as HomeData,

    services: fill(
      b.services ?? siteSeed.services,
      BLOCKS.services.shape,
    ) as ServicesData,

    about: fill(
      b.about ?? siteSeed.about,
      BLOCKS.about.shape,
    ) as AboutData,

    marquee: (
      fill(
        b.marquee,
        BLOCKS.marquee.shape,
      ) as { items: string[] }
    ).items,

    copyright: (
      fill(
        b.footer,
        BLOCKS.footer.shape,
      ) as { copyright: string }
    ).copyright,

    nav: nav
      .filter((n) => !n.isCta && n.visible)
      .map((n) => ({
        label: n.label,
        href: n.href,
        desktop: n.desktop,
      })),

    cta: {
      label: cta?.label ?? "",
      href: cta?.href ?? "/contact",
      visible: !!cta?.visible,
    },

    socials: socials.map((s) => ({
      platform: s.platform as Social["platform"],
      label: s.label,
      url: s.url,
      enabled: s.enabled,
      newTab: s.newTab,
    })),

    branding: {
      logoUrl: branding?.logoUrl ?? "",
      faviconUrl: branding?.faviconUrl ?? "",
      ogImageUrl: branding?.ogImageUrl ?? "",
      seoTitle: branding?.seoTitle ?? "",
      seoDescription: branding?.seoDescription ?? "",
    },

    // IMPORTANT:
    // Use DB categories first, seed only as fallback.
    projectCategories:
      categories.length > 0
        ? categories
        : siteSeed.projectCategories,

    contactOptions: {
      projectTypes:
        projectTypes.length > 0
          ? projectTypes
          : siteSeed.contactOptions.projectTypes,

      budgets:
        budgets.length > 0
          ? budgets
          : siteSeed.contactOptions.budgets,
    },

    themes,
  };
}

export function socialHref(
  s: Social,
  c: SiteData["contact"],
) {
  if (s.platform === "whatsapp") {
    return whatsappUrl(c.whatsapp);
  }

  if (s.platform === "email") {
    return `mailto:${c.email}`;
  }

  return s.url;
}