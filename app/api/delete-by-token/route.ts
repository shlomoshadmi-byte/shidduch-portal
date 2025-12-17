import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: Request) {
  try {
    const { delete_token, reason } = await req.json();

    if (!delete_token) return new NextResponse("Missing delete_token", { status: 400 });
    if (!SERVICE_ROLE) return new NextResponse("Missing SUPABASE_SERVICE_ROLE_KEY", { status: 500 });

    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // 1. Find row by token & GET CONTACT INFO for the email alert
    const { data: row, error: findErr } = await supabaseAdmin
      .from("intake_forms")
      .select('id, deleted_at, "First Name", Surname, Email') // ✅ Added name/email fields
      .eq("delete_token", delete_token)
      .maybeSingle();

    if (findErr) return new NextResponse(findErr.message, { status: 400 });
    if (!row) return new NextResponse("Not found", { status: 404 });
    if (row.deleted_at) return NextResponse.json({ ok: true }); // already deleted

    const now = new Date().toISOString();
    const finalReason = (typeof reason === "string" && reason.trim()) ? reason.trim() : "No reason provided";

    // 2. Perform the Soft Delete
    const { error: updErr } = await supabaseAdmin
      .from("intake_forms")
      .update({
        deleted_at: now,
        delete_reason: finalReason,
      })
      .eq("id", row.id);

    if (updErr) return new NextResponse(updErr.message, { status: 400 });

    // ✅✅✅ START: ADMIN ALERT (Fire and Forget) ✅✅✅
    fetch("https://lightrun.app.n8n.cloud/webhook/profile-deleted", { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "DELETE",
        name: `${row["First Name"]} ${row.Surname}`,
        email: row.Email,
        reason: finalReason
      }),
    }).catch(err => console.error("Failed to notify admin of delete", err));
    // ✅✅✅ END: ADMIN ALERT ✅✅✅

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return new NextResponse(e?.message ?? "Bad request", { status: 400 });
  }
}