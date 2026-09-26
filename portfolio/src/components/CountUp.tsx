"use client";
import { useEffect, useRef, useState } from "react";

export function CountUp({ n, suffix }: { n: number; suffix: string }) {
  const ref = useRef<HTMLElement>(null),
    [v, setV] = useState(n);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / 950);
          setV(Math.round(n * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    io.observe(ref.current!);
    return () => io.disconnect();
  }, [n]);
  return (
    <b ref={ref}>
      {v}
      {suffix}
    </b>
  );
}
