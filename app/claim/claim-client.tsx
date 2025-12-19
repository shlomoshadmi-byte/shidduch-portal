"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

type IntakePreview = {
  id: string;
  user_id: string | null;
  "First Name": string | null;
  Surname: string | null;
};

export default function ClaimClient() {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [preview, setPreview] = useState<IntakePreview | null>(null);

  const [message, setMessage] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  // 1. Just read the token. No Auth check needed.
  useEffect(() => {
    const url = new URL(window.location.href);
    const rawToken = url.searchParams.get("token");
    const t = rawToken ? rawToken.replace(/ /g, "+") : null;
    setToken(!t || t === "undefined" ? null : t);
  }, []);

  const fullName = useMemo(() => {
    const first = preview?.["First Name"] ?? "";
    const last = preview?.Surname ?? "";
    const name = `${first} ${last}`.trim();
    return name || "your submission";
  }, [preview]);

  // 2. Load preview if token exists (Public)
  useEffect(() => {
    if (!token) return;

    setLoadingPreview(true);
    setPreview(null);

    (async () => {
      // Note: If RLS prevents public reading, this might return null. 
      // That is okay, we just won't show the name.
      const { data, error } = await supabase
        .from("intake_forms")
        .select(`id, user_id, "First Name", "Surname"`)
        .eq("claim_token", token)
        .maybeSingle();

      setLoadingPreview(false);

      if (error || !data) return;

      if (data.user_id) {
        setPreview(data as IntakePreview);
        setMessage("This submission was already confirmed ✅ Please check your email for the Manage link.");
        return;
      }

      setPreview(data as IntakePreview);
    })();
  }, [token]);

  const handleConfirm = async () => {
    setMessage(null);

    if (!token) {
      setMessage("Missing or invalid token in URL.");
      return;
    }

    if (confirming) return;
    setConfirming(true);

    try {
      // 1) Claim publically using the token
      const { data, error } = await supabase.rpc("claim_profile_v2", { token });

      if (error) {
        const msg = (error.message || "").toLowerCase();
        if (msg.includes("already") || msg.includes("used") || msg.includes("invalid")) {
          setMessage("This submission was already confirmed ✅ Please check your email for the Manage link.");
        } else {
          setMessage(`Confirm failed: ${error.message}`);
        }
        setConfirming(false);
        return;
      }

      const claimedId = data?.[0]?.id as string | undefined;
      const manageToken = data?.[0]?.manage_token as string | undefined;

      if (!claimedId || !manageToken) {
        setMessage("Confirmed ✅ but could not load manage token. Please contact support.");
        setConfirming(false);
        return;
      }

      // 2) Send Email #2
      const res = await fetch("/api/send-manage-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manage_token: manageToken }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        setMessage(`Confirmed ✅ but Email #2 failed (${res.status}): ${txt || "No details"}`);
        setConfirming(false);
        return;
      }

      // 3) Success → redirect
      setConfirming(false);
      router.replace(`/confirmed?manage_token=${encodeURIComponent(manageToken)}`);
    } catch {
      setMessage("Confirmed ✅ but Email #2 failed (network error).");
      setConfirming(false);
    }
  };

  if (!token) {
    return (
      <div style={{ padding: 24, fontFamily: "sans-serif", textAlign: "center" }}>
        <h1>Confirm submission</h1>
        <p style={{ color: "crimson" }}>Missing or invalid token in URL.</p>
      </div>
    );
  }

  // ✅ No "Not Logged In" check anymore. Everyone sees this:
  return (
    <div style={{ width: "100%" }}>
      <div style={{ marginBottom: 12, textAlign: "center" }}>
        <div style={{ fontWeight: 700, fontSize: 18 }}>Shidduch Gmach</div>
      </div>

      <h1 style={{ marginBottom: 8, textAlign: "center" }}>Confirm submission</h1>

      <p style={{ marginTop: 0, textAlign: "center" }}>
        We received a submission for <b>{loadingPreview ? "…" : fullName}</b>.
        <br />
        Please confirm that you submitted it.
      </p>

      {message ? (
        <div style={{ marginTop: 12, padding: 12, border: "1px solid #ddd", background: "#fafafa", borderRadius: 8 }}>
          {message}
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleConfirm}
        disabled={confirming}
        style={{
          marginTop: 24,
          width: "100%",
          padding: "12px",
          borderRadius: 8,
          border: "1px solid black",
          background: confirming ? "#eee" : "#000",
          color: confirming ? "#555" : "#fff",
          fontWeight: "bold",
          cursor: confirming ? "default" : "pointer",
        }}
      >
        {confirming ? "Confirming…" : "Confirm submission"}
      </button>

      <p style={{ marginTop: 16, fontSize: 13, color: "#555", textAlign: "center" }}>
        After confirmation, you will receive another email with a permanent link to manage and update your submission.
      </p>
    </div>
  );
}