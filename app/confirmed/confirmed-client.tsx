"use client";

import { useSearchParams } from "next/navigation";

export default function ConfirmedClient() {
  const searchParams = useSearchParams();
  const manageToken = searchParams.get("manage_token");

  if (!manageToken) {
    return (
      <main style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 700 }}>
        <h1>✅ Submission confirmed</h1>
        <p>
          Your submission was confirmed successfully.
          <br />
          Please check your email for the permanent link to manage and edit your submission.
        </p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 700 }}>
      <h1>✅ Submission confirmed</h1>

      <p>Your submission is confirmed.</p>

      <a
        href={`/manage/${encodeURIComponent(manageToken)}`}
        style={{
          display: "inline-block",
          marginTop: 16,
          padding: "10px 16px",
          border: "1px solid black",
          textDecoration: "none",
          background: "white",
          fontWeight: 600,
        }}
      >
        Manage / edit my submission
      </a>

      <p style={{ marginTop: 16, fontSize: 13, color: "#555" }}>
        We also sent this link to your email. You can bookmark it and open it on any device.
      </p>
    </main>
  );
}
