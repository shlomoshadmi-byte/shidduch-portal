import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const N8N_WEBHOOK_URL = process.env.N8N_SEND_MANAGE_EMAIL_WEBHOOK_URL!;

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const accessToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!accessToken) return new NextResponse("Missing auth token", { status: 401 });

    const { id } = await req.json();
    if (!id) return new NextResponse("Missing id", { status: 400 });

    // Supabase client acting as the logged-in user (RLS applies)
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });

    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userRes.user) return new NextResponse("Unauthorized", { status: 401 });

    const user = userRes.user;

    const { data: row, error } = await supabase
      .from("intake_forms")
      .select(`id, "First Name", "Surname", "Email", user_id`)
      .eq("id", id)
      .single();

    if (error) return new NextResponse(error.message, { status: 400 });

    // only allow sending for your own confirmed row
    if (!row.user_id || row.user_id !== user.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: row.id,
        email: row.Email,
        firstName: row["First Name"],
        surname: row.Surname,
        manageUrl: `https://www.shidduch-gmach.org/me?id=${row.id}`,
      }),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return new NextResponse("Bad request", { status: 400 });
  }
}
