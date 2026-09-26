import { eq } from "drizzle-orm";
import { AiSettingsForm } from "@/components/admin/AiSettingsForm";
import { db } from "@/db";
import { contentBlocks } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

const DEFAULTS = {
  temperature: 0.3,
  maxTokens: 600,
  topK: 5,
  threshold: 0.25,
  history: 8,
  storeConversations: true,
};
export default async function AiSettingsPage() {
  await requireAdmin();
  const [row] = await db
    .select()
    .from(contentBlocks)
    .where(eq(contentBlocks.key, "ai_settings"))
    .limit(1);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl">AI Settings</h1>
      <AiSettingsForm initial={{ ...DEFAULTS, ...(row?.data ?? {}) }} />
    </div>
  );
}
