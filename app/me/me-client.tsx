"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

const PHOTO_BUCKET = "intake-photos";
const LOGO_SRC = "/binah_logo.png";

type IntakeForm = {
  id: string;
  created_at: string | null;
  updated_at: string | null;
  user_id: string | null;
  claim_token: string | null;

  deleted_at: string | null;
  delete_reason: string | null;

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
  const hasHebrew = /[\u0590-\u05FF]/.test(value);
  return hasHebrew ? "rtl" : "ltr";
}

type UiMeta = {
  label: string; // display label (Hebrew)
  hint?: string; // helper text (Hebrew)
  placeholder?: string;
};

const UI: Record<string, UiMeta> = {
  // Personal
  "First Name": { label: "שם פרטי" },
  Surname: { label: "שם משפחה" },
  "Father's Name": { label: "שם האב" },
  "Mother's Name": { label: "שם האם" },
  "Date of Birth": { label: "תאריך לידה" },
  City: { label: "עיר" },
  Country: { label: "ארץ" },
  Phone: { label: "טלפון" },
  Email: { label: "אימייל" },
  "Contact Name": { label: "שם להתקשרות עבור הצעות וכו׳" },
  "Preffered Communication": { label: "דרכי התקשרות", hint: "אפשר להוסיף כמה אפשרויות (Email / WhatsApp / שיחה וכו׳)." },

  // Background (me)
  Gender: { label: "מין" },
  Height: { label: "גובה" },
  "My Status": { label: "הסטטוס שלי" },
  Children: { label: "ילדים" },

  "My languages": {
    label: "שפת אם ושפות נוספות שלי",
    hint:
      "נא לציין שפת אם, ושפות נוספות בציון רמת שליטה (שוטף / שיחה / בסיסי).\n" +
      "נא לציין רק שפות שבהן ניתן לנהל שיחה כלשהי.",
    placeholder: "לדוגמה: עברית – שפת אם\nאנגלית – שיחה\nיידיש – בסיסי",
  },

  "My Community": {
    label: "מגזר, עדה וקהילה שלי",
    hint:
      "ניתן לציין עדה (למשל אשכנזי/ספרדי/תימני), מגזר (ליטאי/חסידי/ספרדי), קהילה/חסידות,\n" +
      "וסגנון כללי בבית ובקהילה (גם ברמת רבנים/הנהגות/מנהגים).",
    placeholder: "לדוגמה: אשכנזי, ליטאי, קהילה X, סגנון בית: ...",
  },

  "My Occupation": {
    label: "רקע לימודי ועיסוק נוכחי שלי",
    hint:
      "ציינו ישיבות / סמינר ו/או מסגרות לימוד נוספות (כולל מגמה ושנים).\n" +
      "פרטו עיסוק נוכחי – עבודה / לימודים / הכשרה (תחום, היקף ועיר).\n\n" +
      "בחורים: ישיבות/כולל (כולל שנים), ואם עובדים – תחום העיסוק והאם קובעים עיתים לתורה.\n" +
      "בחורות: סמינר ומגמה, לימודים נוספים (אם יש), ועיסוק נוכחי.\n\n" +
      "אם יש תכניות לשינוי בקרוב – ניתן לציין.\n" +
      "ככל שתפרטו יותר, נוכל ליצור התאמות מדויקות ומשמעותיות יותר.",
    placeholder: "אפשר לכתוב בנקודות — הכי נוח.",
  },

  // Looking for (them)
  "Their Status": { label: "הסטטוס שלהם" },

  "Their Occupation": {
    label: "העדפות לגבי רקע לימודי/תורני ועיסוק נוכחי שלהם",
    hint:
      'נא לפרט: האם מחפשים בן/בת תורה "שתורתו/ה אומנותו", משלב תורה ועבודה, או עובד/ת קבוע/ה?\n' +
      "האם חשוב רקע ישיבתי/סמינרי מסוים?\n" +
      "האם יש דרישה או העדפה למקצוע, תחום או תואר?\n\n" +
      "אין חובה לבחור ניסוח מדויק — פירוט ענייני וברור יעזור לנו ליצור התאמות מדויקות יותר.",
    placeholder: "לדוגמה: חשוב לי שילוב תורה ועבודה, רקע ישיבתי X יתרון, תואר לא חובה...",
  },

  "Their Community": {
    label: "העדפות לגבי מגזר, עדה וקהילה שלהם",
    hint:
      "נא לפרט את העדפותיכם לגבי המגזר, העדה והקהילה של הצד השני.\n" +
      "האם יש העדפה או דרישה לעדה, מגזר, קהילה או חסידות מסוימת?\n" +
      "ניתן לציין גם סגנון כללי בבית ובקהילה (כולל רבנים, הנהגות ומנהגים).\n\n" +
      "פירוט מלא יסייע להתאמות מדויקות יותר.",
    placeholder: "לדוגמה: ספרדי בני תורה, קהילה..., פתוח/גמיש לגבי...",
  },

  "Their Languages": {
    label: "העדפות לגבי שפת אם ושפות נוספות שלהם",
    hint:
      "נא לציין האם יש חשיבות לשפת אם או לשפות נוספות של הצד השני, ואם כן – באיזו רמה.\n" +
      "לדוגמה: עברית – חובה | אנגלית – יתרון / לא חובה.\n\n" +
      "אין חובה לציין העדפות — כל פירוט יסייע להתאמות מדויקות יותר.",
    placeholder: "לדוגמה: עברית חובה; אנגלית יתרון",
  },

  // About
  "About Me": {
    label: "קצת עליי",
    hint:
      "נשמח שתספרו על עצמכם מעבר לתכונות כלליות.\n" +
      "אפשר להתייחס לדברים כמו:\n" +
      "• אופי ודרך חיים ביום־יום\n" +
      "• לימוד תורה, עבודה ואיזון ביניהם\n" +
      "• שאיפות לעתיד (רוחניות, מקצוע, משפחה)\n" +
      "• סגנון חיים ואווירת בית שחשובים לכם\n\n" +
      "במקום “בחור/בחורה נחמדים” – נסו לתאר איך זה באמת לחיות אתכם.\n" +
      "ככל שתפרטו יותר, כך נוכל להתאים טוב יותר.",
    placeholder: "מומלץ לכתוב 5–10 שורות או בנקודות.",
  },

  "About Them": {
    label: "מה חשוב לי בצד השני",
    hint:
      "נשמח שתפרטו מה באמת חשוב לכם בצד השני, מעבר לתכונות כלליות.\n" +
      "אפשר להתייחס לדברים כמו:\n" +
      "• גישה ללימוד תורה, עבודה ושילוב ביניהם\n" +
      "• סגנון אישיות ותקשורת\n" +
      "• שאיפות לעתיד וסוג הבית שתרצו לבנות יחד\n" +
      "• דברים שחשובים לכם במיוחד, לצד דברים שבהם אתם גמישים\n" +
      "• העדפות כלליות לגבי גיל וגובה – בכיוון כללי בלבד\n\n" +
      "אין צורך ברשימת “דרישות” — תיאור כן וברור יעזור לנו ליצור התאמות משמעותיות יותר.",
    placeholder: "מומלץ לציין 3–6 עקרונות + במה אתם גמישים.",
  },

  References: {
    label: "המלצות",
    hint: "צירוף אינו חובה, אך מומלץ, וניתן להוסיף גם בהמשך.",
    placeholder: "שמות + קשר/טלפון (אם יש), או כל מידע מועיל אחר.",
  },
};

