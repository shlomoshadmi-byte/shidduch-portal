"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function ManageClient({ manageToken }: { manageToken: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  // Prevent double-run (React Strict Mode in dev can run effects twice)
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    async function run() {
      setError(null);

      console.log("ManageClient received manageToken =", manageToken);

      const token = (manageToken ?? "").trim();
      if (!token) {
        setError("Missing manage token. Open this page from your email link.");
        return;
      }

      try {
        const res = await fetch("/api/resolve-manage-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ manage_token: token }),
        });

        const text = await res.text();

        if (!res.ok) {
          setError(text || `Failed to resolve manage token (${res.status})`);
          return;
        }

        const data = JSON.parse(text) as { id: string };
        if (!data?.id) {
          setError("Resolved token but got no id back.");
          return;
        }

        router.replace(`/me?id=${encodeURIComponent(data.id)}`);
      } catch (e: any) {
        setError(e?.message ?? "Network error while resolving token.");
      }
    }

    run();
  }, [manageToken, router]);

  if (error) {
    return (
      <pre style={{ padding: 16, color: "crimson", whiteSpace: "pre-wrap" }}>
        {error}
      </pre>
    );
  }

  return <div style={{ padding: 16 }}>Opening your submission…</div>;
}
