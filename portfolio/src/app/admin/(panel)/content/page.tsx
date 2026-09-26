import { eq } from "drizzle-orm";
import Link from "next/link";
import { BlockEditor } from "@/components/admin/BlockEditor";
import { db } from "@/db";
import { contentBlocks } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { BLOCKS, fill, type BlockKey } from "@/lib/blocks";

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<{ block?: string }>;
}) {
  await requireAdmin();
  const { block } = await searchParams;
  const key = (block && block in BLOCKS ? block : "brand") as BlockKey,
    def = BLOCKS[key];
  const [row] = await db
    .select()
    .from(contentBlocks)
    .where(eq(contentBlocks.key, key))
    .limit(1);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl">Site Content</h1>
      <nav
        aria-label="Content blocks"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
      >
        {(Object.keys(BLOCKS) as BlockKey[]).map((k) => (
          <Link
            key={k}
            href={`?block=${k}`}
            scroll={false}
            aria-current={k === key ? "page" : undefined}
            className={`pill whitespace-nowrap ${k === key ? "!border-primary !bg-primary !text-on-primary" : ""}`}
          >
            {BLOCKS[k].label}
          </Link>
        ))}
      </nav>
      <BlockEditor
        key={key}
        blockKey={key}
        shape={def.shape}
        initial={fill(row?.data ?? def.shape, def.shape)}
      />
    </div>
  );
}
