"use client";
import { useState, useTransition } from "react";
import { saveAiSettings } from "@/app/admin/actions";

type V = {
  temperature: number;
  maxTokens: number;
  topK: number;
  threshold: number;
  history: number;
  storeConversations: boolean;
};
export function AiSettingsForm({ initial }: { initial: V }) {
  const [v, setV] = useState(initial),
    [msg, setMsg] = useState(""),
    [pending, start] = useTransition();
  const set = <K extends keyof V>(k: K, x: V[K]) =>
    setV((s) => ({ ...s, [k]: x }));
  const save = () =>
    start(async () => {
      const r = await saveAiSettings(v).catch(() => ({
        ok: false,
        error: "Failed",
      }));
      setMsg(
        r.ok
          ? "Saved. Takes effect on the AI service's next request."
          : (r.error ?? "Failed"),
      );
    });
  const range = (
    k: keyof V,
    label: string,
    min: number,
    max: number,
    step: number,
  ) => (
    <label className="grid gap-1.5 text-sm text-body">
      {label}: <b className="text-foreground">{v[k]}</b>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={v[k] as number}
        onChange={(e) => set(k, +e.target.value as never)}
        className="accent-primary"
      />
    </label>
  );
  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-2xl border border-border bg-card p-4 sm:p-6">
        <h2 className="text-base">Model</h2>
        {range("temperature", "Temperature (creativity)", 0, 1, 0.1)}
        {range("maxTokens", "Max response length (tokens)", 100, 2000, 50)}
        {range("history", "Conversation memory (messages)", 0, 20, 1)}
      </section>
      <section className="grid gap-4 rounded-2xl border border-border bg-card p-4 sm:p-6">
        <h2 className="text-base">Retrieval (RAG)</h2>
        {range("topK", "Top-K passages retrieved", 1, 15, 1)}
        {range("threshold", "Similarity threshold", 0, 1, 0.05)}
      </section>
      <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <label className="flex items-center gap-3 text-sm text-body">
          <input
            type="checkbox"
            className="size-4 accent-primary"
            checked={v.storeConversations}
            onChange={(e) => set("storeConversations", e.target.checked)}
          />
          Store visitor conversations (for the transcript viewer)
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
