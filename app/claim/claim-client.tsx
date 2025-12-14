"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function ClaimClient() {
  const [message, setMessage] = useState("Working…");
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setMessage("Not logged in yet. Please click the magic link again.");
        return;
      }

      const url = new URL(window.location.href);
      const rawToken = url.searchParams.get("token");
      const token = rawToken ? rawToken.replace(/ /g, "+") : null;

      if (!token || token === "undefined") {
        setMessage("Missing or invalid token in URL.");
        return;
      }

      const { data: claimedId, error } = await supabase.rpc("claim_profile_id", {
        token,
      });

      if (error) {
        const msg = (error.message || "").toLowerCase();
        if (msg.includes("already") || msg.includes("used")) {
          setMessage("This submission was already confirmed ✅");
        } else {
          setMessage(`Claim failed: ${error.message}`);
        }
        return;
      }

      if (!claimedId) {
        setMessage("Claim succeeded but no submission id was returned.");
        return;
      }

      router.replace(`/confirmed?id=${encodeURIComponent(claimedId)}`);
    };

    run();
  }, [router]);

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>Confirm submission</h1>
      <p>{message}</p>
    </main>
  );
}
