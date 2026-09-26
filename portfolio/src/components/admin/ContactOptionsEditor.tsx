"use client";
import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { saveContactOptions } from "@/app/admin/actions";

const f =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none";
const ib =
  "grid size-8 place-items-center rounded-lg border border-border text-body hover:text-primary disabled:opacity-40";

function List({
  kind,
  title,
  hint,
  initial,
}: {
  kind: "projectType" | "budget";
  title: string;
  hint: string;
  initial: string[];
}) {
  const [items, setItems] = useState(initial),
    [msg, setMsg] = useState(""),
    [pending, start] = useTransition();
  const move = (i: number, d: number) =>
    setItems((a) => {
      const n = [...a];
      [n[i], n[i + d]] = [n[i + d], n[i]];
      return n;
    });
  const save = () =>
    start(async () => {
      const r = await saveContactOptions(
        kind,
        items.map((label) => ({ label })),
      ).catch(() => ({ ok: false, error: "Failed" }));
      setMsg(r.ok ? "Saved." : (r.error ?? "Failed"));
    });
  return (
    <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
      <h2 className="mb-1 text-base">{title}</h2>
      <p className="mb-4 text-sm text-muted-foreground">{hint}</p>
      <div className="grid gap-2.5">
        {items.map((v, i) => (
          <div
            key={i}
            className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]"
          >
            <input
              className={f}
              value={v}
              onChange={(e) =>
                setItems((a) => a.map((x, j) => (j === i ? e.target.value : x)))
              }
            />
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
          onClick={() => setItems((a) => [...a, ""])}
          className="flex w-fit items-center gap-2 rounded-lg border border-dashed border-border px-3.5 py-2 text-sm text-body hover:border-primary hover:text-primary"
        >
          <Plus size={15} />
          Add option
        </button>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button
          className="btn !py-2.5 !text-sm disabled:opacity-50"
          disabled={pending}
          onClick={save}
        >
          {pending ? "Saving…" : "Save"}
        </button>
        <p role="status" className="text-sm text-muted-foreground">
          {msg}
        </p>
      </div>
    </section>
  );
}
export function ContactOptionsEditor({
  projectTypes,
  budgets,
}: {
  projectTypes: string[];
  budgets: string[];
}) {
  return (
    <div className="space-y-6">
      <List
        kind="projectType"
        title="Project types"
        hint="Shown in the Contact form's 'Project type' dropdown."
        initial={projectTypes}
      />
      <List
        kind="budget"
        title="Budget ranges"
        hint="Shown in the Contact form's 'Budget range' dropdown."
        initial={budgets}
      />
    </div>
  );
}
