"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

// --- HELPERS ---
const PHOTO_BUCKET = "intake-photos";

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
        color: "#d32f2f", // Red for Admin
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

  useEffect(() => {
    if (!id) return;
    async function load() {
      // ✅ ADMIN VIEW: Fetch EVERYTHING
      const { data, error } = await supabase
        .from("intake_forms")
        .select("*")
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
      } else if (error) {
        console.error("Error loading profile:", error);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading Admin View...</div>;
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
      
      {/* ADMIN BANNER */}
      <div className="no-print" style={{ 
        background: "#ffebee", 
        color: "#c62828", 
        padding: "10px", 
        textAlign: "center", 
        fontWeight: "bold", 
        marginBottom: 20, 
        borderRadius: 4,
        border: "1px solid #ffcdd2"
      }}>
        🔒 INTERNAL ADMIN VIEW (Contains Private Info)
      </div>

      <div className="no-print" style={{ marginBottom: 30, display: "flex", gap: 10 }}>
         <button onClick={() => window.print()} style={{ padding: "8px 16px", cursor: "pointer", fontWeight: "bold" }}>🖨️ Print Admin Copy</button>
      </div>

      {/* HEADER */}
      <div style={{ display: "flex", gap: 24, marginBottom: 32, alignItems: "flex-start" }}>
        <div style={{ width: 150, height: 150, borderRadius: 12, overflow: "hidden", background: "#f5f5f5", border: "1px solid #eee", flexShrink: 0 }}>
          {photoUrl ? (
            <img src={photoUrl} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>No Photo</div>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <h1 style={{ margin: "0 0 8px 0", fontSize: 32, color: "#222" }}>
            {data["First Name"]} {data["Surname"]}
          </h1>
          <div style={{ fontSize: 16, color: "#555", lineHeight: 1.6 }}>
            <div>📍 {data["City"]}, {data["Country"]}</div>
            <div>🎂 DOB: {data["Date of Birth"]}</div>
            <div style={{ marginTop: 6, fontWeight: "bold", color: "#d32f2f" }}>{data["My Community"]}</div>
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

      {/* 🚨 SENSITIVE CONTACT INFO (Corrected Column Names) */}
      <Section title="🔒 Contact Info (Admin Only)">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, background: "#fff8e1", padding: 15, borderRadius: 8, border: "1px solid #ffe082" }}>
          <div>
            {/* ✅ Mapped to 'Phone' and 'Email' from schema */}
            <Detail label="Phone" value={data["Phone"]} />
            <Detail label="Email" value={data["Email"]} />
            <Detail label="Contact Person" value={data["Contact Name"]} />
          </div>
          <div>
             <Detail label="Preferred Comms" value={data["Preffered Communication"]} />
          </div>
        </div>
      </Section>

      <Section title="About Me">
        <p dir={detectDir(data["About Me"])} style={{ whiteSpace: "pre-wrap", marginTop: 0, lineHeight: 1.6, textAlign: detectDir(data["About Me"]) === "rtl" ? "right" : "left" }}>
          {data["About Me"]}
        </p>
      </Section>

      {/* Added 'About Them' since it exists in your schema */}
      <Section title="Looking For (About Them)">
        <p dir={detectDir(data["About Them"])} style={{ whiteSpace: "pre-wrap", marginTop: 0, lineHeight: 1.6, textAlign: detectDir(data["About Them"]) === "rtl" ? "right" : "left" }}>
          {data["About Them"]}
        </p>
      </Section>
      
      {/* Reference Phones are inside this text block */}
      <Section title="Full References">
        <p style={{ whiteSpace: "pre-wrap", marginTop: 0 }}>{data["References"]}</p>
      </Section>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}

export default function ViewResumePage() {
  return (
    <Suspense fallback={<div>Loading Admin...</div>}>
      <ResumeContent />
    </Suspense>
  );
}