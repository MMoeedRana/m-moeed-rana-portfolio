"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useTransition, type ReactElement } from "react";
import {
  ArrowDown,
  ArrowUp,
  FileText,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { saveBlock } from "@/app/admin/actions";
import { uploadFile } from "@/lib/upload-client";

const f =
  "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-[15px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none";

const ib =
  "grid size-9 place-items-center rounded-lg border border-border text-body transition-colors hover:text-primary disabled:opacity-40";

const FIXED = new Set(["bubbles", "floaters", "title"]),
  LONG = new Set(["lead", "text", "a", "body", "paragraphs", "copyright"]);

const MEDIA_IMAGE = new Set(["image"]),
  MEDIA_VIDEO_OR_IMAGE = new Set(["mediaUrl"]),
  MEDIA_FILE = new Set(["resumeUrl"]);

const lab = (k: string) =>
  k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

const scalar = (t: any) => typeof t !== "object";

const blank = (t: any): any =>
  typeof t === "string"
    ? ""
    : typeof t === "number"
      ? 0
      : typeof t === "boolean"
        ? false
        : Array.isArray(t)
          ? []
          : Object.fromEntries(Object.keys(t).map((k) => [k, blank(t[k])]));

const nameOf = (x: any) =>
  x && typeof x === "object"
    ? x.title || x.label || x.q || x.name || x.when || x.tag || ""
    : "";

function MediaField({
  v,
  set,
  accept,
  kind,
}: {
  v: string;
  set: (x: string) => void;
  accept: string;
  kind: "image" | "file" | "video-or-image";
}) {
  const [busy, setBusy] = useState(false),
    [err, setErr] = useState("");

  async function pick(file?: File) {
    if (!file) return;

    setBusy(true);
    setErr("");

    try {
      set((await uploadFile(file)).url);
    } catch (e) {
      setErr((e as Error).message);
    }

    setBusy(false);
  }

  const isVideo = kind === "video-or-image" && /\.(mp4|webm|mov)$/i.test(v);

  return (
    <div className="grid gap-2">
      {v &&
        (kind === "file" ? (
          <a
            href={v}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-fit items-center gap-2 rounded-lg border border-border bg-deep px-3 py-2 text-sm text-primary"
          >
            <FileText size={15} />
            {v.split("/").pop()}
          </a>
        ) : isVideo ? (
          <video
            src={v}
            controls
            className="h-32 w-56 rounded-lg border border-border object-cover"
          />
        ) : (
          <div className="relative h-24 w-40 overflow-hidden rounded-lg border border-border">
            <Image
              src={v}
              alt=""
              fill
              sizes="160px"
              className="object-cover"
            />
          </div>
        ))}

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="file"
          accept={accept}
          onChange={(e) => pick(e.target.files?.[0])}
          className="max-w-full text-sm text-body file:mr-3 file:rounded-lg file:border file:border-border file:bg-deep file:px-3 file:py-2 file:text-sm file:text-foreground"
        />

        {busy && (
          <span className="text-xs text-muted-foreground">
            Uploading…
          </span>
        )}

        {v && (
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-red-400"
            onClick={() => set("")}
          >
            Remove
          </button>
        )}
      </div>

      {err && (
        <span role="alert" className="text-xs text-red-400">
          {err}
        </span>
      )}

      <input
        className={f}
        placeholder="or paste an https:// URL"
        value={v}
        onChange={(e) => set(e.target.value)}
      />

      <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Upload size={11} />
        Upload a file above, or paste a link instead.
      </span>
    </div>
  );
}

function Node({
  v,
  t,
  k,
  set,
}: {
  v: any;
  t: any;
  k: string;
  set: (x: any) => void;
}): ReactElement {
  if (typeof t === "string") {
    if (k === "mediaType")
      return (
        <select
          className={f}
          value={v}
          onChange={(e) => set(e.target.value)}
        >
          <option value="none">None (show default placeholder)</option>
          <option value="video">Video</option>
          <option value="image">Image</option>
        </select>
      );

    if (MEDIA_IMAGE.has(k))
      return (
        <MediaField
          v={v}
          set={set}
          accept="image/png,image/jpeg,image/webp,image/gif"
          kind="image"
        />
      );

    if (MEDIA_VIDEO_OR_IMAGE.has(k))
      return (
        <MediaField
          v={v}
          set={set}
          accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm"
          kind="video-or-image"
        />
      );

    if (MEDIA_FILE.has(k))
      return (
        <MediaField
          v={v}
          set={set}
          accept="application/pdf"
          kind="file"
        />
      );

    return LONG.has(k) || v.length > 70 ? (
      <textarea
        className={`${f} min-h-24 resize-y`}
        value={v}
        onChange={(e) => set(e.target.value)}
      />
    ) : (
      <input
        className={f}
        value={v}
        onChange={(e) => set(e.target.value)}
      />
    );
  }

  if (typeof t === "number")
    return (
      <input
        className={f}
        type="number"
        value={v}
        onChange={(e) => set(Number(e.target.value))}
      />
    );

  if (typeof t === "boolean")
    return (
      <input
        type="checkbox"
        className="size-5 accent-primary"
        checked={v}
        onChange={(e) => set(e.target.checked)}
      />
    );

  if (Array.isArray(t)) {
    const it = t[0],
      fixed = FIXED.has(k),
      list: any[] = v;

    const upd = (i: number, x: any) =>
      set(list.map((y, j) => (j === i ? x : y)));

    const move = (i: number, d: number) => {
      const n = [...list];
      [n[i], n[i + d]] = [n[i + d], n[i]];
      set(n);
    };

    const ctl = (i: number) =>
      !fixed && (
        <div className="flex flex-none gap-1.5">
          <button
            type="button"
            className={ib}
            aria-label="Move up"
            disabled={i === 0}
            onClick={() => move(i, -1)}
          >
            <ArrowUp size={15} />
          </button>

          <button
            type="button"
            className={ib}
            aria-label="Move down"
            disabled={i === list.length - 1}
            onClick={() => move(i, 1)}
          >
            <ArrowDown size={15} />
          </button>

          <button
            type="button"
            className={`${ib} hover:!text-red-400`}
            aria-label="Remove"
            onClick={() => set(list.filter((_, j) => j !== i))}
          >
            <Trash2 size={15} />
          </button>
        </div>
      );

    return (
      <div className="grid gap-3">
        {list.map((x, i) =>
          scalar(it) ? (
            <div key={i} className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <Node
                  v={x}
                  t={it}
                  k={k}
                  set={(y) => upd(i, y)}
                />
              </div>

              {ctl(i)}
            </div>
          ) : (
            <div
              key={i}
              className="rounded-xl border border-border bg-deep p-3 sm:p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="mono truncate text-[11px] text-muted-foreground">
                  #{i + 1} {nameOf(x)}
                </span>

                {ctl(i)}
              </div>

              <Node
                v={x}
                t={it}
                k={k}
                set={(y) => upd(i, y)}
              />
            </div>
          ),
        )}

        {!fixed && (
          <button
            type="button"
            onClick={() => set([...list, blank(it)])}
            className="flex w-fit items-center gap-2 rounded-lg border border-dashed border-border px-3.5 py-2 text-sm text-body hover:border-primary hover:text-primary"
          >
            <Plus size={15} />
            Add
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Object.keys(t).map((c) => {
        const wide =
          !scalar(t[c]) ||
          LONG.has(c) ||
          (typeof v[c] === "string" && v[c].length > 70);

        const inner = (
          <Node
            v={v[c]}
            t={t[c]}
            k={c}
            set={(x) => set({ ...v, [c]: x })}
          />
        );

        return scalar(t[c]) ? (
          <label
            key={c}
            className={`grid content-start gap-1.5 text-xs font-medium text-body ${
              wide ? "md:col-span-2" : ""
            }`}
          >
            {lab(c)}
            {inner}
          </label>
        ) : (
          <fieldset
            key={c}
            className="grid gap-2 md:col-span-2"
          >
            <legend className="mb-2 text-sm font-medium text-foreground">
              {lab(c)}
            </legend>

            {inner}
          </fieldset>
        );
      })}
    </div>
  );
}

export function BlockEditor({
  blockKey,
  initial,
  shape,
}: {
  blockKey: string;
  initial: any;
  shape: any;
}) {
  const [v, setV] = useState(initial),
    [saved, setSaved] = useState(initial),
    [msg, setMsg] = useState<{ ok: boolean; t: string }>(),
    [pending, start] = useTransition();

  const dirty = JSON.stringify(v) !== JSON.stringify(saved);

  useEffect(() => {
    if (!dirty) return;

    const h = (e: BeforeUnloadEvent) => e.preventDefault();

    addEventListener("beforeunload", h);

    return () => removeEventListener("beforeunload", h);
  }, [dirty]);

  const save = () =>
    start(async () => {
      const r = await saveBlock(blockKey, v).catch(() => ({
        ok: false,
        error: "Something went wrong.",
      }));

      if (r.ok) {
        setSaved(v);
        setMsg({ ok: true, t: "Saved." });
      } else {
        setMsg({
          ok: false,
          t: r.error ?? "Failed",
        });
      }
    });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <Node v={v} t={shape} k="" set={setV} />
      </div>

      <div className="sticky bottom-0 z-20 -mx-4 flex flex-wrap items-center gap-3 border-t border-border bg-background/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <button
          className="btn !py-2.5 !text-sm disabled:opacity-50"
          disabled={pending || !dirty}
          onClick={save}
        >
          {pending ? "Saving…" : "Save changes"}
        </button>

        <p
          role="status"
          className={`text-sm ${
            msg && !msg.ok
              ? "text-red-400"
              : "text-muted-foreground"
          }`}
        >
          {msg ? msg.t : dirty ? "Unsaved changes." : ""}

          {msg?.ok && !dirty && (
            <>
              {" "}
              AI knowledge needs synchronization —{" "}
              <Link
                href="/admin/ai"
                className="text-primary"
              >
                Sync now
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}