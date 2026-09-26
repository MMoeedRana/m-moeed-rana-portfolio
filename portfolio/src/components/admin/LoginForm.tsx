"use client";
import { useActionState } from "react";
import { loginAction } from "@/app/admin/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);
  const f =
    "w-full rounded-xl border border-border bg-card px-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none";
  return (
    <form action={action} className="space-y-3.5">
      <input
        className={f}
        name="email"
        type="email"
        placeholder="Email"
        autoComplete="username"
        required
      />
      <input
        className={f}
        name="password"
        type="password"
        placeholder="Password"
        autoComplete="current-password"
        required
      />
      {state?.error && (
        <p role="alert" className="text-sm text-red-400">
          {state.error}
        </p>
      )}
      <button
        className="btn w-full justify-center disabled:opacity-60"
        disabled={pending}
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
