import { max } from "drizzle-orm";
import { db } from "@/db";
import { contentBlocks, projects } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { syncKnowledge } from "@/app/admin/actions";
import { Badge, when } from "@/components/admin/ui";

type Status = {
  enabled: boolean;
  documents: number;
  chunks: number;
  failed: number;
  lastSync: string | null;
};
async function status(): Promise<Status | null> {
  const { AI_SERVICE_URL, INTERNAL_API_KEY } = process.env;
  if (!AI_SERVICE_URL || !INTERNAL_API_KEY) return null;
  const r = await fetch(`${AI_SERVICE_URL}/ai/status`, {
    headers: { "x-internal-key": INTERNAL_API_KEY },
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  }).catch(() => null);
  return r?.ok ? r.json() : null;
}
export default async function KnowledgeBase() {
  await requireAdmin();
  const s = await status();
  const [[{ t: c1 }], [{ t: c2 }]] = await Promise.all([
    db.select({ t: max(contentBlocks.updatedAt) }).from(contentBlocks),
    db.select({ t: max(projects.updatedAt) }).from(projects),
  ]);
  const changed = c1 && c2 ? (c1 > c2 ? c1 : c2) : (c1 ?? c2);
  const stale = !!changed && (!s?.lastSync || changed > new Date(s.lastSync));
  const btn =
    "rounded-lg border border-border px-4 py-2 text-sm text-body transition-colors hover:border-muted-foreground hover:text-foreground";
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl sm:text-3xl">AI Knowledge Base</h1>
        <Badge tone={!s ? "danger" : s.enabled ? "success" : "muted"}>
          {!s
            ? "service unreachable"
            : s.enabled
              ? "ai enabled"
              : "ai disabled"}
        </Badge>
        {stale && <Badge tone="primary">knowledge needs sync</Badge>}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
        {[
          ["Documents", s?.documents ?? "—"],
          ["Chunks", s?.chunks ?? "—"],
          ["Failed", s?.failed ?? "—"],
          ["Last sync", s?.lastSync ? when(new Date(s.lastSync)) : "—"],
        ].map(([l, v]) => (
          <div
            key={l}
            className="rounded-2xl border border-border bg-card p-4 sm:p-6"
          >
            <p className="mono text-[11px] text-muted-foreground">{l}</p>
            <p className="mt-2 break-words font-mono text-2xl text-foreground sm:text-3xl">
              {v}
            </p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <form action={syncKnowledge.bind(null, "all")}>
          <button
            className={`${btn} !border-primary !bg-primary !text-on-primary`}
          >
            Sync all
          </button>
        </form>
        <form action={syncKnowledge.bind(null, "projects")}>
          <button className={btn}>Sync projects</button>
        </form>
        <form action={syncKnowledge.bind(null, "profile")}>
          <button className={btn}>Sync profile</button>
        </form>
      </div>
    </div>
  );
}
