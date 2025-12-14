import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies as nextCookies } from "next/headers";

export function createSupabaseServerClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return nextCookies().getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            nextCookies().set(name, value, options);
          });
        },
      },
    }
  );
}
