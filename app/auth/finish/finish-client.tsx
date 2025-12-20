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

      // 🔍 THE VIP LIST: Public pages that don't require login
      // If the user is going here, we let them pass even if auth fails.
      const isPublicPage = (path: string) => {
        return (
          path.startsWith("/claim") || 
          path.startsWith("/manage") || 
          path.startsWith("/verify") || 
          path.startsWith("/portal")
        );
      };

      // 1) Preferred: PKCE code flow (?code=...)
      const code = searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error("exchangeCodeForSession error:", error);
          
          // ✅ FIX: If auth fails, check if they are going to a public page
          if (isPublicPage(next)) {
            router.replace(next);
            return;
          }

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
            
            // ✅ FIX: Allow public pages even if session set fails
            if (isPublicPage(next)) {
               router.replace(next);
               return;
            }

            router.replace(`/login?next=${encodeURIComponent(next)}`);
            return;
          }

          router.replace(next);
          return;
        }
      }

      // 3) FINAL FALLBACK (This saves the expired links!)
      // If there was no code/hash (or Supabase returned an error),
      // normally we force login. But now, we check the destination first.
      if (isPublicPage(next)) {
        router.replace(next);
        return;
      }

      // Nothing usable in URL + Private destination → send to login
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }

    run();
  }, [router, searchParams]);

  return (
    <div style={{ 
      padding: 32, 
      fontFamily: 'sans-serif', 
      textAlign: 'center', 
      color: '#666' 
    }}>
      Completing secure access...
    </div>
  );
}