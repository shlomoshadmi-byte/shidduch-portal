"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteClient({ deleteToken }: { deleteToken: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  async function doDelete() {
    setError(null);

    if (!deleteToken) {
      setError("Missing delete token. Open this page from your email link.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/delete-by-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delete_token: deleteToken, reason }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        setError(txt || `Delete failed (${res.status})`);
        setBusy(false);
        return;
      }

      setDone(true);
    } catch {
      setError("Delete failed (network error).");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <main style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 700 }}>
        <h1>✅ Submission deleted</h1>
        <p>Your submission was deleted successfully.</p>

        <button
          type="button"
          onClick={() => router.replace("/")}
          style={{
            marginTop: 16,
            padding: "10px 14px",
            border: "1px solid black",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          Go to homepage
        </button>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 700 }}>
      <h1>Delete submission</h1>
      <p style={{ marginTop: 6 }}>
        This will permanently disable editing for this submission.
      </p>

      {error ? (
        <pre style={{ padding: 12, color: "crimson", whiteSpace: "pre-wrap", border: "1px solid #eee" }}>
          {error}
        </pre>
      ) : null}

      <label style={{ display: "block", marginTop: 16 }}>
        <div style={{ fontSize: 12, marginBottom: 6, color: "#222" }}>
          Optional reason
        </div>
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. submitted by mistake"
          style={{
            width: "100%",
            padding: 10,
            border: "1px solid #d8d8d8",
            borderRadius: 10,
            outline: "none",
          }}
        />
      </label>

      <button
        type="button"
        onClick={doDelete}
        disabled={busy}
        style={{
          marginTop: 16,
          padding: "10px 14px",
          border: "1px solid black",
          background: busy ? "#eee" : "#fff",
          cursor: busy ? "default" : "pointer",
          fontWeight: 700,
        }}
      >
        {busy ? "Deleting…" : "Delete my submission"}
      </button>
    </main>
  );
}
