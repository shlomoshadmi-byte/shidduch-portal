import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/me";

  if (!code) return NextResponse.redirect(`${origin}/`);

  const supabase = createSupabaseServerClient();
  await supabase.auth.exchangeCodeForSession(code);

  return NextResponse.redirect(`${origin}${next}`);
}
