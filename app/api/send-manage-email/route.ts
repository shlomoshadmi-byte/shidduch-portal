import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const N8N_WEBHOOK_URL = process.env.N8N_SEND_MANAGE_EMAIL_WEBHOOK_URL!;

export async function POST(req: Request) {
  try {
    // 🔐 Hard fail if service role key is missing
    if (!SERVICE_ROLE) {
      return new NextResponse(
        "Missing SUPABASE_SERVICE_ROLE_KEY (server env var)",
        { status: 500 }
      );
    }

    const { manage_token } = await req.json();
    if (!manage_token) {
      return new NextResponse("Missing manage_token", { status: 400 });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: row, error } = await supabaseAdmin
      .from("intake_forms")
      .select(
        `id, "First Name", "Surname", "Email", manage_token, delete_token, deleted_at`
      )
      .eq("manage_token", manage_token)
      .single();

    if (error) return new NextResponse(error.message, { status: 400 });
    if (row.deleted_at) return new NextResponse("Submission deleted", { status: 410 });

    if (!row.manage_token || !row.delete_token) {
      return new NextResponse(
        "Row missing manage_token or delete_token",
        { status: 500 }
      );
    }

    const base = "https://www.shidduch-gmach.org";

    await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: row.id,
        email: row.Email,
        firstName: row["First Name"],
        surname: row.Surname,
        manageUrl: `${base}/manage/${encodeURIComponent(row.manage_token)}`,
        deleteUrl: `${base}/delete/${encodeURIComponent(row.delete_token)}`,
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return new NextResponse(e?.message ?? "Bad request", { status: 400 });
  }
}
