"use client";

import { useSearchParams } from "next/navigation";

export default function ConfirmedClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  if (!id) {
    return (
      <main style={{ padding: 24, fontFamily: "sans-serif" }}>
        <h1>Confirmed</h1>
        <p>Missing submission id.</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 700 }}>
      <h1>✅ Submission confirmed</h1>
      <p>Your submission is now linked to your account.</p>

      <a
        href={`/me?id=${encodeURIComponent(id)}`}
        style={{
          display: "inline-block",
          marginTop: 16,
          padding: "10px 16px",
          border: "1px solid black",
          textDecoration: "none",
          background: "white",
        }}
      >
        Manage / edit my submission
      </a>
    </main>
  );
}
