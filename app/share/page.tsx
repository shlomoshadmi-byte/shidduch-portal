"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

// --- HELPERS ---
const PHOTO_BUCKET = "intake-photos";

// Detects if text contains Hebrew characters
function detectDir(text: string) {
  if (!text) return "ltr";
  const hasHebrew = /[\u0590-\u05FF]/.test(text);
  return hasHebrew ? "rtl" : "ltr";
}

function Detail({ label, value }: { label: string; value: any }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  const display = Array.isArray(value) ? value.join(", ") : value;
  return (
    <div style={{ marginBottom: 8, lineHeight: 1.5 }}>
      <span style={{ fontWeight: "bold", color: "#444" }}>{label}: </span>
      <span style={{ color: "#000" }}>{display}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24, breakInside: "avoid" }}>
      <h3 style={{ 
        borderBottom: "2px solid #eee", 
        paddingBottom: 6, 
        marginBottom: 12, 
        color: "#0052cc",
        fontSize: 18,
        textTransform: "uppercase" 
      }}>
        {title}
      </h3>
      <div style={{ paddingLeft: 8 }}>{children}</div>
    </div>
  );
}

function ResumeContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [data, setData] = useState<any>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch Data
  useEffect(() => {
    if (!id) return;
    async function load() {
      // 🔒 SECURITY FIX: We ONLY select the fields we want to show.
      // We explicitly DO NOT select "Phone", "Email", or "Last Name" if you want to be super anon.
      const { data, error } = await supabase
        .from("intake_forms")
        .select(`
          "First Name", "Surname", "Date of Birth", 
          "City", "Country", "My Community", "My Occupation", 
          "About Me", "References", "Height", 
          "Father's Name", "Mother's Name", 
          "My Status", "Children", "My languages", 
          "photo_path"
        `) // <--- ONLY THESE COLUMNS
        .eq("id", id)
        .single();

      if (data) {
        setData(data);
        if (data.photo_path) {
          const { data: url } = await supabase.storage
            .from(PHOTO_BUCKET)
            .createSignedUrl(data.photo_path, 60 * 60);
          if (url) setPhotoUrl(url.signedUrl);
        }
      }
      setLoading(false);
    }
    load();
  }, [id]);

  // Generate WhatsApp Text
  const copyToWhatsApp = () => {
    if (!data) return;
    // Note: We use First Name + Surname Initial for privacy
    const text = `
*Shidduch Profile Suggestion*
------------------
*Name:* ${data["First Name"]} ${data["Surname"] ? data["Surname"][0] + "." : ""}
*Age:* ${data["Date of Birth"] || "N/A"}
*Location:* ${data["City"]}, ${data["Country"]}
*Community:* ${data["My Community"]}
*Occupation:* ${data["My Occupation"]}

*About:*
${data["About Me"] || "N/A"}

*Link to Full Profile:*
${window.location.href}
`.trim();
    navigator.clipboard.writeText(text);
    alert("Copied summary to clipboard!");
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading Profile...</div>;
  if (!data) return <div style={{ padding: 40, textAlign: "center" }}>Profile not found.</div>;

  return (
    <div style={{ 
      maxWidth: 800, 
      margin: "0 auto", 
      padding: 40, 
      fontFamily: "Arial, sans-serif",
      color: "#333",
      background: "#fff",
      minHeight: "100vh"
    }}>
      
      {/* 🖨️ CONTROLS (Hidden when printing) */}
      <div className="no-print" style={{ 
        display: "flex", 
        gap: 12, 
        marginBottom: 30, 
        padding: 16, 
        background: "#f0f7ff", 
        borderRadius: 8,
        border: "1px solid #cce5ff",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <span style={{fontWeight: "bold", color: "#0052cc"}}>📄 Public View</span>
        <div style={{display: "flex", gap: 10}}>
            <button 
              onClick={() => window.print()} 
              style={{ cursor: "pointer", padding: "8px 16px", fontWeight: "bold", border: "1px solid #ccc", borderRadius: 4, background: "white" }}
            >
              🖨️ Save as PDF
            </button>
            <button 
              onClick={copyToWhatsApp} 
              style={{ cursor: "pointer", padding: "8px 16px", fontWeight: "bold", border: "none", borderRadius: 4, background: "#25D366", color: "white" }}
            >
              📱 WhatsApp Summary
            </button>
        </div>
      </div>

      {/* HEADER */}
      <div style={{ display: "flex", gap: 24, marginBottom: 32, alignItems: "flex-start" }}>
        {/* Photo */}
        <div style={{ 
          width: 150, 
          height: 150, 
          borderRadius: 12, 
          overflow: "hidden", 
          background: "#f5f5f5", 
          flexShrink: 0,
          border: "1px solid #eee"
        }}>
          {photoUrl ? (
            <img src={photoUrl} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: 12 }}>
              No Photo
            </div>
          )}
        </div>

        {/* Name & Basic Info */}
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: "0 0 8px 0", fontSize: 32, color: "#222" }}>
            {data["First Name"]} {data["Surname"]}
          </h1>
          <div style={{ fontSize: 16, color: "#555", lineHeight: 1.6 }}>
            <div>📍 {data["City"]}, {data["Country"]}</div>
            {/* If you calculate Age in DB, use that. Otherwise use DOB */}
            <div>🎂 Born: {data["Date of Birth"]}</div>
            <div style={{marginTop: 5, fontWeight: "bold", color: "#0052cc"}}>{data["My Community"]}</div>
          </div>
        </div>
      </div>

      {/* SECTIONS */}
      <Section title="Personal Details">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <Detail label="Height" value={data["Height"]} />
            <Detail label="Father" value={data["Father's Name"]} />
            <Detail label="Mother" value={data["Mother's Name"]} />
            <Detail label="Status" value={data["My Status"]} />
          </div>
          <div>
            <Detail label="Occupation" value={data["My Occupation"]} />
            <Detail label="Languages" value={data["My languages"]} />
            <Detail label="Children" value={data["Children"]} />
          </div>
        </div>
      </Section>

      <Section title="About Me">
        <p 
          dir={detectDir(data["About Me"])}
          style={{ 
            whiteSpace: "pre-wrap", 
            marginTop: 0,
            lineHeight: 1.6,
            textAlign: detectDir(data["About Me"]) === "rtl" ? "right" : "left"
          }}
        >
          {data["About Me"]}
        </p>
      </Section>

      <Section title="References">
        <p style={{ whiteSpace: "pre-wrap", marginTop: 0, lineHeight: 1.6 }}>{data["References"]}</p>
      </Section>

      {/* ⚠️ CONTACT INFO REMOVED FOR PUBLIC VIEW */}

      <style jsx global>{`
        @media print {
          @page { margin: 2cm; }
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}

export default function ViewResumePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResumeContent />
    </Suspense>
  );
}