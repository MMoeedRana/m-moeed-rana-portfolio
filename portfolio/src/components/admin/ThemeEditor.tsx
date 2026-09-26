"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition, type CSSProperties } from "react";
import { deletePreset, savePreset, saveTheme } from "@/app/admin/actions";
import { bgStyle, DEFAULT_THEME, themeVars, type Theme } from "@/lib/theme";

type Preset = { id: string; name: string; tokens: Theme };
const COLORS: [keyof Theme, string][] = [
  ["primary", "Primary"],
  ["onPrimary", "Text on primary"],
  ["background", "Background"],
  ["card", "Card"],
  ["foreground", "Heading text"],
  ["body", "Body text"],
  ["border", "Border"],
  ["success", "Success"],
];
const box = "rounded-2xl border border-border bg-card p-4 sm:p-6";
const btn =
  "rounded-lg border border-border px-4 py-2 text-sm text-body transition-colors hover:border-muted-foreground hover:text-foreground disabled:opacity-50";

export function ThemeEditor({
  initial,
  presets,
}: {
  initial: Theme;
  presets: Preset[];
}) {
  const router = useRouter(),
    [t, setT] = useState(initial),
    [saved, setSaved] = useState(initial),
    [name, setName] = useState(""),
    [msg, setMsg] = useState(""),
    [pending, start] = useTransition();
  const set = <K extends keyof Theme>(k: K, v: Theme[K]) =>
    setT((x) => ({ ...x, [k]: v }));
  const dirty = JSON.stringify(t) !== JSON.stringify(saved);
  const run = (
    fn: () => Promise<{ ok: boolean; error?: string }>,
    ok: string,
    done?: () => void,
  ) =>
    start(async () => {
      const r = await fn().catch(() => ({
        ok: false,
        error: "Something went wrong.",
      }));
      setMsg(r.ok ? ok : (r.error ?? "Failed"));
      if (r.ok) {
        done?.();
        router.refresh();
      }
    });
  const vars = {
    ...themeVars(t),
    background: "var(--background)",
    color: "var(--body)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-card)",
    ...bgStyle(t.bg),
  } as CSSProperties;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
      <div className="space-y-5 lg:order-1">
        <section className={box}>
          <h2 className="mb-3 text-base">Presets</h2>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center overflow-hidden rounded-lg border border-border"
              >
                <button
                  className="px-3 py-1.5 text-sm text-body hover:text-foreground"
                  onClick={() => setT(p.tokens)}
                >
                  <i
                    className="mr-2 inline-block size-2.5 rounded-full align-middle"
                    style={{ background: p.tokens.primary }}
                  />
                  {p.name}
                </button>
                <button
                  aria-label={`Delete ${p.name}`}
                  className="border-l border-border px-2 text-muted-foreground hover:text-red-400"
                  onClick={() =>
                    run(() => deletePreset(p.id), "Preset deleted")
                  }
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </section>
        <section className={`${box} grid gap-3`}>
          <h2 className="text-base">Colors</h2>
          {COLORS.map(([k, label]) => (
            <label
              key={k}
              className="flex items-center gap-3 text-sm text-body"
            >
              <input
                type="color"
                value={t[k] as string}
                onChange={(e) => set(k, e.target.value as never)}
                className="size-10 cursor-pointer rounded-lg border border-border bg-transparent p-0.5"
              />
              {label}
              <code className="ml-auto text-xs text-muted-foreground">
                {t[k] as string}
              </code>
            </label>
          ))}
        </section>
        <section className={`${box} grid gap-4 text-sm text-body`}>
          <h2 className="text-base">Shape, background &amp; motion</h2>
          {(["radiusButton", "radiusCard"] as const).map((k) => (
            <label key={k} className="grid gap-1.5">
              {k === "radiusButton" ? "Button radius" : "Card radius"}: {t[k]}px
              <input
                type="range"
                min={0}
                max={40}
                value={t[k]}
                onChange={(e) => set(k, +e.target.value)}
                className="accent-primary"
              />
            </label>
          ))}
          <label className="grid gap-1.5">
            Background pattern
            <select
              value={t.bg}
              onChange={(e) => set("bg", e.target.value as Theme["bg"])}
              className="rounded-xl border border-border bg-background px-3 py-2.5 text-foreground"
            >
              <option value="solid">Solid</option>
              <option value="grid">Grid</option>
              <option value="dots">Dots</option>
            </select>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={t.animations}
              onChange={(e) => set("animations", e.target.checked)}
              className="size-4 accent-primary"
            />
            Enable animations
          </label>
        </section>
        <section className={`${box} grid gap-3`}>
          <div className="flex flex-wrap gap-2">
            <button
              disabled={pending || !dirty}
              className="btn !py-2.5 !text-sm disabled:opacity-50"
              onClick={() =>
                run(
                  () => saveTheme(t),
                  "Theme saved & applied",
                  () => setSaved(t),
                )
              }
            >
              {pending ? "Saving…" : "Save & apply"}
            </button>
            <button className={btn} onClick={() => setT(DEFAULT_THEME)}>
              Reset to default
            </button>
          </div>
          <div className="flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              placeholder="Preset name"
              aria-label="Preset name"
              className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
            <button
              disabled={pending}
              className={btn}
              onClick={() =>
                run(
                  () => savePreset(name, t),
                  "Preset saved",
                  () => setName(""),
                )
              }
            >
              Save as preset
            </button>
          </div>
          <p role="status" className="min-h-5 text-sm text-muted-foreground">
            {msg || (dirty ? "Unsaved changes — preview only." : "")}
          </p>
        </section>
      </div>

      <div className="order-first lg:order-2 lg:sticky lg:top-24 lg:self-start">
        <p className="mono mb-2 text-[11px] text-muted-foreground">
          Live preview
        </p>
        <div style={vars} className="overflow-hidden">
          <div
            className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <span className="brand">
              <span className="mark">MR</span>Moeed Rana
            </span>
            <span className="links !gap-5 max-sm:!hidden">
              <a className="on">Work</a>
              <a>Services</a>
              <a>About</a>
            </span>
            <span className="btn btn-nav">Book a Call</span>
          </div>
          <div className="grid justify-items-start gap-4 px-4 py-8 sm:px-8 sm:py-10">
            <span className="pill">
              <span className="dot" />
              Booking new projects
            </span>
            <h3 className="h1 !text-[clamp(24px,3.4vw,38px)]">
              Live in weeks,{" "}
              <span style={{ color: "var(--primary)" }}>not months.</span>
            </h3>
            <p className="max-w-[46ch] text-[15px]">
              Voice AI, workflow automation, and custom LLM products.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="btn">Book a Call →</span>
              <span className="btn btn-ghost">See the Live Work</span>
            </div>
            <div className="card mt-2 grid w-full gap-2.5 sm:max-w-sm">
              <h3 className="h3 text-xl font-medium">DOCSURE</h3>
              <p className="text-sm">
                Voice AI that books appointments end-to-end.
              </p>
              <span className="chip w-fit">100+ daily users</span>
              <span className="tagline">Vapi · n8n · GCP</span>
              <span className="alink">Case study →</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
