"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export default function LoginClient() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/me";

  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [sending, setSending] = useState(false);

  // Use the current origin so it works on both www + non-www, and any future domain
  const origin = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.origin;
  }, []);

  async function sendLink() {
    setMsg(null);

    const e = email.trim().toLowerCase();
    if (!isValidEmail(e)) {
      setMsg({ type: "err", text: "Please enter a valid email address." });
      return;
    }

    if (!origin) {
     setMsg({ type: "err", text: "Page not ready yet. Please try again in a second." });
     return;
    }


    setSending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: e,
      options: {
        emailRedirectTo: `${origin}/auth/finish?next=${encodeURIComponent(next)}`,
      },
    });
    setSending(false);

    if (error) setMsg({ type: "err", text: error.message });
    else setMsg({ type: "ok", text: "✅ Check your email for a login link." });
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 24,
        background: "#f7f7f7",
        fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 520 }}>
        {/* Brand header */}
        <header style={{ textAlign: "center", marginBottom: 18 }}>
          <img
            src="/binah_logo.png"
            alt="Binah Shidduchim"
            style={{
              height: 92,
              width: "auto",
              display: "block",
              margin: "0 auto 10px",
            }}
          />
          <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.2 }}>Binah Shidduchim</div>
          <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>Secure login</div>
        </header>

        {/* Card */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e6e6e6",
            borderRadius: 16,
            padding: 18,
            boxShadow: "0 6px 24px rgba(0,0,0,0.06)",
          }}
        >
          <label style={{ display: "block" }}>
            <div style={{ fontSize: 12, color: "#444", marginBottom: 8 }}>Email</div>
            <input
              inputMode="email"
              autoComplete="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  sendLink();
                }
              }}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 12,
                border: "1px solid #d0d0d0",
                background: "#fff",
                color: "#111",
                fontSize: 16,
                outline: "none",
              }}
            />
          </label>

          <button
            type="button"
            disabled={sending}
            onClick={sendLink}
            style={{
              marginTop: 12,
              width: "100%",
              padding: 12,
              borderRadius: 12,
              border: "1px solid #000",
              background: sending ? "#f4f4f4" : "#fff",
              color: "#111",
              fontWeight: 800,
              fontSize: 16,
              cursor: sending ? "default" : "pointer",
            }}
          >
            {sending ? "Sending…" : "Send login link"}
          </button>

          {msg ? (
            <div
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 12,
                border: "1px solid",
                borderColor: msg.type === "ok" ? "#b7e3c2" : "#f3b6b6",
                background: msg.type === "ok" ? "#f1fbf3" : "#fff4f4",
                color: "#111",
                fontSize: 14,
              }}
            >
              {msg.text}
              <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
                Tip: if you opened this inside WhatsApp/Gmail, use <b>⋮ → Open in Chrome/Safari</b> for best results.
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
