"use client";

import { useState } from "react";
import { contactSchema, type ContactInput } from "@/lib/contact-schema";

const f =
  "w-full rounded-xl border border-border bg-card px-4 py-3.5 text-[15px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none";

type FormErrors = Partial<Record<keyof ContactInput, string>>;

const EMPTY: ContactInput = {
  name: "",
  email: "",
  projectType: "",
  budget: "",
  message: "",
  website: "",
};

export function ContactForm({
  projectTypes,
  budgets,
}: {
  projectTypes: string[];
  budgets: string[];
}) {
  const [form, setForm] = useState<ContactInput>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [res, setRes] = useState<{
    ok?: boolean;
    error?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof ContactInput>(
    key: K,
    value: ContactInput[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    if (errors[key]) {
      setErrors((current) => ({
        ...current,
        [key]: undefined,
      }));
    }

    if (res.error) {
      setRes({});
    }
  }

  function validate() {
    const result = contactSchema.safeParse(form);

    if (result.success) {
      setErrors({});
      return result.data;
    }

    const nextErrors: FormErrors = {};

    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof ContactInput;

      if (key && !nextErrors[key]) {
        nextErrors[key] = issue.message;
      }
    }

    setErrors(nextErrors);
    return null;
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setRes({});

    const data = validate();

    if (!data) {
      return;
    }

    setIsSubmitting(true);

    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const j = await r.json().catch(() => ({}));

      if (!r.ok) {
        throw new Error(j.error ?? "Something went wrong. Please try again.");
      }

      setRes({ ok: true });
      setForm(EMPTY);
      setErrors({});
    } catch (e) {
      setRes({
        error:
          e instanceof Error
            ? e.message
            : "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const err = (message?: string) =>
    message ? (
      <p role="alert" className="-mt-2 mb-3 text-sm text-red-400">
        {message}
      </p>
    ) : null;

  return (
    <form onSubmit={submit} noValidate className="grid gap-3.5">
      <div>
        <input
          className={f}
          placeholder="Your name"
          aria-label="Your name"
          autoComplete="name"
          aria-invalid={!!errors.name}
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
        />
        {err(errors.name)}
      </div>

      <div>
        <input
          className={f}
          type="email"
          placeholder="Work email"
          aria-label="Work email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
        />
        {err(errors.email)}
      </div>

      <select
        className={f}
        aria-label="Project type"
        value={form.projectType}
        onChange={(e) => update("projectType", e.target.value)}
      >
        <option value="">
          Project type
        </option>

        {projectTypes.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <select
        className={f}
        aria-label="Budget range"
        value={form.budget}
        onChange={(e) => update("budget", e.target.value)}
      >
        <option value="">Budget range</option>

        {budgets.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <div>
        <textarea
          className={`${f} min-h-32 resize-y`}
          placeholder="What's eating your team's hours right now?"
          aria-label="Message"
          aria-invalid={!!errors.message}
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
        />
        {err(errors.message)}
      </div>

      {/* Honeypot field */}
      <input
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
        value={form.website}
        onChange={(e) => update("website", e.target.value)}
      />

      {res.ok && (
        <p
          role="status"
          className="rounded-xl border border-success/40 bg-success/10 p-4 text-sm text-success"
        >
          Message sent — check your inbox for a confirmation. I&apos;ll reply
          within 24 hours.
        </p>
      )}

      {res.error && (
        <p
          role="alert"
          className="rounded-xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-400"
        >
          {res.error}
        </p>
      )}

      <div>
        <button
          type="submit"
          className="btn disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending…" : "Send it →"}
        </button>
      </div>

      <div className="tagline">
        You&apos;ll get a scoped reply, not a newsletter.
      </div>
    </form>
  );
}
