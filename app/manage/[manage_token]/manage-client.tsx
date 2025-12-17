"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ManageClient({ manageToken }: { manageToken: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      if (!manageToken) {
        setError("Missing manage token. Open this page from your email link.");
        return;
      }

      const res = await fetch("/api/resolve-manage-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manage_token: manageToken }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        setError(txt || `Failed to resolve manage token (${res.status})`);
        return;
      }

      const data = (await res.json()) as { id: string };
      router.replace(`/me?id=${encodeURIComponent(data.id)}`);
    }

    run();
  }, [manageToken, router]);

  if (error) return <pre style={{ padding: 16, color: "crimson", whiteSpace: "pre-wrap" }}>{error}</pre>;
  return <div style={{ padding: 16 }}>Opening your submission…</div>;
}
