"use client";
import { useEffect } from "react";
export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section className="sec">
      <div className="wrap center" style={{ minHeight: "40vh" }}>
        <span className="eyebrow">Something went wrong</span>
        <h1 className="h1" style={{ margin: "14px 0 8px" }}>
          That didn&apos;t load correctly.
        </h1>
        <p className="lead">
          Please try again — if it keeps happening, reach out through the
          contact page.
        </p>
        <button className="btn" onClick={reset} style={{ marginTop: 10 }}>
          Try again
        </button>
      </div>
    </section>
  );
}
