"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { saveProject } from "@/app/admin/actions";
import {
  projectSchema,
  slugify,
  type ProjectInput,
} from "@/lib/project-schema";
import { uploadFile } from "@/lib/upload-client";

const f =
  "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-[15px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none";

const F = ({
  label,
  error,
  wide = false,
  children,
}: {
  label: string;
  error?: string;
  wide?: boolean;
  children: ReactNode;
}) => {
  return (
    <label
      className={
        "grid content-start gap-1.5 text-xs font-medium text-body " +
        (wide ? "md:col-span-2" : "")
      }
    >
      {label}

      {children}

      {error ? (
        <span role="alert" className="text-red-400">
          {error}
        </span>
      ) : null}
    </label>
  );
};

export const EMPTY: ProjectInput = {
  title: "",
  slug: "",
  category: "llm",
  summary: "",
  body: "",
  chip: "",
  tech: "",
  live: true,
  nda: false,
  caseStudy: false,
  image: "",
  status: "draft",
  sortOrder: 0,
};

type FormErrors = Partial<Record<keyof ProjectInput, string>>;

export function ProjectForm({
  id,
  defaults,
  categories,
}: {
  id: string | null;
  defaults: ProjectInput;
  categories: {
    slug: string;
    label: string;
  }[];
}) {
  const router = useRouter();

  const [form, setForm] = useState<ProjectInput>(defaults);
  const [errors, setErrors] = useState<FormErrors>({});
  const [err, setErr] = useState("");
  const [up, setUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  function update<K extends keyof ProjectInput>(
    key: K,
    value: ProjectInput[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setIsDirty(true);

    if (errors[key]) {
      setErrors((current) => ({
        ...current,
        [key]: undefined,
      }));
    }
  }

  function updateTitle(value: string) {
    setForm((current) => {
      const next = {
        ...current,
        title: value,
      };

      if (!id && !current.slug) {
        next.slug = slugify(value);
      }

      return next;
    });

    setIsDirty(true);

    setErrors((current) => ({
      ...current,
      title: undefined,
      slug: undefined,
    }));
  }

  function updateCheckbox(key: "live" | "nda" | "caseStudy", checked: boolean) {
    update(key, checked);
  }

  async function pick(file?: File) {
    if (!file) return;

    setUp(true);
    setErr("");

    try {
      const uploaded = await uploadFile(file);

      update("image", uploaded.url);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setUp(false);
    }
  }

  function removeImage() {
    update("image", "");
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setErr("");
    setErrors({});

    const result = projectSchema.safeParse(form);

    if (!result.success) {
      const nextErrors: FormErrors = {};

      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof ProjectInput;

        if (key && !nextErrors[key]) {
          nextErrors[key] = issue.message;
        }
      }

      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const r = await saveProject(id, result.data);

      if (!r.ok) {
        setErr(r.error ?? "Could not save.");
        return;
      }

      router.push("/admin/projects");
      router.refresh();
    } catch {
      setErr("Something went wrong while saving the project.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <div className="grid gap-4 rounded-2xl border border-border bg-card p-4 sm:p-6 md:grid-cols-2">
        <F label="Title" error={errors.title}>
          <input
            className={f}
            value={form.title}
            onChange={(e) => updateTitle(e.target.value)}
          />
        </F>

        <F label="Slug (URL)" error={errors.slug}>
          <input
            className={f}
            value={form.slug}
            onChange={(e) => update("slug", e.target.value)}
          />
        </F>

        <F label="Category" error={errors.category}>
          <select
            className={f}
            value={form.category}
            onChange={(e) =>
              update("category", e.target.value as ProjectInput["category"])
            }
          >
            {categories.length === 0 ? (
              <option value="">
                No categories yet — add one under Project Categories
              </option>
            ) : (
              categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.label}
                </option>
              ))
            )}
          </select>
        </F>

        <F label="Status" error={errors.status}>
          <select
            className={f}
            value={form.status}
            onChange={(e) =>
              update("status", e.target.value as ProjectInput["status"])
            }
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="unpublished">Unpublished</option>
          </select>
        </F>

        <F label="Short description" wide error={errors.summary}>
          <textarea
            className={`${f} min-h-20`}
            value={form.summary}
            onChange={(e) => update("summary", e.target.value)}
          />
        </F>

        <F label="Details (shown on the project page)" wide error={errors.body}>
          <textarea
            className={`${f} min-h-32`}
            value={form.body}
            onChange={(e) => update("body", e.target.value)}
          />
        </F>

        <F label="Highlight chip" error={errors.chip}>
          <input
            className={f}
            placeholder="AI · RAG"
            value={form.chip}
            onChange={(e) => update("chip", e.target.value)}
          />
        </F>

        <F label="Tech (comma separated)" error={errors.tech}>
          <input
            className={f}
            placeholder="Next.js, FastAPI, PostgreSQL"
            value={form.tech}
            onChange={(e) => update("tech", e.target.value)}
          />
        </F>

        <F label="Display order" error={errors.sortOrder}>
          <input
            className={f}
            type="number"
            value={form.sortOrder}
            onChange={(e) => update("sortOrder", Number(e.target.value))}
          />
        </F>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-body">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="size-4 accent-primary"
              checked={form.live}
              onChange={(e) => updateCheckbox("live", e.target.checked)}
            />
            LIVE badge
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="size-4 accent-primary"
              checked={form.nda}
              onChange={(e) => updateCheckbox("nda", e.target.checked)}
            />
            NDA badge
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="size-4 accent-primary"
              checked={form.caseStudy}
              onChange={(e) => updateCheckbox("caseStudy", e.target.checked)}
            />
            Show case study link
          </label>
        </div>

        <div className="grid gap-2 md:col-span-2">
          <span className="text-xs font-medium text-body">Thumbnail</span>

          <div className="flex flex-wrap items-center gap-4">
            {form.image && form.image.startsWith("http") && (
              <div className="relative h-20 w-36 overflow-hidden rounded-lg border border-border">
                <Image
                  src={form.image}
                  alt="Project thumbnail preview"
                  fill
                  sizes="144px"
                  className="object-cover"
                />
              </div>
            )}

            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={(e) => {
                void pick(e.target.files?.[0]);
                e.currentTarget.value = "";
              }}
              disabled={up}
              className="max-w-full text-sm text-body file:mr-3 file:rounded-lg file:border file:border-border file:bg-deep file:px-3 file:py-2 file:text-sm file:text-foreground"
            />

            {up && (
              <span className="text-sm text-muted-foreground">Uploading…</span>
            )}

            {form.image && (
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-red-400"
                onClick={removeImage}
              >
                Remove
              </button>
            )}
          </div>

          {form.image && !form.image.startsWith("http") && (
            <p className="text-xs text-amber-400">
              This project still has an old local media URL. Upload a new
              thumbnail to move it to Cloudinary.
            </p>
          )}

          {errors.image && (
            <span role="alert" className="text-xs text-red-400">
              {errors.image}
            </span>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 z-20 -mx-4 flex flex-wrap items-center gap-3 border-t border-border bg-background/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <button
          type="submit"
          className="btn !py-2.5 !text-sm disabled:opacity-50"
          disabled={isSubmitting || up}
        >
          {isSubmitting ? "Saving…" : id ? "Save changes" : "Create project"}
        </button>

        <button
          type="button"
          className="text-sm text-body hover:text-foreground"
          onClick={() => router.push("/admin/projects")}
        >
          Cancel
        </button>

        {err && (
          <p role="alert" className="text-sm text-red-400">
            {err}
          </p>
        )}
      </div>
    </form>
  );
}
