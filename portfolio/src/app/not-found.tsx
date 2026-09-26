import Link from "next/link";

export default function RootNotFound() {
  return (
    <html lang="en">
      <body
        style={{
          background: "#100E0B",
          color: "#F5F1E8",
          fontFamily: "sans-serif",
          display: "grid",
          placeItems: "center",
          minHeight: "100dvh",
          gap: 12,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1>404 — Page not found</h1>
          <Link href="/" style={{ color: "#FFA326" }}>
            Go home
          </Link>
        </div>
      </body>
    </html>
  );
}
