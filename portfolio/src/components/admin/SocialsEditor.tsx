"use client";
import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { saveSocials } from "@/app/admin/actions";

type Item = {
  platform: string;
  label: string;
  url: string;
  enabled: boolean;
  newTab: boolean;
};
const PLATFORMS = [
  "linkedin",
  "github",
  "whatsapp",
  "email",
  "twitter",
  "instagram",
  "youtube",
  "custom",
];
const f =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none";
const ib =
  "grid size-8 place-items-center rounded-lg border border-border text-body hover:text-primary disabled:opacity-40";

export function SocialsEditor({ initial }: { initial: Item[] }) {
  const [items, setItems] = useState(initial),
    [msg, setMsg] = useState(""),
    [pending, start] = useTransition();
  const upd = (i: number, x: Partial<Item>) =>
    setItems((a) => a.map((y, j) => (j === i ? { ...y, ...x } : y)));
  const move = (i: number, d: number) =>
    setItems((a) => {
      const n = [...a];
      [n[i], n[i + d]] = [n[i + d], n[i]];
      return n;
    });
  const save = () =>
    start(async () => {
      const r = await saveSocials(items).catch(() => ({
        ok: false,
        error: "Failed",
      }));
      setMsg(r.ok ? "Saved." : (r.error ?? "Failed"));
    });
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <h2 className="mb-2 text-base">Social &amp; contact links</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          WhatsApp and Email use the number and address from Site Content →
          Contact; leave URL blank for those.
        </p>
        <div className="grid gap-3">
          {items.map((it, i) => (
            <div
              key={i}
              className="grid grid-cols-1 gap-2 rounded-xl border border-border bg-deep p-3 sm:grid-cols-[1fr_1fr_1.6fr_auto_auto_auto]"
            >
              <select
                className={f}
                value={it.platform}
                onChange={(e) => upd(i, { platform: e.target.value })}
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <input
                className={f}
                value={it.label}
                placeholder="Label"
                onChange={(e) => upd(i, { label: e.target.value })}
              />
              <input
                className={f}
                value={it.url}
                placeholder="https://…"
                onChange={(e) => upd(i, { url: e.target.value })}
              />
              <label className="flex items-center gap-2 text-xs text-body">
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  checked={it.enabled}
                  onChange={(e) => upd(i, { enabled: e.target.checked })}
                />
                On
              </label>
              <label className="flex items-center gap-2 text-xs text-body">
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  checked={it.newTab}
                  onChange={(e) => upd(i, { newTab: e.target.checked })}
                />
                New tab
              </label>
              <div className="flex justify-end gap-1.5">
                <button
                  type="button"
                  className={ib}
                  aria-label="Move up"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  className={ib}
                  aria-label="Move down"
                  disabled={i === items.length - 1}
                  onClick={() => move(i, 1)}
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  type="button"
                  className={`${ib} hover:!text-red-400`}
                  aria-label="Remove"
                  onClick={() => setItems((a) => a.filter((_, j) => j !== i))}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setItems((a) => [
                ...a,
                {
                  platform: "custom",
                  label: "New link",
                  url: "",
                  enabled: true,
                  newTab: true,
                },
              ])
            }
            className="flex w-fit items-center gap-2 rounded-lg border border-dashed border-border px-3.5 py-2 text-sm text-body hover:border-primary hover:text-primary"
          >
            <Plus size={15} />
            Add link
          </button>
        </div>
      </section>
      <div className="sticky bottom-0 z-20 -mx-4 flex flex-wrap items-center gap-3 border-t border-border bg-background/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <button
          className="btn !py-2.5 !text-sm disabled:opacity-50"
          disabled={pending}
          onClick={save}
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
        <p role="status" className="text-sm text-muted-foreground">
          {msg}
        </p>
      </div>
    </div>
  );
}
