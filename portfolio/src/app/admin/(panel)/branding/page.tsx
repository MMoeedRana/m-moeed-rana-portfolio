import { BrandingEditor } from "@/components/admin/BrandingEditor";
import { db } from "@/db";
import { brandingSettings } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export default async function BrandingPage() {
  await requireAdmin();
  const [row] = await db.select().from(brandingSettings).limit(1);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl">Branding</h1>
      <BrandingEditor
        initial={{
          logoUrl: row?.logoUrl ?? "",
          faviconUrl: row?.faviconUrl ?? "",
          ogImageUrl: row?.ogImageUrl ?? "",
          seoTitle: row?.seoTitle ?? "",
          seoDescription: row?.seoDescription ?? "",
        }}
      />
    </div>
  );
}
