import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: Request) {
  try {
    const { manage_token } = await req.json();
    if (!manage_token) return new NextResponse("Missing manage_token", { status: 400 });

    if (!SERVICE_ROLE) return new NextResponse("Missing SUPABASE_SERVICE_ROLE_KEY", { status: 500 });

    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data, error } = await supabaseAdmin
      .from("intake_forms")
      .select("id, deleted_at")
      .eq("manage_token", manage_token)
      .maybeSingle();

    if (error) return new NextResponse(error.message, { status: 400 });
    if (!data) return new NextResponse("Not found", { status: 404 });
    if (data.deleted_at) return new NextResponse("Submission deleted", { status: 410 });

    return NextResponse.json({ id: data.id });
  } catch (e: any) {
    return new NextResponse(e?.message ?? "Bad request", { status: 400 });
  }
}
