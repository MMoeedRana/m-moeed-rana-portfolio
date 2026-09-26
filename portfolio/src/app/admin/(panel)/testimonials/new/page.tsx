import { EMPTY, TestimonialForm } from "@/components/admin/TestimonialForm";
import { requireAdmin } from "@/lib/auth";
export default async function NewTestimonial() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl">New testimonial</h1>
      <TestimonialForm id={null} defaults={EMPTY} />
    </div>
  );
}
