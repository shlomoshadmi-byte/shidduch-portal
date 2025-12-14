"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function FinishAuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function run() {
      const hash = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : window.location.hash;

      const params = new URLSearchParams(hash);
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      let next = searchParams.get("next") ?? "/me";
      if (!next.startsWith("/")) next = "/me";

      if (!access_token || !refresh_token) {
        router.replace("/");
        return;
      }

      const { error } = await supabase.auth.setSession({ access_token, refresh_token });
      if (error) {
        console.error(error);
        router.replace("/");
        return;
      }

      // remove tokens from URL bar/history
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search);

      router.replace(next);
    }

    run();
  }, [router, searchParams]);

  return <div style={{ padding: 16 }}>Signing you in…</div>;
}
