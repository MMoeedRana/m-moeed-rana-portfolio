import { z } from "zod";

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);
export const themeSchema = z.object({
  primary: hex,
  onPrimary: hex,
  background: hex,
  card: hex,
  foreground: hex,
  body: hex,
  border: hex,
  success: hex,
  radiusButton: z.number().int().min(0).max(40),
  radiusCard: z.number().int().min(0).max(40),
  bg: z.enum(["solid", "grid", "dots"]),
  animations: z.boolean(),
});
export type Theme = z.infer<typeof themeSchema>;

export const DEFAULT_THEME: Theme = {
  primary: "#FFA326",
  onPrimary: "#100E0B",
  background: "#100E0B",
  card: "#191612",
  foreground: "#F5F1E8",
  body: "#A89F90",
  border: "#2E2921",
  success: "#62BD6E",
  radiusButton: 12,
  radiusCard: 16,
  bg: "solid",
  animations: true,
};
export const PRESETS: { name: string; tokens: Theme }[] = [
  { name: "Default (Amber)", tokens: DEFAULT_THEME },
  {
    name: "Ocean",
    tokens: {
      ...DEFAULT_THEME,
      primary: "#3B82F6",
      onPrimary: "#FFFFFF",
      background: "#0B1018",
      card: "#111826",
      foreground: "#EAF0FA",
      body: "#93A1B8",
      border: "#1F2A3D",
      success: "#4ADE80",
    },
  },
  {
    name: "Cyber",
    tokens: {
      ...DEFAULT_THEME,
      primary: "#00F5A0",
      onPrimary: "#03130D",
      background: "#07090C",
      card: "#0D1117",
      foreground: "#E6FFF5",
      body: "#8CA39A",
      border: "#16261F",
      success: "#00F5A0",
      radiusButton: 4,
      radiusCard: 8,
      bg: "grid",
    },
  },
  {
    name: "Minimal Light",
    tokens: {
      ...DEFAULT_THEME,
      primary: "#D97706",
      onPrimary: "#FFFFFF",
      background: "#F7F5F0",
      card: "#FFFFFF",
      foreground: "#14110D",
      body: "#57534A",
      border: "#E4DFD3",
      success: "#16A34A",
      radiusButton: 10,
      radiusCard: 14,
    },
  },
];

const mix = (a: string, pa: number, b: string) =>
  `color-mix(in oklab,${a} ${pa}%,${b})`;
export function themeVars(t: Theme): Record<string, string> {
  const D = DEFAULT_THEME;
  const surfaces =
    t.background === D.background &&
    t.card === D.card &&
    t.foreground === D.foreground &&
    t.body === D.body &&
    t.border === D.border;
  const accent = t.primary === D.primary;
  const p = (n: number) => mix("var(--primary)", n, "transparent");
  return {
    "--background": t.background,
    "--card": t.card,
    "--foreground": t.foreground,
    "--body": t.body,
    "--border": t.border,
    "--primary": t.primary,
    "--on-primary": t.onPrimary,
    "--success": t.success,
    "--r-button": `${t.radiusButton}px`,
    "--r-card": `${t.radiusCard}px`,
    ...(surfaces
      ? {
          "--deep": "#14110D",
          "--elevated": "#211D17",
          "--shell": "#26211A",
          "--muted-foreground": "#6E675B",
          "--border-hover": "#3D372D",
          "--node-dim": "#3A342A",
        }
      : {
          "--deep": mix("var(--background)", 60, "var(--card)"),
          "--elevated": mix("var(--card)", 96, "var(--foreground)"),
          "--shell": mix("var(--card)", 93, "var(--foreground)"),
          "--muted-foreground": mix("var(--body)", 62, "var(--background)"),
          "--border-hover": mix("var(--border)", 88, "var(--foreground)"),
          "--node-dim": mix("var(--border)", 85, "var(--foreground)"),
        }),
    ...(accent
      ? { "--primary-dark": "#C97B12", "--primary-muted": "#C9924A" }
      : {
          "--primary-dark": mix("var(--primary)", 79, "black"),
          "--primary-muted": mix("var(--primary)", 75, "var(--body)"),
        }),
    "--p12": p(12),
    "--p20": p(20),
    "--p32": p(32),
    "--p45": p(45),
    "--p60": p(60),
    "--p85": p(85),
  };
}
export const themeCss = (t: Theme) =>
  "html:root{" +
  Object.entries(themeVars(t))
    .map(([k, v]) => `${k}:${v}`)
    .join(";") +
  "}";
export const bgStyle = (b: Theme["bg"]): React.CSSProperties => {
  const line = "color-mix(in oklab,var(--border) 60%,transparent)";
  return b === "grid"
    ? {
        backgroundImage: `linear-gradient(${line} 1px,transparent 1px),linear-gradient(90deg,${line} 1px,transparent 1px)`,
        backgroundSize: "48px 48px",
      }
    : b === "dots"
      ? {
          backgroundImage:
            "radial-gradient(var(--border) 1.2px,transparent 1.2px)",
          backgroundSize: "24px 24px",
        }
      : {};
};
