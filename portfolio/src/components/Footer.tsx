import type { SiteData } from "@/content/types";
import { socialHref } from "@/lib/site";
import { Logo } from "./Logo";

export function Footer({ site }: { site: SiteData }) {
  return (
    <footer>
      <div className="wrap">
        <div>
          <div className="brand">
            <Logo
              name={site.brand.name}
              initials={site.brand.initials}
              logoUrl={site.branding.logoUrl}
            />
            {site.brand.name}
          </div>
          <div className="tagline" style={{ marginTop: 7 }}>
            {site.brand.tagline}
          </div>
        </div>
        <div style={{ display: "flex", gap: 26, flexWrap: "wrap" }}>
          {site.socials
            .filter((s) => s.enabled)
            .map((s) => (
              <a
                key={s.platform}
                className="mono"
                href={socialHref(s, site.contact)}
                {...(s.newTab
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {s.label} ↗
              </a>
            ))}
        </div>
        <div className="sm:text-right">
          {site.contact.email && (
            <div className="mono" style={{ textTransform: "none" }}>
              {site.contact.email}
            </div>
          )}
          <div className="tagline">{site.copyright}</div>
        </div>
      </div>
    </footer>
  );
}
