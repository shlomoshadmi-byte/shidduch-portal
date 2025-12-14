"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function FinishClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function run() {
      // hash looks like: #access_token=...&refresh_token=...&...
      const hash = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : window.location.hash;

      const params = new URLSearchParams(hash);
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      const next = searchParams.get("next") ?? "/me";

      if (!access_token || !refresh_token) {
        router.replace("/");
        return;
      }

      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error) {
        console.error(error);
        router.replace("/");
        return;
      }

      router.replace(next);
    }

    run();
  }, [router, searchParams]);

  return <div style={{ padding: 16 }}>Signing you in…</div>;
}
