"use client";
import { useEffect, useRef } from "react";
import type { HomeData } from "@/content/types";

export function PhoneMock({ name, a }: { name: string; a: HomeData["agent"] }) {
  const st = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (
      !matchMedia("(hover:hover) and (prefers-reduced-motion: no-preference)")
        .matches
    )
      return;
    const s = st.current!,
      ph = s.querySelector<HTMLElement>(".phone")!;
    const mv = (e: Event) => {
      const p = e as PointerEvent,
        r = s.getBoundingClientRect();
      ph.style.setProperty(
        "--ry",
        -16 + ((p.clientX - r.left) / r.width - 0.5) * 14 + "deg",
      );
      ph.style.setProperty(
        "--rx",
        6 - ((p.clientY - r.top) / r.height - 0.5) * 10 + "deg",
      );
    };
    const lv = () => {
      ph.style.setProperty("--ry", "-16deg");
      ph.style.setProperty("--rx", "6deg");
    };
    s.addEventListener("pointermove", mv);
    s.addEventListener("pointerleave", lv);
    return () => {
      s.removeEventListener("pointermove", mv);
      s.removeEventListener("pointerleave", lv);
    };
  }, []);
  const [u1, a1, u2, a2] = a.bubbles;
  return (
    <div ref={st} className="stage">
      <span className="ping">
        <span
          className="dot"
          style={{ width: 5, height: 5, background: "var(--primary)" }}
        />
        {a.ping}
      </span>
      <div className="echo" aria-hidden="true" />
      <div className="shadow" aria-hidden="true" />
      <div className="phone">
        <div className="screen">
          <div className="island" />
          <div className="ahead">
            <span className="orb" />
            <div>
              <b>{name}&apos;s Agent</b>
              <span className="mono">{a.status}</span>
            </div>
          </div>
          <div className="bub u b1">{u1}</div>
          <div className="bub a b2">{a1}</div>
          <div className="bub u b3">{u2}</div>
          <div className="typing">
            <s />
            <s />
            <s />
          </div>
          <div className="bub a b4">{a2}</div>
          <div className="inbar">
            {a.placeholder}
            <span className="mic" />
          </div>
        </div>
      </div>
      <div className="floater u">{a.floaters[0]}</div>
      <div className="floater a">{a.floaters[1]}</div>
    </div>
  );
}
