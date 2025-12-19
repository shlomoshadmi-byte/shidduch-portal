"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function ManageClient({ manageToken }: { manageToken: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isDeleted, setIsDeleted] = useState(false);

  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    async function run() {
      setError(null);
      
      const token = (manageToken ?? "").trim();
      if (!token) {
        setError("Missing manage token.");
        return;
      }

      try {
        const res = await fetch("/api/resolve-manage-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ manage_token: token }),
        });

        // 1. Handle API Errors
        if (!res.ok) {
          const text = await res.text();
          setError(text || `Failed to load (${res.status})`);
          return;
        }

        // 2. Parse Response
        const data = await res.json();

        // 3. Check if Deleted
        if (data.deleted) {
          setIsDeleted(true);
          return;
        }

        // 4. Success - Redirect to dashboard
        if (data.id) {
          router.replace(`/me?id=${encodeURIComponent(data.id)}`);
        } else {
          setError("Resolved token but got no id back.");
        }

      } catch (e: any) {
        setError(e?.message ?? "Network error while resolving token.");
      }
    }

    run();
  }, [manageToken, router]);

  // --- VIEW 1: SUBMISSION DELETED ---
  if (isDeleted) {
    return (
      <div style={{ textAlign: "center", width: "100%" }}>
        <h1 style={{ color: "#d93025", fontSize: "24px", marginTop: 0, marginBottom: "16px" }}>
          Submission Deleted
        </h1>
        <p style={{ fontSize: "16px", color: "#555", marginBottom: "24px", lineHeight: "1.5" }}>
          This submission has been deleted. If you would like to rejoin, please submit a new form below.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <a
            href="https://forms.shidduch-gmach.org/english"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              width: "100%",
              padding: "14px",
              background: "#000",
              color: "#fff",
              textDecoration: "none",
              borderRadius: "12px",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            Submit New (English)
          </a>

          <a
            href="https://forms.shidduch-gmach.org/hebrew"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              width: "100%",
              padding: "14px",
              background: "#fff",
              color: "#000",
              textDecoration: "none",
              borderRadius: "12px",
              fontWeight: "bold",
              fontSize: "16px",
              border: "2px solid #000",
            }}
          >
            Submit New (Hebrew)
          </a>
        </div>
      </div>
    );
  }

  // --- VIEW 2: ERROR ---
  if (error) {
    return (
      <div style={{ textAlign: "center", color: "crimson", padding: 20 }}>
        <h2 style={{ fontSize: "18px", marginBottom: 8 }}>Access Error</h2>
        {error}
      </div>
    );
  }

  // --- VIEW 3: LOADING ---
  return (
    <div style={{ textAlign: "center", padding: 20, color: "#666" }}>
      Opening your submission...
    </div>
  );
}