function ui(key: string, fallbackLabel: string): UiMeta {
  return UI[key] ?? { label: fallbackLabel };
}

// ✅ UI COMPONENTS
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const dir = detectDir(title);
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
        <h2 style={{ margin: 0, fontSize: 16, direction: dir as any, textAlign: dir === "rtl" ? "right" : "left" }}>
          {title}
        </h2>
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
  const dir = detectDir(label + " " + (hint ?? ""));
  return (
    <label style={{ display: "block", marginTop: 12 }}>
      <div style={{ fontSize: 12, marginBottom: 6, color: "#222", direction: dir as any }}>
        <div style={{ fontWeight: 600 }}>{label}</div>
        {hint ? (
          <div style={{ marginTop: 6, color: "#777", lineHeight: 1.35, whiteSpace: "pre-wrap" }}>{hint}</div>
        ) : null}
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
  const dir = detectDir(value || placeholder || "");
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
  const dir = detectDir(value || placeholder || "");
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
        minHeight: 110,
        resize: "vertical",
        textAlign: dir === "rtl" ? "right" : "left",
        whiteSpace: "pre-wrap",
      }}
    />
  );
}

function FixedMultiPick({
  label,
  hint,
  options,
  values,
  onChange,
  max,
}: {
  label: string;
  hint?: string;
  options: string[];
  values: string[];
  onChange: (v: string[]) => void;
  max?: number;
}) {
  const dir = detectDir(label + " " + options.join(" "));
  const canAddMore = max == null || values.length < max;

  function toggle(opt: string) {
    const exists = values.includes(opt);
    if (exists) return onChange(values.filter((x) => x !== opt));
    if (!canAddMore) return;
    onChange([...values, opt]);
  }

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 12, marginBottom: 6, direction: dir as any }}>
        <div style={{ fontWeight: 600 }}>{label}</div>
        {hint ? <div style={{ marginTop: 6, color: "#777", lineHeight: 1.35, whiteSpace: "pre-wrap" }}>{hint}</div> : null}
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {options.map((opt) => {
          const selected = values.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: selected ? "1px solid #000" : "1px solid #e0e0e0",
                background: selected ? "#f4f4f4" : "#fff",
                cursor: "pointer",
                fontSize: 13,
                direction: dir as any,
              }}
            >
              {opt} {selected ? "✓" : ""}
            </button>
          );
        })}
      </div>

      {max != null ? (
        <div style={{ marginTop: 8, fontSize: 12, color: "#777", direction: dir as any }}>
          נבחרו {values.length} מתוך {max}
        </div>
      ) : null}
    </div>
  );
}


