import { loadEnvConfig } from "@next/env";
import { count } from "drizzle-orm";
loadEnvConfig(process.cwd());

async function main() {
  const { db } = await import("./index"),
    s = await import("./schema"),
    { siteSeed } = await import("../content/site.seed");
  const { hash } = await import("@node-rs/argon2");
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!process.env.DATABASE_URL || !ADMIN_EMAIL || !ADMIN_PASSWORD)
    throw new Error(
      "Set DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD in .env.local",
    );
  if (ADMIN_PASSWORD.length < 8)
    throw new Error("ADMIN_PASSWORD must be at least 8 characters");

  await db
    .insert(s.admins)
    .values({
      email: ADMIN_EMAIL.toLowerCase(),
      name: siteSeed.brand.name,
      passwordHash: await hash(ADMIN_PASSWORD),
    })
    .onConflictDoNothing();
  const blocks = {
    brand: siteSeed.brand,
    contact: siteSeed.contact,
    hero: siteSeed.hero,
    marquee: { items: siteSeed.marquee },
    footer: { copyright: siteSeed.copyright },
    home: siteSeed.home,
    services: siteSeed.services,
    about: siteSeed.about,
  };
  for (const [key, data] of Object.entries(blocks))
    await db
      .insert(s.contentBlocks)
      .values({ key, data })
      .onConflictDoNothing();
  if (!(await db.select({ c: count() }).from(s.navigationItems))[0].c) {
    await db.insert(s.navigationItems).values([
      ...siteSeed.nav.map((n, i) => ({ ...n, sortOrder: i })),
      {
        label: siteSeed.cta.label,
        href: siteSeed.cta.href,
        desktop: false,
        isCta: true,
        visible: siteSeed.cta.visible,
        sortOrder: 99,
      },
    ]);
  }
  if (!(await db.select({ c: count() }).from(s.socialLinks))[0].c)
    await db
      .insert(s.socialLinks)
      .values(siteSeed.socials.map((x, i) => ({ ...x, sortOrder: i })));

  const { projectsSeed } = await import("../content/projects.seed");
  await db
    .insert(s.projects)
    .values(
      projectsSeed.map((x, i) => ({
        slug: x.slug,
        title: x.title,
        category: x.category,
        summary: x.summary,
        body: x.body,
        status: "published" as const,
        sortOrder: i,
        meta: {
          chip: x.chip,
          tech: x.tech,
          live: x.live,
          nda: x.nda,
          caseStudy: x.caseStudy,
          image: x.image,
        },
      })),
    )
    .onConflictDoNothing();
  if (!(await db.select({ c: count() }).from(s.themeSettings))[0].c) {
    const { DEFAULT_THEME, PRESETS } = await import("../lib/theme");
    await db
      .insert(s.themeSettings)
      .values([
        { name: "Active theme", tokens: DEFAULT_THEME, isActive: true },
        ...PRESETS.map((p) => ({ name: p.name, tokens: p.tokens })),
      ]);
  }
  console.log("Seed complete.");
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
