"use client";

import Image from "next/image";
import { Fragment, useEffect, useRef, type CSSProperties } from "react";
import { canvas as C } from "@/content/hero-canvas";

const v = (o: Record<string, string | number>) => o as CSSProperties;

type Props = {
  label: string;
  duration: string;
  nodes: string[];
  mediaType: "none" | "video" | "image";
  mediaUrl: string;
};

export function HeroCanvas({
  label,
  duration,
  nodes,
  mediaType,
  mediaUrl,
}: Props) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      !matchMedia("(hover:hover) and (prefers-reduced-motion: no-preference)")
        .matches
    )
      return;

    const cv = root.current!,
      hero = cv.closest("header") ?? cv;

    const layers = cv.querySelectorAll<HTMLElement>(".cl"),
      vc = cv.querySelector<HTMLElement>(".vcard");

    const move = (e: Event) => {
      const p = e as PointerEvent,
        r = cv.getBoundingClientRect();

      const x = (p.clientX - r.left) / r.width - 0.5,
        y = (p.clientY - r.top) / r.height - 0.5;

      layers.forEach((l) => {
        const k = +(l.dataset.p || 0);

        l.style.transform = `translate(${(x * k).toFixed(1)}px,${(
          y * k
        ).toFixed(1)}px)`;
      });

      vc?.style.setProperty("--px", (x * 12).toFixed(1) + "px");
      vc?.style.setProperty("--py", (y * 9).toFixed(1) + "px");
    };

    const leave = () => {
      layers.forEach((l) => (l.style.transform = ""));
      vc?.style.setProperty("--px", "0px");
      vc?.style.setProperty("--py", "0px");
    };

    hero.addEventListener("pointermove", move);
    hero.addEventListener("pointerleave", leave);

    return () => {
      hero.removeEventListener("pointermove", move);
      hero.removeEventListener("pointerleave", leave);
    };
  }, []);

  const comet = ([l, t, d, dl, s]: number[], i: number) => (
    <span
      key={i}
      className="comet"
      style={v({
        left: l + "%",
        top: t + "%",
        "--t": d + "s",
        "--d": dl + "s",
        "--s": s,
      })}
    />
  );

  return (
    <div ref={root} className="canvas">
      <div className="comets" aria-hidden="true">
        <div className="cl" data-p="12">
          {C.twinkles.map(([l, t, d, s], i) => (
            <span
              key={i}
              className="tw"
              style={v({
                left: l + "%",
                top: t + "%",
                "--d": d + "s",
                "--t": s + "s",
              })}
            />
          ))}
        </div>

        <div className="cl" data-p="26">
          {C.cometsA.map(comet)}
        </div>

        <div className="cl" data-p="46">
          {C.cometsB.map(comet)}
        </div>
      </div>

      <svg aria-hidden="true">
        {C.lines.map(([a, b, c, d], i) => (
          <line
            key={i}
            x1={a + "%"}
            y1={b + "%"}
            x2={c + "%"}
            y2={d + "%"}
          />
        ))}
      </svg>

      {C.nodes.map(([x, y, s, , lx, ly], i) => (
        <Fragment key={i}>
          <span
            className="node"
            style={{
              left: x + "%",
              top: y + "%",
              width: s as number,
              height: s as number,
            }}
          />

          <span
            className="nlabel"
            style={{
              left: lx + "%",
              top: ly + "%",
            }}
          >
            {nodes[i] ?? ""}
          </span>
        </Fragment>
      ))}

      {C.dim.map(([x, y, s], i) => (
        <span
          key={i}
          className="node dim"
          style={{
            left: x + "%",
            top: y + "%",
            width: s,
            height: s,
          }}
        />
      ))}

      {C.sparks.map(([x, y, d], i) => (
        <span
          key={i}
          className="spark"
          style={{
            left: x + "%",
            top: y + "%",
            animationDelay: d ? d + "s" : undefined,
          }}
        />
      ))}

      <div className="vcard">
        {mediaType === "video" && mediaUrl ? (
          <video
            src={mediaUrl}
            controls
            playsInline
            className="size-full rounded-[18px] object-cover"
          />
        ) : mediaType === "image" && mediaUrl ? (
          <Image
            src={mediaUrl}
            alt={label}
            fill
            sizes="(max-width: 768px) 100vw, 420px"
            className="rounded-[18px] object-cover"
          />
        ) : (
          <button className="play" aria-label={label}>
            <i />
          </button>
        )}

        {!(mediaType === "video" && mediaUrl) && (
          <div className="vmeta">
            <span>{label}</span>
            <span className="tagline">{duration}</span>
          </div>
        )}
      </div>
    </div>
  );
}