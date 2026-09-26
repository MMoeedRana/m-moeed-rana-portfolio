import { asc } from "drizzle-orm";
import { NavigationEditor } from "@/components/admin/NavigationEditor";
import { SocialsEditor } from "@/components/admin/SocialsEditor";
import { db } from "@/db";
import { navigationItems, socialLinks } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export default async function NavigationPage() {
  await requireAdmin();
  const [nav, socials] = await Promise.all([
    db.select().from(navigationItems).orderBy(asc(navigationItems.sortOrder)),
    db.select().from(socialLinks).orderBy(asc(socialLinks.sortOrder)),
  ]);
  const cta = nav.find((n) => n.isCta) ?? {
    label: "Book a Call",
    href: "/contact",
    visible: true,
  };
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl sm:text-3xl">Navigation &amp; Socials</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Reorder, rename or hide links without touching code.
        </p>
      </div>
      <NavigationEditor
        initial={nav
          .filter((n) => !n.isCta)
          .map((n) => ({
            label: n.label,
            href: n.href,
            desktop: n.desktop,
            visible: n.visible,
          }))}
        initialCta={{ label: cta.label, href: cta.href, visible: cta.visible }}
      />
      <SocialsEditor
        initial={socials.map((s) => ({
          platform: s.platform,
          label: s.label,
          url: s.url,
          enabled: s.enabled,
          newTab: s.newTab,
        }))}
      />
    </div>
  );
}
