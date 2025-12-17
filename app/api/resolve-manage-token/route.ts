import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: Request) {
  try {
    const { manage_token } = await req.json();

    if (!manage_token) {
      return new NextResponse("Missing manage token", { status: 400 });
    }

    // Use Service Role to bypass RLS so we can check if it exists
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: row, error } = await supabaseAdmin
      .from("intake_forms")
      .select("id, deleted_at")
      .eq("manage_token", manage_token)
      .maybeSingle();

    if (error) {
      return new NextResponse(error.message, { status: 400 });
    }

    // 1. Token doesn't exist at all -> 404 Error
    if (!row) {
      return new NextResponse("Invalid or expired manage link.", { status: 404 });
    }

    // 2. Token exists, but row is DELETED -> Send "deleted" flag
    if (row.deleted_at) {
      return NextResponse.json({ deleted: true });
    }

    // 3. Valid and active -> Send ID
    return NextResponse.json({ id: row.id });

  } catch (e: any) {
    return new NextResponse(e?.message || "Server Error", { status: 500 });
  }
}