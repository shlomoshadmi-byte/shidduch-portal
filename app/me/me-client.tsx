"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

const PHOTO_BUCKET = "intake-photos";
const LOGO_SRC = "/binah_logo.png"; // put this in /public/binah_logo.png

type IntakeForm = {
  id: string;
  created_at: string | null;
  updated_at: string | null;
  user_id: string | null;
  claim_token: string | null;

  deleted_at: string | null;
  delete_reason: string | null;

  // ✅ new column (add in Supabase)
  photo_path?: string | null;

  "First Name": string | null;
  Surname: string | null;
  "Father's Name": string | null;
  "Mother's Name": string | null;
  "Date of Birth": string | null;
  City: string | null;
  Country: string | null;
  Phone: string | null;
  Email: string | null;

  "Preffered Communication": string[] | null;

  "Contact Name": string | null;
  "My languages": string | null;
  Gender: string | null;
  Height: string | null;
  "My Community": string | null;
  "My Status": string | null;
  Children: string | null;
  "My Occupation": string | null;

  "Their Occupation": string | null;
  "Their Community": string | null;
  "Their Languages": string | null;
  "Their Status": string[] | null;

  "About Me": string | null;
  "About Them": string | null;
  References: string | null;
};

function normalizeArr(a: string[]) {
  return a.map((x) => x.trim()).filter(Boolean);
}

function shallowEqualJSON(a: unknown, b: unknown) {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

/** Detect RTL/LTR per value (Hebrew → rtl). */
function detectDir(value: string) {
  // Hebrew block
  const hasHebrew = /[\u0590-\u05FF]/.test(value);
  if (hasHebrew) return "rtl";

  // If you later add Arabic support, you can extend here.
  return "ltr";
}

function Section({
  title,
  children,
  onSaveSection,
  saving,
}: {
  title: string;
  children: React.ReactNode;
  onSaveSection?: () => void;
  saving?: boolean;
}) {
  return (
    <div
      style={{
        border: "1px solid #e6e6e6",
        borderRadius: 12,
        padding: 16,
        background: "#fff",
        marginTop: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 16 }}>{title}</h2>
        {onSaveSection ? (
          <button
            type="button"
            onClick={onSaveSection}
            disabled={!!saving}
            style={{
              padding: "8px 12px",
              border: "1px solid #000",
              background: saving ? "#f4f4f4" : "#fff",
              cursor: saving ? "default" : "pointer",
              borderRadius: 10,
              fontSize: 13,
            }}
          >
            {saving ? "Saving…" : "Save section"}
          </button>
        ) : null}
      </div>
      <div style={{ marginTop: 10 }}>{children}</div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "block", marginTop: 12 }}>
      <div style={{ fontSize: 12, marginBottom: 6, color: "#222" }}>
        {label}
        {hint ? <span style={{ marginLeft: 8, color: "#777" }}>{hint}</span> : null}
      </div>
      {children}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "date";
  placeholder?: string;
}) {
  const dir = detectDir(value);
  return (
    <input
      dir={dir}
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        padding: 10,
        border: "1px solid #d8d8d8",
        borderRadius: 10,
        outline: "none",
        textAlign: dir === "rtl" ? "right" : "left",
      }}
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const dir = detectDir(value);
  return (
    <textarea
      dir={dir}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%",
        padding: 10,
        border: "1px solid #d8d8d8",
        borderRadius: 10,
        outline: "none",
        minHeight: 90,
        resize: "vertical",
        textAlign: dir === "rtl" ? "right" : "left",
      }}
    />
  );
}

