"use client";

import React, { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

const PHOTO_BUCKET = "intake-photos";

function detectDir(text: string) {
  if (!text) return "ltr";
  const hasHebrew = /[\u0590-\u05FF]/.test(text);
  return hasHebrew ? "rtl" : "ltr";
}

function formatDate(value: any) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toISOString().slice(0, 10);
}

function calcAge(dob: any) {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
}

function isEmptyValue(value: any) {
  if (value === null || value === undefined) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

function Detail({ label, value }: { label: string; value: any }) {
  if (isEmptyValue(value)) return null;
  const display = Array.isArray(value) ? value.join(", ") : value;
  return (
    <div style={{ marginBottom: 8, lineHeight: 1.5 }}>
      <span style={{ fontWeight: 700, color: "#444" }}>{label}: </span>
      <span style={{ color: "#111" }}>{display}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24, breakInside: "avoid" }}>
      <h3
        style={{
          borderBottom: "2px solid #eee",
          paddingBottom: 6,
          marginBottom: 12,
          color: "#c62828",
          fontSize: 16,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {title}
      </h3>
      <div style={{ paddingLeft: 8 }}>{children}</div>
    </div>
  );
}

function TwoCol({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}

function Pill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "danger" | "warn";
}) {
  const styles: Record<string, React.CSSProperties> = {
    neutral: { background: "#f5f5f5", color: "#333", border: "1px solid #eee" },
    warn: { background: "#fff8e1", color: "#7a5a00", border: "1px solid #ffe082" },
    danger: { background: "#ffebee", color: "#b71c1c", border: "1px solid #ffcdd2" },
  };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 800,
        ...styles[tone],
      }}
    >
      {children}
    </span>
  );
}

function LinkRow({ label, href }: { label: string; href?: string | null }) {
  if (!href) return null;
  return (
    <div style={{ marginBottom: 8, lineHeight: 1.5 }}>
      <span style={{ fontWeight: 700, color: "#444" }}>{label}: </span>
      <a href={href} target="_blank" rel="noreferrer" style={{ color: "#1565c0", textDecoration: "underline" }}>
        {href}
      </a>
    </div>
  );
}

function ResumeContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [data, setData] = useState<any>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setErrMsg("Missing id in URL (expected ?id=...)");
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setErrMsg(null);

      const { data, error } = await supabase.from("intake_forms").select("*").eq("id", id).single();

      if (cancelled) return;

      if (error) {
        console.error("Error loading profile:", error);
        setErrMsg(error.message ?? "Failed to load profile.");
        setData(null);
        setLoading(false);
        return;
      }

      setData(data);

      const p = (data as any)?.photo_path;
      if (p) {
        const { data: urlData, error: urlErr } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrl(p, 60 * 60);
        if (!cancelled) {
          if (urlErr) {
            console.warn("Failed to sign photo url:", urlErr);
            setPhotoUrl(null);
          } else {
            setPhotoUrl(urlData?.signedUrl ?? null);
          }
        }
      } else {
        setPhotoUrl(null);
      }

      if (!cancelled) setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // ✅ IMPORTANT: keep hooks ABOVE all early returns
  const dob = useMemo(() => (data ? data["Date of Birth"] : null), [data]);
  const age = useMemo(() => calcAge(dob), [dob]);
  const dobDisplay = useMemo(() => formatDate(dob), [dob]);

  const hiddenKeyPrefixes = ["emb_"];
  const hiddenKeysExact = useMemo(
    () =>
      new Set<string>([
        "claim_token",
        "manage_token",
        "delete_token",
        "user_id",
        "deleted_at",
        "delete_reason",
        "gender_norm",
        "my_status_norm",
        "their_status_norm",
      ]),
    []
  );

  const rawEntries = useMemo(() => {
    const obj = (data ?? {}) as Record<string, any>;
    return Object.entries(obj)
      .filter(([_, v]) => !isEmptyValue(v))
      .filter(([k]) => !hiddenKeysExact.has(k))
      .filter(([k]) => !hiddenKeyPrefixes.some((p) => k.startsWith(p)))
      .sort(([a], [b]) => a.localeCompare(b));
  }, [data, hiddenKeysExact]);

  // Now early returns are safe
  if (loading) {
    return <div style={{ padding: 40, textAlign: "center", fontFamily: "Arial, sans-serif" }}>Loading Admin View...</div>;
  }
  if (errMsg) {
    return (
      <div style={{ padding: 40, textAlign: "center", fontFamily: "Arial, sans-serif" }}>
        <div style={{ marginBottom: 12, fontWeight: 800 }}>Could not load profile</div>
        <div style={{ color: "#b71c1c" }}>{errMsg}</div>
      </div>
    );
  }
  if (!data) {
    return <div style={{ padding: 40, textAlign: "center", fontFamily: "Arial, sans-serif" }}>Profile not found.</div>;
  }

  const firstName = data["First Name"];
  const surname = data["Surname"];
  const city = data["City"];
  const country = data["Country"];
  const aboutMe = data["About Me"];
  const aboutThem = data["About Them"];
  const refs = data["References"];
  const whatsappSent = Boolean(data.whatsapp_sent);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 40, fontFamily: "Arial, sans-serif", color: "#333", background: "#fff", minHeight: "100vh" }}>
      <div className="no-print" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#ffebee", color: "#c62828", padding: "10px 12px", fontWeight: 900, marginBottom: 18, borderRadius: 8, border: "1px solid #ffcdd2" }}>
        <div>🔒 INTERNAL ADMIN VIEW (Contains Private Info)</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {whatsappSent ? <Pill>WhatsApp Sent</Pill> : <Pill tone="warn">WhatsApp Not Sent</Pill>}
          <Pill tone="danger">ADMIN</Pill>
        </div>
      </div>

      <div className="no-print" style={{ marginBottom: 22, display: "flex", gap: 10 }}>
        <button onClick={() => window.print()} style={{ padding: "8px 14px", cursor: "pointer", fontWeight: 900, border: "1px solid #ddd", borderRadius: 8, background: "#fff" }}>
          🖨️ Print Admin Copy
        </button>
      </div>

      <div style={{ display: "flex", gap: 24, marginBottom: 26, alignItems: "flex-start" }}>
        <div style={{ width: 160, height: 160, borderRadius: 14, overflow: "hidden", background: "#f5f5f5", border: "1px solid #eee", flexShrink: 0 }}>
          {photoUrl ? (
            <img src={photoUrl} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontWeight: 800 }}>
              No Photo
            </div>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <h1 style={{ margin: "0 0 8px 0", fontSize: 30, color: "#222" }}>
            {firstName} {surname}
          </h1>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
            <Pill>{data["Gender"] ?? "—"}</Pill>
            {age !== null ? <Pill>Age {age}</Pill> : <Pill tone="warn">Age unknown</Pill>}
            {data["My Status"] ? <Pill>{data["My Status"]}</Pill> : null}
            {data["My Community"] ? <Pill>{data["My Community"]}</Pill> : null}
          </div>

          <div style={{ fontSize: 15, color: "#555", lineHeight: 1.7 }}>
            <div>
              📍 {city}
              {city && country ? ", " : ""}
              {country}
            </div>
            <div>
              🎂 DOB: {dobDisplay ?? "—"}
              {age !== null ? <span style={{ marginLeft: 8, fontWeight: 900, color: "#c62828" }}>• {age} years old</span> : null}
            </div>
            <div>🗣️ Languages: {data["My languages"] ?? "—"}</div>
            <div>💼 Occupation: {data["My Occupation"] ?? "—"}</div>
          </div>
        </div>
      </div>

      <Section title="Admin Links">
        <TwoCol
          left={
            <>
              <LinkRow label="Admin Resume Link" href={data.admin_resume_link} />
              <LinkRow label="Admin Edit Link" href={data.admin_edit_link} />
            </>
          }
          right={
            <>
              <Detail label="Created At" value={formatDate(data.created_at)} />
              <Detail label="Updated At" value={formatDate(data.updated_at)} />
            </>
          }
        />
      </Section>

      <Section title="Personal & Family">
        <TwoCol
          left={
            <>
              <Detail label="Gender" value={data["Gender"]} />
              <Detail label="Height" value={data["Height"]} />
              <Detail label="My Status" value={data["My Status"]} />
              <Detail label="Children" value={data["Children"]} />
            </>
          }
          right={
            <>
              <Detail label="Father's Name" value={data["Father's Name"]} />
              <Detail label="Mother's Name" value={data["Mother's Name"]} />
              <Detail label="My Community" value={data["My Community"]} />
            </>
          }
        />
      </Section>

      <Section title="Work & Languages">
        <TwoCol
          left={
            <>
              <Detail label="My Occupation" value={data["My Occupation"]} />
              <Detail label="My languages" value={data["My languages"]} />
            </>
          }
          right={
            <>
              <Detail label="Their Occupation (Preference)" value={data["Their Occupation"]} />
              <Detail label="Their Languages (Preference)" value={data["Their Languages"]} />
            </>
          }
        />
      </Section>

      <Section title="Relationship Preferences">
        <TwoCol
          left={
            <>
              <Detail label="My Status" value={data["My Status"]} />
              <Detail label="My Community" value={data["My Community"]} />
            </>
          }
          right={
            <>
              <Detail label="Their Status" value={data["Their Status"]} />
              <Detail label="Their Community" value={data["Their Community"]} />
              <Detail label="Their Country (Preference)" value={data.their_country} />
            </>
          }
        />
      </Section>

      <Section title="🔒 Contact Info (Admin Only)">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, background: "#fff8e1", padding: 15, borderRadius: 10, border: "1px solid #ffe082" }}>
          <div>
            <Detail label="Phone" value={data["Phone"]} />
            <Detail label="Email" value={data["Email"]} />
            <Detail label="Contact Name" value={data["Contact Name"]} />
          </div>
          <div>
            <Detail label="Preferred Communication" value={data["Preffered Communication"]} />
          </div>
        </div>
      </Section>

      <Section title="Photo Info">
        <TwoCol
          left={<Detail label="Photo Path" value={data.photo_path} />}
          right={<LinkRow label="Photo Source URL" href={data.photo_source_url} />}
        />
      </Section>

      <Section title="About Me">
        <p dir={detectDir(aboutMe)} style={{ whiteSpace: "pre-wrap", marginTop: 0, lineHeight: 1.7, textAlign: detectDir(aboutMe) === "rtl" ? "right" : "left" }}>
          {aboutMe}
        </p>
      </Section>

      <Section title="Looking For (About Them)">
        <p dir={detectDir(aboutThem)} style={{ whiteSpace: "pre-wrap", marginTop: 0, lineHeight: 1.7, textAlign: detectDir(aboutThem) === "rtl" ? "right" : "left" }}>
          {aboutThem}
        </p>
      </Section>

      <Section title="Full References">
        <p style={{ whiteSpace: "pre-wrap", marginTop: 0, lineHeight: 1.7 }}>{refs}</p>
      </Section>

      <Section title="AI Age Fields (Debug)">
        <TwoCol
          left={
            <>
              <Detail label="AI Claimed Age" value={data.ai_claimed_age} />
              <Detail label="AI Claimed Age Confidence" value={data.ai_claimed_age_confidence} />
              <Detail label="AI Claimed Age Source" value={data.ai_claimed_age_source} />
            </>
          }
          right={
            <>
              <Detail label="AI Pref Min Age" value={data.ai_pref_min_age} />
              <Detail label="AI Pref Max Age" value={data.ai_pref_max_age} />
              <Detail label="AI Pref Age Confidence" value={data.ai_pref_age_confidence} />
              <Detail label="AI Pref Age Source" value={data.ai_pref_age_source} />
              <Detail label="AI Age Updated At" value={formatDate(data.ai_age_updated_at)} />
            </>
          }
        />
      </Section>

      <Section title="Raw Profile Data (Admin)">
        <div style={{ fontSize: 13, background: "#fafafa", border: "1px solid #eee", borderRadius: 10, padding: 12 }}>
          {rawEntries.map(([k, v]) => (
            <Detail key={k} label={k} value={v} />
          ))}
        </div>
      </Section>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function ViewResumePage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center" }}>Loading Admin...</div>}>
      <ResumeContent />
    </Suspense>
  );
}
