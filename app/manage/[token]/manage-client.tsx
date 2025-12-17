"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function ManageClient() {
  const params = useParams<{ token: string }>();
  const token = params?.token;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rowId, setRowId] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      setError(null);
      setLoading(true);

      if (!token || typeof token !== "string") {
        setError("Missing manage token. Open this page from your email link.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("intake_forms")
        .select("id, deleted_at")
        .eq("manage_token", token)
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
  }, [token]);

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (error) return <pre style={{ padding: 16, color: "crimson", whiteSpace: "pre-wrap" }}>{error}</pre>;

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>Manage</h1>
      <p>✅ Loaded submission id: {rowId}</p>
      <p>Token: {token}</p>
    </main>
  );
}