function ChipMultiSelect({
  label,
  values,
  onChange,
  suggestions,
  placeholder = "Type and press Enter…",
  hint,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  hint?: string;
}) {
  const [draft, setDraft] = useState("");
  const dir = detectDir(draft);

  function add(v: string) {
    const cleaned = v.trim();
    if (!cleaned) return;
    if (values.includes(cleaned)) return;
    onChange([...values, cleaned]);
    setDraft("");
  }

  function remove(v: string) {
    onChange(values.filter((x) => x !== v));
  }

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 12, marginBottom: 6 }}>
        {label}
        {hint ? <span style={{ marginLeft: 8, color: "#777" }}>{hint}</span> : null}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        {values.length ? (
          values.map((v) => (
            <span
              key={v}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                border: "1px solid #e0e0e0",
                borderRadius: 999,
                padding: "6px 10px",
                background: "#fafafa",
                fontSize: 13,
              }}
            >
              {v}
              <button
                type="button"
                onClick={() => remove(v)}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 14,
                  lineHeight: 1,
                }}
                aria-label={`Remove ${v}`}
              >
                ×
              </button>
            </span>
          ))
        ) : (
          <span style={{ color: "#777", fontSize: 13 }}>None selected</span>
        )}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          dir={dir}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          style={{
            flex: 1,
            padding: 10,
            border: "1px solid #d8d8d8",
            borderRadius: 10,
            outline: "none",
            textAlign: dir === "rtl" ? "right" : "left",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(draft);
            }
          }}
        />
        <button
          type="button"
          onClick={() => add(draft)}
          style={{
            padding: "10px 12px",
            border: "1px solid #000",
            background: "#fff",
            cursor: "pointer",
            borderRadius: 10,
            fontSize: 13,
          }}
        >
          Add
        </button>
      </div>

      {suggestions?.length ? (
        <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              style={{
                padding: "6px 10px",
                border: "1px solid #e0e0e0",
                background: "#fff",
                cursor: "pointer",
                borderRadius: 10,
                fontSize: 12,
              }}
            >
              + {s}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function MeClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState<IntakeForm | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  // Arrays
  const [preferredComm, setPreferredComm] = useState<string[]>([]);
  const [theirStatus, setTheirStatus] = useState<string[]>([]);

  // Photo UI
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);

  // Snapshot for reset/dirty
  const originalRef = useRef<any>(null);

  useEffect(() => {
    async function run() {
      setError(null);
      setBanner(null);

      if (!id) {
        setError("Missing submission id. Open this page from your email link.");
        setLoading(false);
        return;
      }

      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        window.location.href = `/login?next=${encodeURIComponent(`/me?id=${id}`)}`;
        return;
      }

      const { data, error } = await supabase
        .from("intake_forms")
        .select(
          `
            id, created_at, updated_at, user_id, claim_token, deleted_at, delete_reason,
            photo_path,
            "First Name",
            "Surname",
            "Father's Name",
            "Mother's Name",
            "Date of Birth",
            "City",
            "Country",
            "Phone",
            "Email",
            "Preffered Communication",
            "Contact Name",
            "My languages",
            "Gender",
            "Height",
            "My Community",
            "My Status",
            "Children",
            "My Occupation",
            "Their Occupation",
            "Their Community",
            "Their Languages",
            "Their Status",
            "About Me",
            "About Them",
            "References"
          `
        )
        .eq("id", id)
        .maybeSingle();

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setError("This submission isn't available to your account yet. Make sure you confirmed THIS submission first.");
        setLoading(false);
        return;
      }

      if (!data.user_id) {
        setError("This submission has not been confirmed yet. Use the Confirm submission link first.");
        setLoading(false);
        return;
      }

      if (data.deleted_at) {
        setError("This submission was deleted and can no longer be edited.");
        setLoading(false);
        return;
      }

      const r = data as IntakeForm;
      setRow(r);

      const pc = r["Preffered Communication"] ?? [];
      const ts = r["Their Status"] ?? [];
      setPreferredComm(pc);
      setTheirStatus(ts);

      originalRef.current = {
        row: r,
        preferredComm: pc,
        theirStatus: ts,
      };

      setLoading(false);
    }

    run();
  }, [id]);

  // Create/refresh a signed URL for the photo whenever photo_path changes
  useEffect(() => {
    async function refreshPhoto() {
      if (!row?.photo_path) {
        setPhotoUrl(null);
        return;
      }
      const { data, error } = await supabase.storage
        .from(PHOTO_BUCKET)
        .createSignedUrl(row.photo_path, 60 * 60); // 1 hour

      if (error) {
        // Don't block the page for this
        console.warn("Signed URL error:", error.message);
        setPhotoUrl(null);
        return;
      }
      setPhotoUrl(data.signedUrl);
    }
    refreshPhoto();
  }, [row?.photo_path]);

  const dirty = useMemo(() => {
    if (!row || !originalRef.current) return false;
    return !shallowEqualJSON({ row, preferredComm, theirStatus }, originalRef.current);
  }, [row, preferredComm, theirStatus]);

  async function saveAll(partial?: { keys?: string[] }) {
    if (!row) return;

    setError(null);
    setBanner(null);
    setSaving(true);

    const payload: any = {
      "First Name": row["First Name"],
      Surname: row.Surname,
      "Father's Name": row["Father's Name"],
      "Mother's Name": row["Mother's Name"],
      "Date of Birth": row["Date of Birth"],
      City: row.City,
      Country: row.Country,
      Phone: row.Phone,
      Email: row.Email,

      "Preffered Communication": normalizeArr(preferredComm),

      "Contact Name": row["Contact Name"],
      "My languages": row["My languages"],

      Gender: row.Gender,
      Height: row.Height,

      "My Community": row["My Community"],
      "My Status": row["My Status"],
      Children: row.Children,
      "My Occupation": row["My Occupation"],

      "Their Occupation": row["Their Occupation"],
      "Their Community": row["Their Community"],
      "Their Languages": row["Their Languages"],
      "Their Status": normalizeArr(theirStatus),

      "About Me": row["About Me"],
      "About Them": row["About Them"],
      References: row.References,

      // include photo_path if you want it saved along with full save
      photo_path: row.photo_path ?? null,
    };

    const finalPayload =
      partial?.keys?.length
        ? Object.fromEntries(partial.keys.map((k) => [k, payload[k]]))
        : payload;

    const { error } = await supabase.from("intake_forms").update(finalPayload).eq("id", row.id);

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    originalRef.current = {
      row,
      preferredComm,
      theirStatus,
    };

    setBanner("Saved ✅");
    setTimeout(() => setBanner(null), 2500);
  }

  // ✅ Reset confirmation
  function resetChanges() {
    if (!originalRef.current) return;
    if (dirty) {
      const ok = window.confirm("You have unsaved changes. Reset and lose them?");
      if (!ok) return;
    }
    setRow(originalRef.current.row);
    setPreferredComm(originalRef.current.preferredComm);
    setTheirStatus(originalRef.current.theirStatus);
    setBanner("Changes reset");
    setTimeout(() => setBanner(null), 1500);
  }

  // ✅ Upload photo to Supabase Storage and store path in intake_forms.photo_path
  async function handlePhotoUpload(file: File) {
    if (!row) return;
    setError(null);
    setBanner(null);
    setPhotoBusy(true);

    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";

      // replaceable path per submission
      const path = `${row.id}/photo.${safeExt}`;

      const up = await supabase.storage
        .from(PHOTO_BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type });

      if (up.error) throw up.error;

      // save path in DB
      const { error } = await supabase.from("intake_forms").update({ photo_path: path }).eq("id", row.id);
      if (error) throw error;

      // update local row (triggers signed URL refresh)
      setRow({ ...row, photo_path: path });

      // refresh snapshot so "dirty" doesn't stay true just from photo
      originalRef.current = {
        ...originalRef.current,
        row: { ...row, photo_path: path },
      };

      setBanner("Photo updated ✅");
      setTimeout(() => setBanner(null), 2500);
    } catch (e: any) {
      setError(e?.message ?? "Photo upload failed");
    } finally {
      setPhotoBusy(false);
    }
  }

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (error) return <pre style={{ padding: 16, color: "crimson", whiteSpace: "pre-wrap" }}>{error}</pre>;
  if (!row) return <div style={{ padding: 16 }}>Not found.</div>;

  return (
    <div style={{ padding: 16, background: "#f7f7f7", minHeight: "100vh" }}>
      {/* Sticky top bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "rgba(247,247,247,0.95)",
          backdropFilter: "blur(6px)",
          paddingBottom: 10,
          marginBottom: 8,
        }}
      >
        <div
          style={{
            maxWidth: 920,
            margin: "0 auto",
            border: "1px solid #e6e6e6",
            background: "#fff",
            borderRadius: 12,
            padding: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          {/* ✅ Centered logo + title block */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <img
              src={LOGO_SRC}
              alt="Binah Shidduchim"
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                objectFit: "cover",
                border: "1px solid #eee",
              }}
            />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Manage submission</div>
              <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                {dirty ? "Unsaved changes" : "All changes saved"}
                {banner ? <span style={{ marginLeft: 10, color: "#111" }}>• {banner}</span> : null}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              disabled={!dirty || saving}
              onClick={resetChanges}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #ddd",
                background: "#fff",
                cursor: !dirty || saving ? "default" : "pointer",
              }}
            >
              Reset
            </button>

            <button
              type="button"
              disabled={!dirty || saving}
              onClick={() => saveAll()}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #000",
                background: saving ? "#f4f4f4" : "#fff",
                cursor: !dirty || saving ? "default" : "pointer",
                fontWeight: 700,
              }}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <div style={{ fontSize: 12, color: "#777" }}>
          <span>
            <b>ID:</b> {row.id}
          </span>
          <span style={{ marginLeft: 12 }}>
            <b>Created:</b> {row.created_at ?? ""}
          </span>
          <span style={{ marginLeft: 12 }}>
            <b>Updated:</b> {row.updated_at ?? ""}
          </span>
        </div>

        {/* ✅ Photo section */}
        <Section title="Photo">
          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: 16,
                border: "1px solid #e6e6e6",
                background: "#fafafa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Uploaded"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span style={{ fontSize: 12, color: "#777" }}>No photo</span>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 13, color: "#444" }}>
                Uploading here stores the photo in Supabase (separate from Tally).
              </div>

              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #000",
                  background: photoBusy ? "#f4f4f4" : "#fff",
                  cursor: photoBusy ? "default" : "pointer",
                  width: "fit-content",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {photoBusy ? "Uploading…" : "Upload / Replace photo"}
                <input
                  type="file"
                  accept="image/*"
                  disabled={photoBusy}
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handlePhotoUpload(f);
                    e.currentTarget.value = "";
                  }}
                />
              </label>

              {row.photo_path ? (
                <div style={{ fontSize: 12, color: "#777" }}>
                  Stored as: <code>{row.photo_path}</code>
                </div>
              ) : null}
            </div>
          </div>
        </Section>

        <Section
          title="Personal details"
          onSaveSection={() =>
            saveAll({
              keys: ["First Name", "Surname", "Father's Name", "Mother's Name", "Date of Birth"],
            })
          }
          saving={saving}
        >
          <Field label="First Name">
            <TextInput value={row["First Name"] ?? ""} onChange={(v) => setRow({ ...row, ["First Name"]: v })} />
          </Field>
          <Field label="Surname">
            <TextInput value={row.Surname ?? ""} onChange={(v) => setRow({ ...row, Surname: v })} />
          </Field>
          <Field label="Father's Name">
            <TextInput value={row["Father's Name"] ?? ""} onChange={(v) => setRow({ ...row, ["Father's Name"]: v })} />
          </Field>
          <Field label="Mother's Name">
            <TextInput value={row["Mother's Name"] ?? ""} onChange={(v) => setRow({ ...row, ["Mother's Name"]: v })} />
          </Field>
          <Field label="Date of Birth" hint="(as entered)">
            <TextInput value={row["Date of Birth"] ?? ""} onChange={(v) => setRow({ ...row, ["Date of Birth"]: v })} />
          </Field>
        </Section>

        <Section
          title="Contact"
          onSaveSection={() => saveAll({ keys: ["City", "Country", "Phone", "Email", "Preffered Communication"] })}
          saving={saving}
        >
          <Field label="City">
            <TextInput value={row.City ?? ""} onChange={(v) => setRow({ ...row, City: v })} />
          </Field>
          <Field label="Country">
            <TextInput value={row.Country ?? ""} onChange={(v) => setRow({ ...row, Country: v })} />
          </Field>
          <Field label="Phone">
            <TextInput value={row.Phone ?? ""} onChange={(v) => setRow({ ...row, Phone: v })} />
          </Field>
          <Field label="Email">
            <TextInput value={row.Email ?? ""} onChange={(v) => setRow({ ...row, Email: v })} />
          </Field>

          <ChipMultiSelect
            label="Preferred Communication"
            hint="(safe — won’t break saving)"
            values={preferredComm}
            onChange={setPreferredComm}
            suggestions={["Email", "WhatsApp", "Phone call", "SMS"]}
          />
        </Section>

        <Section
          title="Background"
          onSaveSection={() =>
            saveAll({
              keys: ["Contact Name", "My languages", "Gender", "Height", "My Community", "My Status", "Children", "My Occupation"],
            })
          }
          saving={saving}
        >
          <Field label="Contact Name">
            <TextInput value={row["Contact Name"] ?? ""} onChange={(v) => setRow({ ...row, ["Contact Name"]: v })} />
          </Field>
          <Field label="My languages">
            <TextInput value={row["My languages"] ?? ""} onChange={(v) => setRow({ ...row, ["My languages"]: v })} />
          </Field>
          <Field label="Gender">
            <TextInput value={row.Gender ?? ""} onChange={(v) => setRow({ ...row, Gender: v })} />
          </Field>
          <Field label="Height">
            <TextInput value={row.Height ?? ""} onChange={(v) => setRow({ ...row, Height: v })} />
          </Field>
          <Field label="My Community">
            <TextInput value={row["My Community"] ?? ""} onChange={(v) => setRow({ ...row, ["My Community"]: v })} />
          </Field>
          <Field label="My Status">
            <TextInput value={row["My Status"] ?? ""} onChange={(v) => setRow({ ...row, ["My Status"]: v })} />
          </Field>
          <Field label="Children">
            <TextInput value={row.Children ?? ""} onChange={(v) => setRow({ ...row, Children: v })} />
          </Field>
          <Field label="My Occupation">
            <TextInput value={row["My Occupation"] ?? ""} onChange={(v) => setRow({ ...row, ["My Occupation"]: v })} />
          </Field>
        </Section>

        <Section
          title="Looking for"
          onSaveSection={() => saveAll({ keys: ["Their Occupation", "Their Community", "Their Languages", "Their Status"] })}
          saving={saving}
        >
          <Field label="Their Occupation">
            <TextInput value={row["Their Occupation"] ?? ""} onChange={(v) => setRow({ ...row, ["Their Occupation"]: v })} />
          </Field>
          <Field label="Their Community">
            <TextInput value={row["Their Community"] ?? ""} onChange={(v) => setRow({ ...row, ["Their Community"]: v })} />
          </Field>
          <Field label="Their Languages">
            <TextInput value={row["Their Languages"] ?? ""} onChange={(v) => setRow({ ...row, ["Their Languages"]: v })} />
          </Field>

          <ChipMultiSelect
            label="Their Status"
            hint="(safe — won’t break saving)"
            values={theirStatus}
            onChange={setTheirStatus}
            suggestions={["Working", "Learning", "Both", "Other"]}
          />
        </Section>

        <Section title="About" onSaveSection={() => saveAll({ keys: ["About Me", "About Them", "References"] })} saving={saving}>
          <Field label="About Me">
            <TextArea value={row["About Me"] ?? ""} onChange={(v) => setRow({ ...row, ["About Me"]: v })} />
          </Field>
          <Field label="About Them">
            <TextArea value={row["About Them"] ?? ""} onChange={(v) => setRow({ ...row, ["About Them"]: v })} />
          </Field>
          <Field label="References">
            <TextArea value={row.References ?? ""} onChange={(v) => setRow({ ...row, References: v })} />
          </Field>
        </Section>

        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}
