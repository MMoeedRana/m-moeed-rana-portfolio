import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { z } from "zod";
import { TestimonialForm } from "@/components/admin/TestimonialForm";
import { db } from "@/db";
import { testimonials } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export default async function EditTestimonial({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const [r] = await db
    .select()
    .from(testimonials)
    .where(eq(testimonials.id, id))
    .limit(1);
  if (!r) notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl">Edit testimonial</h1>
      <TestimonialForm
        id={r.id}
        defaults={{
          quote: r.quote,
          authorName: r.authorName,
          authorRole: r.authorRole,
          source: r.source,
          rating: r.rating,
          featured: r.featured,
          status: r.status,
          sortOrder: r.sortOrder,
        }}
      />
    </div>
  );
}
