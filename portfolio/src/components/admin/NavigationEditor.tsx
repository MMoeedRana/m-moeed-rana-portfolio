"use client";
import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { saveNavigation } from "@/app/admin/actions";

type Item = { label: string; href: string; desktop: boolean; visible: boolean };
type Cta = { label: string; href: string; visible: boolean };
const f =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none";
const ib =
  "grid size-8 place-items-center rounded-lg border border-border text-body hover:text-primary disabled:opacity-40";

export function NavigationEditor({
  initial,
  initialCta,
}: {
  initial: Item[];
  initialCta: Cta;
}) {
  const [items, setItems] = useState(initial),
    [cta, setCta] = useState(initialCta),
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
      const r = await saveNavigation(items, cta).catch(() => ({
        ok: false,
        error: "Failed",
      }));
      setMsg(r.ok ? "Saved." : (r.error ?? "Failed"));
    });
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <h2 className="mb-4 text-base">Nav links</h2>
        <div className="grid gap-3">
          {items.map((it, i) => (
            <div
              key={i}
              className="grid grid-cols-1 gap-2 rounded-xl border border-border bg-deep p-3 sm:grid-cols-[1fr_1.4fr_auto_auto_auto]"
            >
              <input
                className={f}
                value={it.label}
                placeholder="Label"
                onChange={(e) => upd(i, { label: e.target.value })}
              />
              <input
                className={f}
                value={it.href}
                placeholder="/path"
                onChange={(e) => upd(i, { href: e.target.value })}
              />
              <label className="flex items-center gap-2 text-xs text-body">
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  checked={it.desktop}
                  onChange={(e) => upd(i, { desktop: e.target.checked })}
                />
                Desktop
              </label>
              <label className="flex items-center gap-2 text-xs text-body">
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  checked={it.visible}
                  onChange={(e) => upd(i, { visible: e.target.checked })}
                />
                Visible
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
                { label: "New link", href: "/", desktop: true, visible: true },
              ])
            }
            className="flex w-fit items-center gap-2 rounded-lg border border-dashed border-border px-3.5 py-2 text-sm text-body hover:border-primary hover:text-primary"
          >
            <Plus size={15} />
            Add link
          </button>
        </div>
      </section>
      <section className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:p-6 md:grid-cols-[1fr_1.4fr_auto]">
        <h2 className="text-base md:col-span-3">Header CTA button</h2>
        <input
          className={f}
          value={cta.label}
          placeholder="Book a Call"
          onChange={(e) => setCta((c) => ({ ...c, label: e.target.value }))}
        />
        <input
          className={f}
          value={cta.href}
          placeholder="/contact"
          onChange={(e) => setCta((c) => ({ ...c, href: e.target.value }))}
        />
        <label className="flex items-center gap-2 text-xs text-body">
          <input
            type="checkbox"
            className="size-4 accent-primary"
            checked={cta.visible}
            onChange={(e) =>
              setCta((c) => ({ ...c, visible: e.target.checked }))
            }
          />
          Visible
        </label>
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
