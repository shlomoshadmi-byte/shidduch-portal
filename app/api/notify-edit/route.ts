import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ USE ENVIRONMENT VARIABLE
    const N8N_URL = process.env.N8N_EDIT_WEBHOOK;

    if (!N8N_URL) {
      console.warn("Missing N8N_EDIT_WEBHOOK env var");
      return NextResponse.json({ ok: true }); 
    }

    await fetch(N8N_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to notify n8n:", error);
    return NextResponse.json({ ok: true });
  }
}