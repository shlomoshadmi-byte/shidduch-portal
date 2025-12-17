"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function ManageClient({
  manageToken,
}: {
  manageToken: string;
}) {
  console.log("ManageClient received manageToken =", manageToken);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rowId, setRowId] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      if (!manageToken) {
        setError("Missing manage token. Open this page from your email link.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("intake_forms")
        .select("id, deleted_at")
        .eq("manage_token", manageToken)
        .maybeSingle();

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setError("Invalid or expired manage link.");
        setLoading(false);
        return;
      }

      if (data.deleted_at) {
        setError("This submission was deleted.");
        setLoading(false);
        return;
      }

      setRowId(data.id);
      setLoading(false);
    }

    run();
  }, [manageToken]);

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (error)
    return (
      <pre style={{ padding: 16, color: "crimson", whiteSpace: "pre-wrap" }}>
        {error}
      </pre>
    );

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>Manage submission</h1>
      <p>Submission ID:</p>
      <pre>{rowId}</pre>
    </main>
  );
}
