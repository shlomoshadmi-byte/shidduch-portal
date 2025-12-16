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

  // This is the message shown in the grey box on the page (not console)
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
      const {
        data: { session },
      } = await supabase.auth.getSession();

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

  // optional preview: try to show the name (but don't show scary errors if RLS blocks it)
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

      // If RLS blocks this select, we still want the page to work.
      if (error) {
        return;
      }

      if (!data) {
        // Could be already used (token nulled) OR select blocked by RLS.
        // Don't show "already used" here — it confuses users.
        return;
      }

      if (data.user_id) {
        setPreview(data as IntakePreview);
        setMessage("This submission was already confirmed ✅ Please check your email for the Manage link.");
        return;
      }

      setPreview(data as IntakePreview);
    })();
  }, [token, sessionReady, sessionMissing]);

  const handleConfirm = async () => {
    setMessage(null);

    if (!token) {
      setMessage("Missing or invalid token in URL.");
      return;
    }

    setConfirming(true);

    // 1) Claim the submission
    const { data: claimedId, error } = await supabase.rpc("claim_profile_id", { token });

    if (error) {
      const msg = (error.message || "").toLowerCase();
      if (msg.includes("already") || msg.includes("used")) {
        setMessage("This submission was already confirmed ✅");
      } else {
        setMessage(`Confirm failed: ${error.message}`);
      }
      setConfirming(false);
      return;
    }

    if (!claimedId) {
      setMessage("Confirmed, but no submission id was returned.");
      setConfirming(false);
      return;
    }

  // 2) Fetch manage_token for this row (now that it's claimed)
const { data: row, error: rowErr } = await supabase
  .from("intake_forms")
  .select(`manage_token`)
  .eq("id", claimedId)
  .single();

if (rowErr || !row?.manage_token) {
  setConfirming(false);
  setMessage("Confirmed ✅ but could not load manage token. Please contact support.");
  return;
}

// 3) Send Email #2 (no auth header; token-based)
try {
  const res = await fetch("/api/send-manage-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ manage_token: row.manage_token }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    setConfirming(false);
    setMessage(`Confirmed ✅ but Email #2 failed (${res.status}): ${txt || "No details"}`);
    return;
  }
} catch {
  setConfirming(false);
  setMessage("Confirmed ✅ but Email #2 failed (network error).");
  return;
}

// Email #2 succeeded → redirect
setConfirming(false);
router.replace(`/confirmed?manage_token=${encodeURIComponent(row.manage_token)}`);


  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    setConfirming(false);
    setMessage(`Confirmed ✅ but Email #2 failed (${res.status}): ${txt || "No details"}`);
    return; // IMPORTANT: don't redirect so you can see the error
  }
} catch {
  setConfirming(false);
  setMessage("Confirmed ✅ but Email #2 failed (network error).");
  return; // IMPORTANT: don't redirect
}

// Email #2 succeeded → now redirect
setConfirming(false);
router.replace(`/confirmed?id=${encodeURIComponent(claimedId)}`);
};

// --- rest of your component stays the same ---

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
