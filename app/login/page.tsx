"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.shidduch-gmach.org";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/me";
  const safeNext = next.startsWith("/") ? next : "/me";

  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>Login</h1>

      <input
        placeholder="you@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: 8, width: 320, border: "1px solid #ccc" }}
      />

      <button
        type="button"
        style={{
          marginLeft: 8,
          padding: "8px 12px",
          border: "1px solid black",
          background: "#fff",
          cursor: "pointer",
        }}
        onClick={async () => {
          setMsg(null);

          const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
              emailRedirectTo: `${BASE_URL}/auth/finish?next=${encodeURIComponent(
                safeNext
              )}`,
            },
          });

          if (error) setMsg(error.message);
          else setMsg("Check your email for a login link.");
        }}
      >
        Send login link
      </button>

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </main>
  );
}
