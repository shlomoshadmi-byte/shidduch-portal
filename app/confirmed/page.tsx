"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function ConfirmedPage() {
  const router = useRouter();
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

      <button
        type="button"
        onClick={() => router.push(`/me?id=${encodeURIComponent(id)}`)}
        style={{
          marginTop: 16,
          padding: "10px 16px",
          border: "1px solid black",
          background: "white",
          cursor: "pointer",
        }}
      >
        Manage / edit my submission
      </button>
    </main>
  );
}
