import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const N8N_WEBHOOK_URL = process.env.N8N_SEND_MANAGE_EMAIL_WEBHOOK_URL!;

export async function POST(req: Request) {
  try {
    // --- env validation ---
    if (!SUPABASE_URL) {
      return new NextResponse("Missing NEXT_PUBLIC_SUPABASE_URL", { status: 500 });
    }
    if (!SERVICE_ROLE_KEY) {
      return new NextResponse("Missing SUPABASE_SERVICE_ROLE_KEY", { status: 500 });
    }
    if (!N8N_WEBHOOK_URL) {
      return new NextResponse("Missing N8N_SEND_MANAGE_EMAIL_WEBHOOK_URL", { status: 500 });
    }

    // --- input validation ---
    const body = await req.json().catch(() => null);
    const manage_token = body?.manage_token;

    if (!manage_token || typeof manage_token !== "string") {
      return new NextResponse("Missing manage_token", { status: 400 });
    }

    // --- server-side supabase admin client ---
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: row, error } = await supabaseAdmin
      .from("intake_forms")
      .select(`id, "First Name", "Surname", "Email", manage_token, delete_token, deleted_at`)
      .eq("manage_token", manage_token)
      .maybeSingle();

    if (error) return new NextResponse(error.message, { status: 400 });
    if (!row) return new NextResponse("Not found", { status: 404 });
    if (row.deleted_at) return new NextResponse("Submission deleted", { status: 410 });

    if (!row.manage_token || !row.delete_token) {
      return new NextResponse("Row missing manage_token or delete_token", { status: 500 });
    }

    const base = "https://www.shidduch-gmach.org";

    // --- call n8n webhook to send email ---
    const n8nRes = await fetch(N8N_WEBHOOK_URL, {
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

    if (!n8nRes.ok) {
      const txt = await n8nRes.text().catch(() => "");
      return new NextResponse(`n8n error (${n8nRes.status}): ${txt || "No details"}`, {
        status: 502,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return new NextResponse(e?.message ?? "Bad request", { status: 400 });
  }
}
