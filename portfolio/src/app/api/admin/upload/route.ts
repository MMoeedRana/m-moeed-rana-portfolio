import { NextResponse } from "next/server";

import { db } from "@/db";
import { media } from "@/db/schema";
import { getAdmin } from "@/lib/auth";
import { MAX_BYTES, store } from "@/lib/storage";

const err = (m: string, s: number) =>
  NextResponse.json({ error: m }, { status: s });

export async function POST(req: Request) {
  if (!(await getAdmin())) {
    return err("Unauthorized", 401);
  }

  const origin = req.headers.get("origin");

  if (origin && new URL(origin).host !== req.headers.get("host")) {
    return err("Forbidden", 403);
  }

  const file = (await req.formData().catch(() => null))?.get("file");

  if (!(file instanceof File)) {
    return err("No file provided.", 400);
  }

  if (file.size > MAX_BYTES) {
    return err("File is larger than 5 MB.", 413);
  }

  const buf = Buffer.from(await file.arrayBuffer());

  const saved = await store(buf, file.name);

  if (!saved) {
    return err(
      "Only PNG, JPG, GIF, WebP, MP4, WebM or PDF files are allowed.",
      415,
    );
  }

  const [row] = await db
    .insert(media)
    .values({
      url: saved.url,
      path: saved.path,
      mime: saved.mime,
      size: buf.length,
      alt: "",
    })
    .returning();

  return NextResponse.json({
    id: row.id,
    url: row.url,
  });
}