// ✅ MAIN CLIENT COMPONENT
export default function MeClient() {
  const router = useRouter(); // kept (you may use later)
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState<IntakeForm | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  const [preferredComm, setPreferredComm] = useState<string[]>([]);
  const [theirStatus, setTheirStatus] = useState<string[]>([]);

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);

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

      const { data, error } = await supabase
        .from("intake_forms")
        .select(
          `
            id, created_at, updated_at, user_id, claim_token, deleted_at, delete_reason,
            photo_path,
            "First Name", "Surname", "Father's Name", "Mother's Name", "Date of Birth",
            "City", "Country", "Phone", "Email", "Preffered Communication",
            "Contact Name", "My languages", "Gender", "Height", "My Community",
            "My Status", "Children", "My Occupation",
            "Their Occupation", "Their Community", "Their Languages", "Their Status",
            "About Me", "About Them", "References"
          `
        )
        .eq("id", id)
        .maybeSingle();

      if (error) {
        setError(error.message);
      } else if (!data) {
        setError("Submission not found (or access denied).");
      } else {
        setRow(data);
        setPreferredComm(normalizeArr(data["Preffered Communication"]));
        setTheirStatus(normalizeArr(data["Their Status"]));

        originalRef.current = {
          row: data,
          preferredComm: normalizeArr(data["Preffered Communication"]),
          theirStatus: normalizeArr(data["Their Status"]),
        };
      }

      setLoading(false);
    }

    run();
  }, [id]);

  useEffect(() => {
    async function refreshPhoto() {
      if (!row?.photo_path) {
        setPhotoUrl(null);
        return;
      }

      const { data, error } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrl(row.photo_path, 60 * 60);

      if (error) {
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

  async function saveAll() {
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
      photo_path: row.photo_path ?? null,
    };

    const { error } = await supabase.from("intake_forms").update(payload).eq("id", row.id);

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    const changesOnly: Record<string, any> = {};
    if (originalRef.current) {
      Object.keys(payload).forEach((key) => {
        const newValue = payload[key];
        let oldValue = originalRef.current.row[key];
        if (key === "Preffered Communication") oldValue = normalizeArr(originalRef.current.preferredComm);
        if (key === "Their Status") oldValue = normalizeArr(originalRef.current.theirStatus);

        if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
          changesOnly[key] = newValue;
        }
      });
    } else {
      Object.assign(changesOnly, payload);
    }

    if (Object.keys(changesOnly).length > 0) {
      fetch("/api/notify-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "EDIT",
          id: row.id,
          name: `${row["First Name"]} ${row.Surname}`,
          email: row.Email,
          changes: changesOnly,
        }),
      }).catch((err) => console.error("Failed to notify admin of edit", err));
    }

    originalRef.current = {
      row,
      preferredComm,
      theirStatus,
    };

    setBanner("Saved ✅");
    setTimeout(() => setBanner(null), 2500);
  }

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

  async function handlePhotoUpload(file: File) {
    if (!row) return;
    setError(null);
    setBanner(null);
    setPhotoBusy(true);

    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";
      const path = `${row.id}/photo.${safeExt}`;

      const up = await supabase.storage.from(PHOTO_BUCKET).upload(path, file, { upsert: true, contentType: file.type });
      if (up.error) throw up.error;

      const { error } = await supabase.from("intake_forms").update({ photo_path: path }).eq("id", row.id);
      if (error) throw error;

      fetch("/api/notify-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "PHOTO_UPDATE",
          id: row.id,
          name: `${row["First Name"]} ${row.Surname}`,
          email: row.Email,
          changes: { photo_path: path },
        }),
      }).catch((err) => console.error("Photo alert failed", err));

      setRow({ ...row, photo_path: path });
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
              <div style={{ fontSize: 16, fontWeight: 700 }}>עדכון פרופיל</div>
              <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                {dirty ? "יש שינויים שלא נשמרו" : "כל השינויים נשמרו"}
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
              onClick={saveAll}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #000",
                background: saving ? "#f4f4f4" : "#fff",
                cursor: !dirty || saving ? "default" : "pointer",
                fontWeight: 700,
              }}
            >
              {saving ? "Saving…" : "Save Changes"}
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

        <Section title="תמונה">
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
                <img src={photoUrl} alt="Uploaded" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: 12, color: "#777" }}>No photo</span>
              )}
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
        </Section>

        <Section title="פרטים אישיים">
          <Field label={ui("First Name", "First Name").label} hint={ui("First Name", "First Name").hint}>
            <TextInput
              value={row["First Name"] ?? ""}
              onChange={(v) => setRow({ ...row, ["First Name"]: v })}
              placeholder={ui("First Name", "First Name").placeholder}
            />
          </Field>

          <Field label={ui("Surname", "Surname").label} hint={ui("Surname", "Surname").hint}>
            <TextInput
              value={row.Surname ?? ""}
              onChange={(v) => setRow({ ...row, Surname: v })}
              placeholder={ui("Surname", "Surname").placeholder}
            />
          </Field>

          <Field label={ui("Father's Name", "Father's Name").label} hint={ui("Father's Name", "Father's Name").hint}>
            <TextInput
              value={row["Father's Name"] ?? ""}
              onChange={(v) => setRow({ ...row, ["Father's Name"]: v })}
              placeholder={ui("Father's Name", "Father's Name").placeholder}
            />
          </Field>

          <Field label={ui("Mother's Name", "Mother's Name").label} hint={ui("Mother's Name", "Mother's Name").hint}>
            <TextInput
              value={row["Mother's Name"] ?? ""}
              onChange={(v) => setRow({ ...row, ["Mother's Name"]: v })}
              placeholder={ui("Mother's Name", "Mother's Name").placeholder}
            />
          </Field>

          <Field label={ui("Date of Birth", "Date of Birth").label} hint={ui("Date of Birth", "Date of Birth").hint}>
            <TextInput
              type="text"
              value={row["Date of Birth"] ?? ""}
              onChange={(v) => setRow({ ...row, ["Date of Birth"]: v })}
              placeholder={ui("Date of Birth", "Date of Birth").placeholder}
            />
          </Field>
        </Section>

        <Section title="יצירת קשר">
          <Field label={ui("City", "City").label} hint={ui("City", "City").hint}>
            <TextInput value={row.City ?? ""} onChange={(v) => setRow({ ...row, City: v })} />
          </Field>

          <Field label={ui("Country", "Country").label} hint={ui("Country", "Country").hint}>
            <TextInput value={row.Country ?? ""} onChange={(v) => setRow({ ...row, Country: v })} />
          </Field>

          <Field label={ui("Phone", "Phone").label} hint={ui("Phone", "Phone").hint}>
            <TextInput value={row.Phone ?? ""} onChange={(v) => setRow({ ...row, Phone: v })} />
          </Field>

          <Field label={ui("Email", "Email").label} hint={ui("Email", "Email").hint}>
            <TextInput value={row.Email ?? ""} onChange={(v) => setRow({ ...row, Email: v })} />
          </Field>

          <ChipMultiSelect
            label={ui("Preffered Communication", "Preferred Communication").label}
            hint={ui("Preffered Communication", "Preferred Communication").hint}
            values={preferredComm}
            onChange={setPreferredComm}
            suggestions={["Email", "WhatsApp", "Phone call", "SMS"]}
            placeholder="Type and press Enter…"
          />

          <Field label={ui("Contact Name", "Contact Name").label} hint={ui("Contact Name", "Contact Name").hint}>
            <TextInput
              value={row["Contact Name"] ?? ""}
              onChange={(v) => setRow({ ...row, ["Contact Name"]: v })}
            />
          </Field>
        </Section>

        <Section title="רקע">
          <Field label={ui("Gender", "Gender").label} hint={ui("Gender", "Gender").hint}>
            <TextInput value={row.Gender ?? ""} onChange={(v) => setRow({ ...row, Gender: v })} />
          </Field>

          <Field label={ui("Height", "Height").label} hint={ui("Height", "Height").hint}>
            <TextInput value={row.Height ?? ""} onChange={(v) => setRow({ ...row, Height: v })} />
          </Field>

          <Field label="הסטטוס שלי">
          <SelectInput
           value={row["My Status"] ?? ""}
           onChange={(v) => setRow({ ...row, ["My Status"]: v })}
           options={["רווק/ה", "גרוש/ה", "אלמן/ה"]}
           />
          </Field>


          <Field label={ui("Children", "Children").label} hint={ui("Children", "Children").hint}>
            <TextInput value={row.Children ?? ""} onChange={(v) => setRow({ ...row, Children: v })} />
          </Field>

          <Field label={ui("My languages", "My languages").label} hint={ui("My languages", "My languages").hint}>
            <TextArea
              value={row["My languages"] ?? ""}
              onChange={(v) => setRow({ ...row, ["My languages"]: v })}
              placeholder={ui("My languages", "My languages").placeholder}
            />
          </Field>

          <Field label={ui("My Community", "My Community").label} hint={ui("My Community", "My Community").hint}>
            <TextArea
              value={row["My Community"] ?? ""}
              onChange={(v) => setRow({ ...row, ["My Community"]: v })}
              placeholder={ui("My Community", "My Community").placeholder}
            />
          </Field>

          <Field label={ui("My Occupation", "My Occupation").label} hint={ui("My Occupation", "My Occupation").hint}>
            <TextArea
              value={row["My Occupation"] ?? ""}
              onChange={(v) => setRow({ ...row, ["My Occupation"]: v })}
              placeholder={ui("My Occupation", "My Occupation").placeholder}
            />
          </Field>
        </Section>

        <Section title="מחפש/ת">
          
          <FixedMultiPick
          label={ui("Their Status", "Their Status").label} // will show: הסטטוס שלהם
          hint="אפשר לבחור כמה אפשרויות."
          options={["רווק/ה", "גרוש/ה", "אלמן/ה"]}
          values={theirStatus}
          onChange={setTheirStatus}
          />


          <Field label={ui("Their Occupation", "Their Occupation").label} hint={ui("Their Occupation", "Their Occupation").hint}>
            <TextArea
              value={row["Their Occupation"] ?? ""}
              onChange={(v) => setRow({ ...row, ["Their Occupation"]: v })}
              placeholder={ui("Their Occupation", "Their Occupation").placeholder}
            />
          </Field>

          <Field label={ui("Their Community", "Their Community").label} hint={ui("Their Community", "Their Community").hint}>
            <TextArea
              value={row["Their Community"] ?? ""}
              onChange={(v) => setRow({ ...row, ["Their Community"]: v })}
              placeholder={ui("Their Community", "Their Community").placeholder}
            />
          </Field>

          <Field label={ui("Their Languages", "Their Languages").label} hint={ui("Their Languages", "Their Languages").hint}>
            <TextArea
              value={row["Their Languages"] ?? ""}
              onChange={(v) => setRow({ ...row, ["Their Languages"]: v })}
              placeholder={ui("Their Languages", "Their Languages").placeholder}
            />
          </Field>
        </Section>

        <Section title="טקסט חופשי">
          <Field label={ui("About Me", "About Me").label} hint={ui("About Me", "About Me").hint}>
            <TextArea
              value={row["About Me"] ?? ""}
              onChange={(v) => setRow({ ...row, ["About Me"]: v })}
              placeholder={ui("About Me", "About Me").placeholder}
            />
          </Field>

          <Field label={ui("About Them", "About Them").label} hint={ui("About Them", "About Them").hint}>
            <TextArea
              value={row["About Them"] ?? ""}
              onChange={(v) => setRow({ ...row, ["About Them"]: v })}
              placeholder={ui("About Them", "About Them").placeholder}
            />
          </Field>

          <Field label={ui("References", "References").label} hint={ui("References", "References").hint}>
            <TextArea
              value={row.References ?? ""}
              onChange={(v) => setRow({ ...row, References: v })}
              placeholder={ui("References", "References").placeholder}
            />
          </Field>
        </Section>

        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}
