"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function FinishClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function run() {
      const next = searchParams.get("next") ?? "/me";

      // 1) Preferred: PKCE code flow (?code=...)
      const code = searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error("exchangeCodeForSession error:", error);
          router.replace(`/login?next=${encodeURIComponent(next)}`);
          return;
        }
        router.replace(next);
        return;
      }

      // 2) Fallback: implicit hash flow (#access_token=...&refresh_token=...)
      const hash = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : window.location.hash;

      if (hash) {
        const params = new URLSearchParams(hash);
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (error) {
            console.error("setSession error:", error);
            router.replace(`/login?next=${encodeURIComponent(next)}`);
            return;
          }

          router.replace(next);
          return;
        }
      }

      // Nothing usable in URL → send them to login
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }

    run();
  }, [router, searchParams]);

  return <div style={{ padding: 16 }}>Signing you in…</div>;
}
