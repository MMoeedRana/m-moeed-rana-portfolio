"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Copy, FileText, Trash2, Upload } from "lucide-react";
import { deleteMedia } from "@/app/admin/actions";
import { uploadFile } from "@/lib/upload-client";

type Item = {
  id: string;
  url: string;
  mime: string | null;
  size: number | null;
};

export function MediaLibrary({ items }: { items: Item[] }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [copied, setCopied] = useState("");

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;

    setBusy(true);
    setMsg("");

    try {
      for (const f of Array.from(files)) {
        await uploadFile(f);
      }
    } catch (e) {
      setMsg((e as Error).message);
    }

    setBusy(false);

    if (input.current) {
      input.current.value = "";
    }

    router.refresh();
  }

  const copyUrl = (url: string) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    return `${window.location.origin}${url}`;
  };

  const ib =
    "flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-body hover:text-primary";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={input}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/gif,image/webp,application/pdf"
          className="sr-only"
          id="up"
          onChange={(e) => onFiles(e.target.files)}
        />

        <label
          htmlFor="up"
          className={`btn !py-2.5 !text-sm ${
            busy ? "pointer-events-none opacity-60" : ""
          }`}
        >
          <Upload size={16} />
          {busy ? "Uploading…" : "Upload files"}
        </label>

        <span className="text-sm text-muted-foreground">
          PNG, JPG, GIF, WebP or PDF · max 5 MB each
        </span>

        {msg && (
          <p role="alert" className="w-full text-sm text-red-400">
            {msg}
          </p>
        )}
      </div>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          No files yet.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 2xl:grid-cols-6">
          {items.map((m) => (
            <li
              key={m.id}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="relative grid aspect-square place-items-center bg-deep">
                {m.mime?.startsWith("image/") ? (
                  <Image
                    src={m.url}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 25vw, 16vw"
                    className="object-cover"
                  />
                ) : (
                  <FileText
                    size={36}
                    className="text-muted-foreground"
                    aria-hidden="true"
                  />
                )}
              </div>

              <div className="grid gap-2 p-3">
                <span className="truncate text-xs text-muted-foreground">
                  {m.url.startsWith("http")
                    ? m.url.split("/").pop()
                    : m.url.replace("/media/", "")}{" "}
                  · {m.size ? Math.round(m.size / 1024) : 0} KB
                </span>

                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    className={ib}
                    onClick={() => {
                      navigator.clipboard.writeText(copyUrl(m.url));
                      setCopied(m.id);
                      setTimeout(() => setCopied(""), 1500);
                    }}
                  >
                    <Copy size={13} />
                    {copied === m.id ? "Copied" : "Copy URL"}
                  </button>

                  <form action={deleteMedia.bind(null, m.id)}>
                    <button
                      type="submit"
                      className={`${ib} hover:!text-red-400`}
                      aria-label="Delete file"
                    >
                      <Trash2 size={13} />
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}