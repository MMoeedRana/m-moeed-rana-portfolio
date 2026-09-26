import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return new NextResponse("Missing URL", { status: 400 });
  }

  if (!url.startsWith("https://res.cloudinary.com/")) {
    return new NextResponse("Invalid file URL", { status: 400 });
  }

  const response = await fetch(url);

  if (!response.ok) {
    return new NextResponse("File not found", { status: 404 });
  }

  const buffer = await response.arrayBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        'attachment; filename="Muhammad-Moeed-Rana-Resume.pdf"',
      "Cache-Control": "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
