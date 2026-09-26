"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { saveTestimonial } from "@/app/admin/actions";
import {
  testimonialSchema,
  type TestimonialInput,
} from "@/lib/testimonial-schema";

const f =
  "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-[15px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none";
export const EMPTY: TestimonialInput = {
  quote: "",
  authorName: "",
  authorRole: "",
  source: "",
  rating: 5,
  featured: false,
  status: "draft",
  sortOrder: 0,
};

export function TestimonialForm({
  id,
  defaults,
}: {
  id: string | null;
  defaults: TestimonialInput;
}) {
  const router = useRouter(),
    [err, setErr] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TestimonialInput>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: defaults,
  });
  const submit = handleSubmit(async (v) => {
    const r = await saveTestimonial(id, v).catch(() => ({
      ok: false,
      error: "Something went wrong.",
    }));
    if (!r.ok) return setErr(r.error ?? "Could not save.");
    router.push("/admin/testimonials");
    router.refresh();
  });
  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <div className="grid gap-4 rounded-2xl border border-border bg-card p-4 sm:p-6 md:grid-cols-2">
        <label className="grid gap-1.5 text-xs font-medium text-body md:col-span-2">
          Quote
          <textarea className={`${f} min-h-24`} {...register("quote")} />
          {errors.quote && (
            <span role="alert" className="text-red-400">
              {errors.quote.message}
            </span>
          )}
        </label>
        <label className="grid gap-1.5 text-xs font-medium text-body">
          Author name
          <input className={f} {...register("authorName")} />
          {errors.authorName && (
            <span role="alert" className="text-red-400">
              {errors.authorName.message}
            </span>
          )}
        </label>
        <label className="grid gap-1.5 text-xs font-medium text-body">
          Role / company
          <input className={f} {...register("authorRole")} />
        </label>
        <label className="grid gap-1.5 text-xs font-medium text-body">
          Source (e.g. via Upwork, via Email)
          <input className={f} {...register("source")} />
        </label>
        <label className="grid gap-1.5 text-xs font-medium text-body">
          Rating (1–5)
          <input
            className={f}
            type="number"
            step="0.1"
            min={1}
            max={5}
            {...register("rating", { valueAsNumber: true })}
          />
        </label>
        <label className="grid gap-1.5 text-xs font-medium text-body">
          Status
          <select className={f} {...register("status")}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="unpublished">Unpublished</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-xs font-medium text-body">
          Display order
          <input
            className={f}
            type="number"
            {...register("sortOrder", { valueAsNumber: true })}
          />
        </label>
        <label className="flex items-center gap-2 self-end text-sm text-body">
          <input
            type="checkbox"
            className="size-4 accent-primary"
            {...register("featured")}
          />
          Featured
        </label>
      </div>
      <div className="sticky bottom-0 z-20 -mx-4 flex flex-wrap items-center gap-3 border-t border-border bg-background/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <button
          className="btn !py-2.5 !text-sm disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Saving…"
            : id
              ? "Save changes"
              : "Create testimonial"}
        </button>
        <button
          type="button"
          className="text-sm text-body hover:text-foreground"
          onClick={() => router.push("/admin/testimonials")}
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
