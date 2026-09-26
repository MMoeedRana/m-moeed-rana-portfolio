import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { themeCss } from "@/lib/theme";
import { getTheme } from "@/lib/theme-server";

const space = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-space",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTheme();
  return (
    <html
      lang="en"
      className={`${space.variable} ${inter.variable} ${mono.variable}`}
      data-bg={t.bg}
      data-motion={t.animations ? "on" : "off"}
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCss(t) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
