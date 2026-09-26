import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { Reveal } from "@/components/Reveal";
import { getSite, socialHref } from "@/lib/site";

export const metadata: Metadata = { title: "Contact" };
const overlapNote = "Daily overlap with US & EU time zones · Slack-first";
export default async function ContactPage() {
  const site = await getSite(),
    c = site.contact;
  const li = site.socials.find((s) => s.platform === "linkedin" && s.enabled),
    wa = site.socials.find((s) => s.platform === "whatsapp" && s.enabled);
  return (
    <section className="sec">
      <div className="wrap grid items-start gap-14 lg:grid-cols-[1.05fr_.95fr] lg:gap-14">
        <div>
          <Reveal>
            <span className="eyebrow">Contact</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="h1" style={{ margin: "14px 0 18px" }}>
              Tell me what&apos;s manual.
            </h1>
          </Reveal>
          <Reveal delay={0.14}>
            <p className="lead" style={{ marginBottom: 30 }}>
              Two-minute form. I reply within 24 hours with next steps — usually
              a call slot.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <ContactForm
              projectTypes={site.contactOptions.projectTypes}
              budgets={site.contactOptions.budgets}
            />
          </Reveal>
        </div>
        <div className="grid gap-5">
          {c.calendlyUrl && (
            <Reveal
              className="card grid justify-items-start gap-3"
              style={{ borderColor: "var(--p45)" }}
            >
              <h3 className="h3 text-[22px] font-medium">Book the call</h3>
              <p className="text-sm">
                Free 30 minutes — you leave with a scoped plan either way.
              </p>
              <a
                className="btn"
                href={c.calendlyUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Calendly ↗
              </a>
            </Reveal>
          )}
          <Reveal className="card grid gap-3.5">
            <h3 className="h3 text-[22px] font-medium">Prefer direct?</h3>
            {c.email && (
              <a
                className="mono text-xs normal-case tracking-[.02em]"
                href={`mailto:${c.email}`}
              >
                {c.email}
              </a>
            )}
            {wa && (
              <a
                className="mono text-xs"
                href={socialHref(wa, c)}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp · {c.whatsappDisplay}
              </a>
            )}
            {li && (
              <a
                className="mono text-xs"
                href={li.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn ↗
              </a>
            )}
          </Reveal>
          <Reveal delay={0.08} className="card">
            <span className="bitem">
              <span className="dot" />
              Replies within 24h · {site.hero.availability}
            </span>
          </Reveal>
          <span className="tagline">{overlapNote}</span>
        </div>
      </div>
    </section>
  );
}
