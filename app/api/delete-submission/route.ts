import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    if (!token) return new NextResponse("Unauthorized", { status: 401 });

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { id, reason } = await req.json();
    if (!id) return new NextResponse("Missing id", { status: 400 });
    if (!reason) return new NextResponse("Missing reason", { status: 400 });

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) return new NextResponse("Unauthorized", { status: 401 });

    const { data: row, error: rowErr } = await supabase
      .from("intake_forms")
      .select(`id, user_id, deleted_at`)
      .eq("id", id)
      .single();

    if (rowErr) return new NextResponse(rowErr.message, { status: 400 });
    if (!row.user_id || row.user_id !== user.id) return new NextResponse("Forbidden", { status: 403 });
    if (row.deleted_at) return NextResponse.json({ ok: true, already: true });

    const { error: updErr } = await supabase
      .from("intake_forms")
      .update({ deleted_at: new Date().toISOString(), delete_reason: reason })
      .eq("id", id);

    if (updErr) return new NextResponse(updErr.message, { status: 400 });

    return NextResponse.json({ ok: true });
  } catch {
    return new NextResponse("Bad request", { status: 400 });
  }
}
