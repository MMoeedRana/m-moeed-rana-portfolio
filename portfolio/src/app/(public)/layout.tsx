import type { Metadata } from "next";
import { getSite } from "@/lib/site";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const s = await getSite();
  const title = s.branding.seoTitle || `${s.brand.name} — ${s.brand.role}`,
    description = s.branding.seoDescription || s.hero.lead;
  return {
    title,
    description,
    icons: s.branding.faviconUrl ? { icon: s.branding.faviconUrl } : undefined,
    openGraph: {
      title,
      description,
      ...(s.branding.ogImageUrl ? { images: [s.branding.ogImageUrl] } : {}),
    },
  };
}
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const site = await getSite();
  const footerLine = [
    site.contact.email,
    `WhatsApp ${site.contact.whatsappDisplay}`,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <>
      <Navbar site={site} footerLine={footerLine} />
      <main>{children}</main>
      <Footer site={site} />
    </>
  );
}
