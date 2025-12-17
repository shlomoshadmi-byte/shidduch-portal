"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function ManageClient() {
  const params = useParams();

  // Support multiple possible param keys (in case folder name differs in deployment)
  const manageToken = useMemo(() => {
    const p: any = params || {};
    return (
      p.manage_token ||
      p.token ||
      p["manage-token"] ||
      null
    ) as string | null;
  }, [params]);

  console.log("useParams() =", params);
  console.log("resolved manageToken =", manageToken);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rowId, setRowId] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      setError(null);
      setRowId(null);

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

    setLoading(true);
    run();
  }, [manageToken]);

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;

  if (error) {
    return (
      <pre style={{ padding: 16, color: "crimson", whiteSpace: "pre-wrap" }}>
        {error}
      </pre>
    );
  }

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>Manage submission</h1>
      <p>Submission ID:</p>
      <pre>{rowId}</pre>
    </main>
  );
}
