"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { saveBranding } from "@/app/admin/actions";
import { uploadFile } from "@/lib/upload-client";

type V = {
  logoUrl: string;
  faviconUrl: string;
  ogImageUrl: string;
  seoTitle: string;
  seoDescription: string;
};

const f =
  "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-[15px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none";

const FIELDS: [
  keyof V & ("logoUrl" | "faviconUrl" | "ogImageUrl"),
  string,
  string,
][] = [
  ["logoUrl", "Logo", "Square image shown next to the site name."],
  ["faviconUrl", "Favicon", "Small square icon shown in the browser tab."],
  [
    "ogImageUrl",
    "Social share image",
    "Shown when the site is shared on social media (1200×630 recommended).",
  ],
];

export function BrandingEditor({ initial }: { initial: V }) {
  const [v, setV] = useState(initial),
    [busy, setBusy] = useState<string>(""),
    [msg, setMsg] = useState(""),
    [pending, start] = useTransition();

  async function pick(
    key:
      | V["logoUrl" & "faviconUrl" & "ogImageUrl"]
      | "logoUrl"
      | "faviconUrl"
      | "ogImageUrl",
    file?: File,
  ) {
    if (!file) return;

    setBusy(key);

    try {
      setV((s) => ({ ...s, [key]: "" }));

      const r = await uploadFile(file);

      setV((s) => ({ ...s, [key]: r.url }));
    } catch (e) {
      setMsg((e as Error).message);
    }

    setBusy("");
  }

  const save = () =>
    start(async () => {
      const r = await saveBranding(v).catch(() => ({
        ok: false,
        error: "Failed",
      }));

      setMsg(r.ok ? "Saved." : (r.error ?? "Failed"));
    });

  return (
    <div className="space-y-6">
      <section className="grid gap-6 rounded-2xl border border-border bg-card p-4 sm:p-6 md:grid-cols-3">
        {FIELDS.map(([key, label, hint]) => (
          <div key={key} className="grid gap-2">
            <span className="text-sm font-medium text-foreground">
              {label}
            </span>

            <span className="text-xs text-muted-foreground">
              {hint}
            </span>

            <div className="relative mt-1 grid aspect-video place-items-center overflow-hidden rounded-xl border border-dashed border-border bg-deep">
              {v[key] ? (
                <Image
                  src={v[key]}
                  alt={label}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-contain p-2"
                />
              ) : (
                <span className="text-xs text-muted-foreground">
                  No file
                </span>
              )}
            </div>

            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={(e) => pick(key, e.target.files?.[0])}
              className="text-sm text-body file:mr-3 file:rounded-lg file:border file:border-border file:bg-deep file:px-3 file:py-2 file:text-sm file:text-foreground"
            />

            {busy === key && (
              <span className="text-xs text-muted-foreground">
                Uploading…
              </span>
            )}

            {v[key] && (
              <button
                type="button"
                className="w-fit text-xs text-muted-foreground hover:text-red-400"
                onClick={() => setV((s) => ({ ...s, [key]: "" }))}
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </section>

      <section className="grid gap-4 rounded-2xl border border-border bg-card p-4 sm:p-6">
        <h2 className="text-base">SEO</h2>

        <label className="grid gap-1.5 text-xs font-medium text-body">
          Page title
          <input
            className={f}
            maxLength={70}
            value={v.seoTitle}
            onChange={(e) =>
              setV((s) => ({
                ...s,
                seoTitle: e.target.value,
              }))
            }
          />
        </label>

        <label className="grid gap-1.5 text-xs font-medium text-body">
          Meta description
          <textarea
            className={`${f} min-h-20`}
            maxLength={200}
            value={v.seoDescription}
            onChange={(e) =>
              setV((s) => ({
                ...s,
                seoDescription: e.target.value,
              }))
            }
          />
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