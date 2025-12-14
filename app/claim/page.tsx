"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function ClaimPage() {
  const [message, setMessage] = useState("Working…");

  useEffect(() => {
    const run = async () => {
      // Ensure session from magic link is available
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setMessage("Not logged in yet. Please click the magic link again.");
        return;
      }

      // Read token from query string
      const url = new URL(window.location.href);
      const rawToken = url.searchParams.get("token");

      // Guard against malformed token
      const token = rawToken ? rawToken.replace(/ /g, "+") : null;

      if (!token || token === "undefined") {
        setMessage("Missing or invalid token in URL.");
        return;
      }

      // Claim the profile AND get the row id
      const { data: claimedId, error } = await supabase.rpc(
        "claim_profile_id",
        { token }
      );

      if (error) {
        setMessage(`Claim failed: ${error.message}`);
        return;
      }

      if (!claimedId) {
        setMessage("Claim succeeded but no submission id was returned.");
        return;
      }

      // Redirect to manage THIS submission
      window.location.href = `/confirmed?id=${encodeURIComponent(claimedId)}`;

    };

    run();
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>Confirm submission</h1>
      <p>{message}</p>
    </main>
  );
}
