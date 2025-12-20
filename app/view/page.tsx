"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

// --- HELPERS ---
const PHOTO_BUCKET = "intake-photos";

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
        textTransform: "uppercase" // ✅ Correct
      }}>
        {title}
      </h3>
      <div style={{ paddingLeft: 8 }}>{children}</div>
    </div>
  );
}

export default function ViewResumePage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [data, setData] = useState<any>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Data
  useEffect(() => {
    if (!id) return;
    async function load() {
      const { data } = await supabase.from("intake_forms").select("*").eq("id", id).single();
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

  // 2. Generate WhatsApp Text
  const copyToWhatsApp = () => {
    if (!data) return;
    const text = `
*Shidduch Profile*
------------------
*Name:* ${data["First Name"]} ${data["Surname"]}
*Age:* ${data["Date of Birth"]}
*Location:* ${data["City"]}, ${data["Country"]}
*Community:* ${data["My Community"]}
*Status:* ${data["My Status"]}

*About:*
${data["About Me"] || "N/A"}

*Looking For:*
${data["About Them"] || "N/A"}

*Reference:*
${data["References"] || "Upon request"}
`.trim();
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard! Paste into WhatsApp.");
  };

  if (loading) return <div style={{ padding: 20 }}>Loading Profile...</div>;
  if (!data) return <div style={{ padding: 20 }}>Profile not found.</div>;

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
        border: "1px solid #cce5ff"
      }}>
        <button 
          onClick={() => window.print()} 
          style={{ cursor: "pointer", padding: "8px 16px", fontWeight: "bold" }}
        >
          🖨️ Print / Save PDF
        </button>
        <button 
          onClick={copyToWhatsApp} 
          style={{ cursor: "pointer", padding: "8px 16px", fontWeight: "bold" }}
        >
          📱 Copy for WhatsApp
        </button>
      </div>

      {/* HEADER */}
      <div style={{ display: "flex", gap: 24, marginBottom: 32, alignItems: "flex-start" }}>
        {/* Photo */}
        <div style={{ 
          width: 150, 
          height: 150, 
          borderRadius: 12, 
          overflow: "hidden", 
          background: "#eee", 
          flexShrink: 0 
        }}>
          {photoUrl ? (
            <img src={photoUrl} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>
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
            <div>🎂 Born: {data["Date of Birth"]}</div>
            <div>🕍 {data["My Community"]}</div>
            <div>💼 {data["My Occupation"]}</div>
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
          </div>
          <div>
            <Detail label="Status" value={data["My Status"]} />
            <Detail label="Languages" value={data["My languages"]} />
            <Detail label="Children" value={data["Children"]} />
          </div>
        </div>
      </Section>

      <Section title="About Me">
        <p style={{ whiteSpace: "pre-wrap", marginTop: 0 }}>{data["About Me"]}</p>
      </Section>

      <Section title="What I am Looking For">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <Detail label="Target Age" value={data["Age Range"] ?? "Any"} />
          <Detail label="Community" value={data["Their Community"]} />
          <Detail label="Occupation" value={data["Their Occupation"]} />
          <Detail label="Status" value={data["Their Status"]} />
        </div>
        <p style={{ whiteSpace: "pre-wrap", marginTop: 0 }}>{data["About Them"]}</p>
      </Section>

      <Section title="References">
        <p style={{ whiteSpace: "pre-wrap", marginTop: 0 }}>{data["References"]}</p>
      </Section>

      <Section title="Contact Info">
        <Detail label="Contact Person" value={data["Contact Name"]} />
        <Detail label="Phone" value={data["Phone"]} />
        <Detail label="Email" value={data["Email"]} />
        <Detail label="Preferred" value={data["Preffered Communication"]} />
      </Section>

      {/* Print-only CSS to hide the buttons */}
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          main { padding: 0; margin: 0; }
        }
      `}</style>

    </div>
  );
}