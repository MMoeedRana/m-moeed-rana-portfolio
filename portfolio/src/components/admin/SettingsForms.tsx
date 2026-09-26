"use client";
import { useState } from "react";
import { changeAdminPassword, saveAdminProfile } from "@/app/admin/actions";
const f =
  "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-[15px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none";
const box = "rounded-2xl border border-border bg-card p-4 sm:p-6";

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [v, setV] = useState({ name, email }),
    [msg, setMsg] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const r = await saveAdminProfile(v).catch(() => ({
      ok: false,
      error: "Failed",
    }));
    setMsg(r.ok ? "Saved." : (r.error ?? "Failed"));
    setBusy(false);
  }
  return (
    <form onSubmit={submit} className={`${box} grid gap-4 sm:grid-cols-2`}>
      <h2 className="text-base sm:col-span-2">Admin profile</h2>
      <label className="grid gap-1.5 text-xs font-medium text-body">
        Name
        <input
          className={f}
          value={v.name}
          onChange={(e) => setV((s) => ({ ...s, name: e.target.value }))}
        />
      </label>
      <label className="grid gap-1.5 text-xs font-medium text-body">
        Email
        <input
          className={f}
          type="email"
          value={v.email}
          onChange={(e) => setV((s) => ({ ...s, email: e.target.value }))}
        />
      </label>
      <div className="flex items-center gap-3 sm:col-span-2">
        <button
          className="btn !py-2.5 !text-sm disabled:opacity-50"
          disabled={busy}
        >
          {busy ? "Saving…" : "Save profile"}
        </button>
        <p role="status" className="text-sm text-muted-foreground">
          {msg}
        </p>
      </div>
    </form>
  );
}
export function PasswordForm() {
  const [v, setV] = useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }),
    [msg, setMsg] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const r = await changeAdminPassword(v).catch(() => ({
      ok: false,
      error: "Failed",
    }));
    setMsg(r.ok ? "Password changed." : (r.error ?? "Failed"));
    if (r.ok)
      setV({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setBusy(false);
  }
  return (
    <form onSubmit={submit} className={`${box} grid gap-4 sm:grid-cols-2`}>
      <h2 className="text-base sm:col-span-2">Change password</h2>
      <label className="grid gap-1.5 text-xs font-medium text-body sm:col-span-2">
        Current password
        <input
          className={f}
          type="password"
          autoComplete="current-password"
          value={v.currentPassword}
          onChange={(e) =>
            setV((s) => ({ ...s, currentPassword: e.target.value }))
          }
        />
      </label>
      <label className="grid gap-1.5 text-xs font-medium text-body">
        New password (12+ chars)
        <input
          className={f}
          type="password"
          autoComplete="new-password"
          value={v.newPassword}
          onChange={(e) => setV((s) => ({ ...s, newPassword: e.target.value }))}
        />
      </label>
      <label className="grid gap-1.5 text-xs font-medium text-body">
        Confirm new password
        <input
          className={f}
          type="password"
          autoComplete="new-password"
          value={v.confirmPassword}
          onChange={(e) =>
            setV((s) => ({ ...s, confirmPassword: e.target.value }))
          }
        />
      </label>
      <div className="flex items-center gap-3 sm:col-span-2">
        <button
          className="btn !py-2.5 !text-sm disabled:opacity-50"
          disabled={busy}
        >
          {busy ? "Saving…" : "Change password"}
        </button>
        <p role="status" className="text-sm text-muted-foreground">
          {msg}
        </p>
      </div>
    </form>
  );
}
