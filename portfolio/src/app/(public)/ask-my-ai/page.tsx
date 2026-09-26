import type { Metadata } from "next";
import { AskChat } from "@/components/AskChat";
import { Reveal } from "@/components/Reveal";
import { getSite } from "@/lib/site";

export const metadata: Metadata = { title: "Ask my AI" };
const suggestions = [
  "What AI projects has he built?",
  "Which technologies does he use?",
  "What services does he offer?",
  "What's the best way to contact him?",
];

export default async function AskPage() {
  const site = await getSite();
  return (
    <>
      <header className="sec" style={{ paddingBottom: 56 }}>
        <div className="wrap center">
          <Reveal>
            <span className="orb" style={{ width: 84, height: 84 }} />
          </Reveal>
          <Reveal delay={0.06}>
            <span className="mono text-xs text-primary">My personal agent</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="h1" style={{ maxWidth: "16ch" }}>
              Don&apos;t read about me. Interrogate me.
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="lead" style={{ maxWidth: "60ch" }}>
              {site.brand.name}&apos;s AI assistant answers from the portfolio
              knowledge base — projects, skills, services and contact — and says
              so when it doesn&apos;t know.
            </p>
          </Reveal>
        </div>
      </header>
      <section style={{ paddingBottom: 72 }}>
        <div className="wrap">
          <Reveal>
            <AskChat suggestions={suggestions} name={site.brand.name} />
          </Reveal>
          <p className="tagline mt-6 text-center">
            AI-generated · Conversations are stored anonymously to improve the
            agent
          </p>
        </div>
      </section>
    </>
  );
}
