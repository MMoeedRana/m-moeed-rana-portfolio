import Link from "next/link";
export default function NotFound() {
  return (
    <section className="sec">
      <div className="wrap center" style={{ minHeight: "40vh" }}>
        <span className="eyebrow">404</span>
        <h1 className="h1" style={{ margin: "14px 0 8px" }}>
          This page wandered off.
        </h1>
        <p className="lead">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <div
          style={{
            display: "flex",
            gap: 14,
            flexWrap: "wrap",
            justifyContent: "center",
            marginTop: 10,
          }}
        >
          <Link className="btn" href="/">
            Back to home →
          </Link>
          <Link className="btn btn-ghost" href="/contact">
            Contact →
          </Link>
        </div>
      </div>
    </section>
  );
}
