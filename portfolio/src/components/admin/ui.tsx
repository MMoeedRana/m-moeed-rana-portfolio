import type { ReactNode } from "react";
const tones = {
  primary: "bg-primary/15 text-primary",
  success: "bg-success/15 text-success",
  danger: "bg-red-500/15 text-red-400",
  muted: "bg-elevated text-body",
};
export function Badge({
  tone = "muted",
  children,
}: {
  tone?: keyof typeof tones;
  children: ReactNode;
}) {
  return (
    <span
      className={`mono inline-block rounded-md px-2 py-1 text-[10px] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
export const when = (d: Date) =>
  d.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
