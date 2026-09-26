import { desc } from "drizzle-orm";
import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { db } from "@/db";
import { media } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export default async function MediaPage() {
  await requireAdmin();
  const items = await db
    .select({
      id: media.id,
      url: media.url,
      mime: media.mime,
      size: media.size,
    })
    .from(media)
    .orderBy(desc(media.createdAt))
    .limit(200);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl">Media</h1>
      <MediaLibrary items={items} />
    </div>
  );
}
