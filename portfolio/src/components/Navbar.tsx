"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { SiteData } from "@/content/types";
import { Logo } from "./Logo";

export function Navbar({
  site,
  footerLine,
}: {
  site: SiteData;
  footerLine: string;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const on = (h: string) =>
    h === "/" ? path === "/" : path === h || path.startsWith(h + "/");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect 
    setOpen(false);
  }, [path]);
  useEffect(() => {
    document.body.classList.toggle("lock", open);
    return () => document.body.classList.remove("lock");
  }, [open]);
  return (
    <>
      <nav className="nav" aria-label="Main">
        <div className="wrap">
          <Link className="brand" href="/">
            <Logo
              name={site.brand.name}
              initials={site.brand.initials}
              logoUrl={site.branding.logoUrl}
            />
            {site.brand.name}
          </Link>
          <div className="links">
            {site.nav
              .filter((n) => n.desktop)
              .map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className={on(n.href) ? "on" : ""}
                  aria-current={on(n.href) ? "page" : undefined}
                >
                  {n.label}
                </Link>
              ))}
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {site.cta.visible && (
              <Link className="btn btn-nav" href={site.cta.href}>
                {site.cta.label}
              </Link>
            )}
            <button
              className={`burger${open ? " open" : ""}`}
              aria-label="Menu"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((o) => !o)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </nav>
      <div
        className={`menu${open ? " open" : ""}`}
        id="mobile-menu"
        aria-hidden={!open}
      >
        {site.nav.map((n, i) => (
          <Link
            key={n.href}
            href={n.href}
            className="ml"
            tabIndex={open ? 0 : -1}
            style={{ transitionDelay: open ? `${(i + 1) * 0.05}s` : "0s" }}
          >
            {n.label}
          </Link>
        ))}
        <span
          className="tagline"
          style={{ marginTop: 14, textAlign: "center", padding: "0 16px" }}
        >
          {footerLine}
        </span>
      </div>
    </>
  );
}
