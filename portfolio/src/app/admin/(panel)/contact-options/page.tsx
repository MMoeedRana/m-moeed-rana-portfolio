import { asc } from "drizzle-orm";
import { ContactOptionsEditor } from "@/components/admin/ContactOptionsEditor";
import { db } from "@/db";
import { contactOptions } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export default async function ContactOptionsPage() {
  await requireAdmin();
  const rows = await db
    .select()
    .from(contactOptions)
    .orderBy(asc(contactOptions.sortOrder));
  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl">Contact Form Options</h1>
      <ContactOptionsEditor
        projectTypes={rows
          .filter((r) => r.kind === "projectType")
          .map((r) => r.label)}
        budgets={rows.filter((r) => r.kind === "budget").map((r) => r.label)}
      />
    </div>
  );
}
