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

  const [sessionReady, setSessionReady] = useState(false);
  const [sessionMissing, setSessionMissing] = useState(false);

  const [loadingPreview, setLoadingPreview] = useState(false);
  const [preview, setPreview] = useState<IntakePreview | null>(null);

  const [message, setMessage] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  // read token from URL
  useEffect(() => {
    const url = new URL(window.location.href);
    const rawToken = url.searchParams.get("token");
    const t = rawToken ? rawToken.replace(/ /g, "+") : null;
    setToken(!t || t === "undefined" ? null : t);
  }, []);

  // check session (must be logged in after /auth/finish)
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (!session) {
        setSessionMissing(true);
        setSessionReady(true);
        return;
      }

      setSessionMissing(false);
      setSessionReady(true);
    })();
  }, []);

  const fullName = useMemo(() => {
    const first = preview?.["First Name"] ?? "";
    const last = preview?.Surname ?? "";
    const name = `${first} ${last}`.trim();
    return name || "your submission";
  }, [preview]);

  // optional preview
  useEffect(() => {
    if (!sessionReady || sessionMissing) return;
    if (!token) return;

    setLoadingPreview(true);
    setPreview(null);

    (async () => {
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
  }, [token, sessionReady, sessionMissing]);

  // ✅ MUST be declared AFTER the useState hooks above
  const handleConfirm = async () => {
    setMessage(null);

    if (!token) {
      setMessage("Missing or invalid token in URL.");
      return;
    }

    if (confirming) return;
    setConfirming(true);

    try {
      // 1) Claim + get manage_token from RPC (Option A)
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

      // 2) Send Email #2 (server route uses service role)
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
      <main style={{ padding: 24, fontFamily: "sans-serif" }}>
        <h1>Confirm submission</h1>
        <p style={{ color: "crimson" }}>Missing or invalid token in URL.</p>
      </main>
    );
  }

  if (!sessionReady) {
    return (
      <main style={{ padding: 24, fontFamily: "sans-serif" }}>
        <h1>Confirm submission</h1>
        <p>Loading…</p>
      </main>
    );
  }

  if (sessionMissing) {
    return (
      <main style={{ padding: 24, fontFamily: "sans-serif" }}>
        <h1>Confirm submission</h1>
        <p>Not logged in yet. Please click the magic link again.</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 680 }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 18 }}>Shidduch Gmach</div>
      </div>

      <h1 style={{ marginBottom: 8 }}>Confirm submission</h1>

      <p style={{ marginTop: 0 }}>
        We received a submission for <b>{loadingPreview ? "…" : fullName}</b>.
        <br />
        Please confirm that you submitted it.
      </p>

      {message ? (
        <div style={{ marginTop: 12, padding: 12, border: "1px solid #ddd", background: "#fafafa" }}>{message}</div>
      ) : null}

      <button
        type="button"
        onClick={handleConfirm}
        disabled={confirming}
        style={{
          marginTop: 16,
          padding: "10px 14px",
          border: "1px solid black",
          background: confirming ? "#eee" : "#fff",
          cursor: confirming ? "default" : "pointer",
        }}
      >
        {confirming ? "Confirming…" : "Confirm submission"}
      </button>

      <p style={{ marginTop: 16, fontSize: 13, color: "#555" }}>
        After confirmation, you will receive another email with a permanent link to manage and update your submission.
      </p>
    </main>
  );
}
