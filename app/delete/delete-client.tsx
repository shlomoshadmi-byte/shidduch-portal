"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function DeleteClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      setMessage(null);

      if (!id) {
        setMessage("Missing submission id.");
        setLoading(false);
        return;
      }

      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        window.location.href = `/login?next=${encodeURIComponent(`/delete?id=${id}`)}`;
        return;
      }

      // optional: verify row exists + is yours (prevents confusion)
      const { data, error } = await supabase
        .from("intake_forms")
        .select(`id, user_id, deleted_at`)
        .eq("id", id)
        .maybeSingle();

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }
      if (!data) {
        setMessage("Submission not found.");
        setLoading(false);
        return;
      }
      if (!data.user_id) {
        setMessage("This submission isn’t confirmed yet.");
        setLoading(false);
        return;
      }
      if (data.user_id !== auth.user.id) {
        setMessage("You don’t have access to this submission.");
        setLoading(false);
        return;
      }
      if (data.deleted_at) {
        setMessage("This submission was already deleted.");
        setLoading(false);
        return;
      }

      setLoading(false);
    })();
  }, [id]);

  const onDelete = async () => {
    setMessage(null);

    if (!id) return;
    if (!reason.trim()) {
      setMessage("Please tell us why you want to delete this submission.");
      return;
    }

    setDeleting(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;

    try {
      const res = await fetch("/api/delete-submission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken ?? ""}`,
        },
        body: JSON.stringify({ id, reason: reason.trim() }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        setMessage(`Delete failed (${res.status}): ${txt || "No details"}`);
        setDeleting(false);
        return;
      }

      setDeleting(false);
      router.replace("/deleted");
    } catch {
      setDeleting(false);
      setMessage("Delete failed (network error).");
    }
  };

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 680 }}>
      <h1>Delete submission</h1>

      {message ? (
        <div style={{ marginTop: 12, padding: 12, border: "1px solid #ddd", background: "#fafafa" }}>{message}</div>
      ) : null}

      {!message?.includes("deleted") ? (
        <>
          <p>
            If you delete your submission, it will no longer be available for matching.
            <br />
            Please tell us why you want to delete it:
          </p>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{ width: "100%", padding: 10, minHeight: 90, border: "1px solid #ccc" }}
            placeholder="Reason for deletion…"
          />

          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            style={{
              marginTop: 16,
              padding: "10px 14px",
              border: "1px solid black",
              background: deleting ? "#eee" : "#fff",
              cursor: deleting ? "default" : "pointer",
            }}
          >
            {deleting ? "Deleting…" : "Delete submission"}
          </button>
        </>
      ) : null}
    </main>
  );
}
