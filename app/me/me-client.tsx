"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

type IntakeForm = {
  id: string;
  created_at: string;
  user_id: string | null;

  first_name: string | null;
  surname: string | null;
  fathers_name: string | null;
  mothers_name: string | null;
  date_of_birth: string | null; // YYYY-MM-DD
  city: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;

  preferred_communication: string[] | null;

  Contact_Name: string | null; // note capital C/N in your schema
  my_primary_language: string | null;
  my_other_languages: string | null;

  gender: string | null;
  height: string | null;

  my_community: string | null;
  my_community_other: string | null;
  my_status: string | null;
  children: string | null;

  my_occupation: string | null;
  my_job: string | null;
  yeshiva_seminar: string | null;

  their_occupation: string | null;
  their_community: string[] | null;
  their_primary_language: string | null;
  their_addittional_languages: string[] | null;
  their_status: string[] | null;

  about_me: string | null;
  about_them: string | null;
  references: string | null;

  my_addittional_languages: string[] | null;
};

function arrToText(a: string[] | null | undefined) {
  return (a ?? []).join(", ");
}
function textToArr(s: string) {
  const items = s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  return items.length ? items : [];
}

export default function MeClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState<IntakeForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function run() {
      setError(null);

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
          id, created_at, user_id,
          first_name, surname, fathers_name, mothers_name, date_of_birth,
          city, country, phone, email,
          preferred_communication,
          "Contact_Name",
          my_primary_language, my_other_languages,
          gender, height,
          my_community, my_community_other, my_status, children,
          my_occupation, my_job, yeshiva_seminar,
          their_occupation, their_community, their_primary_language,
          their_addittional_languages, their_status,
          about_me, about_them, references,
          my_addittional_languages
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
        setError(
          "This submission isn't available to your account yet. Make sure you confirmed THIS submission first."
        );
        setLoading(false);
        return;
      }

      if (!data.user_id) {
        setError("This submission has not been confirmed yet. Use the Confirm submission link first.");
        setLoading(false);
        return;
      }

      setRow(data as IntakeForm);
      setLoading(false);
    }

    run();
  }, [id]);

  function Input({
    label,
    value,
    onChange,
    type = "text",
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: "text" | "date";
  }) {
    return (
      <label style={{ display: "block", marginTop: 12 }}>
        <div style={{ fontSize: 12, marginBottom: 4 }}>{label}</div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: "100%", padding: 8, border: "1px solid #ccc" }}
        />
      </label>
    );
  }

  function TextArea({
    label,
    value,
    onChange,
    placeholder,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
  }) {
    return (
      <label style={{ display: "block", marginTop: 12 }}>
        <div style={{ fontSize: 12, marginBottom: 4 }}>{label}</div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ width: "100%", padding: 8, border: "1px solid #ccc", minHeight: 70 }}
        />
      </label>
    );
  }

  function ArrayField({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: string[];
    onChange: (v: string[]) => void;
  }) {
    return (
      <TextArea
        label={`${label} (comma-separated)`}
        value={arrToText(value)}
        onChange={(txt) => onChange(textToArr(txt))}
        placeholder="e.g. English, Hebrew"
      />
    );
  }

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (error) return <pre style={{ padding: 16, color: "red" }}>{error}</pre>;
  if (!row) return <div style={{ padding: 16 }}>Not found.</div>;

  return (
    <div style={{ padding: 16, maxWidth: 820 }}>
      <h1>Manage submission</h1>

      <div>
        <b>ID:</b> {row.id}
      </div>
      <div>
        <b>Created:</b> {row.created_at}
      </div>

      {/* Basic */}
      <Input label="First name" value={row.first_name ?? ""} onChange={(v) => setRow({ ...row, first_name: v })} />
      <Input label="Surname" value={row.surname ?? ""} onChange={(v) => setRow({ ...row, surname: v })} />
      <Input
        label="Father's name"
        value={row.fathers_name ?? ""}
        onChange={(v) => setRow({ ...row, fathers_name: v })}
      />
      <Input
        label="Mother's name"
        value={row.mothers_name ?? ""}
        onChange={(v) => setRow({ ...row, mothers_name: v })}
      />
      <Input
        label="Date of birth"
        type="date"
        value={row.date_of_birth ?? ""}
        onChange={(v) => setRow({ ...row, date_of_birth: v })}
      />
      <Input label="City" value={row.city ?? ""} onChange={(v) => setRow({ ...row, city: v })} />
      <Input label="Country" value={row.country ?? ""} onChange={(v) => setRow({ ...row, country: v })} />
      <Input label="Phone" value={row.phone ?? ""} onChange={(v) => setRow({ ...row, phone: v })} />
      <Input label="Email" value={row.email ?? ""} onChange={(v) => setRow({ ...row, email: v })} />

      {/* Arrays */}
      <ArrayField
        label="Preferred communication"
        value={row.preferred_communication ?? []}
        onChange={(v) => setRow({ ...row, preferred_communication: v })}
      />

      {/* More personal */}
      <Input label="Contact name" value={row.Contact_Name ?? ""} onChange={(v) => setRow({ ...row, Contact_Name: v })} />
      <Input
        label="My primary language"
        value={row.my_primary_language ?? ""}
        onChange={(v) => setRow({ ...row, my_primary_language: v })}
      />
      <Input
        label="My other languages (text)"
        value={row.my_other_languages ?? ""}
        onChange={(v) => setRow({ ...row, my_other_languages: v })}
      />
      <Input label="Gender" value={row.gender ?? ""} onChange={(v) => setRow({ ...row, gender: v })} />
      <Input label="Height" value={row.height ?? ""} onChange={(v) => setRow({ ...row, height: v })} />

      <Input label="My community" value={row.my_community ?? ""} onChange={(v) => setRow({ ...row, my_community: v })} />
      <Input
        label="My community (other)"
        value={row.my_community_other ?? ""}
        onChange={(v) => setRow({ ...row, my_community_other: v })}
      />
      <Input label="My status" value={row.my_status ?? ""} onChange={(v) => setRow({ ...row, my_status: v })} />
      <Input label="Children" value={row.children ?? ""} onChange={(v) => setRow({ ...row, children: v })} />

      <Input
        label="My occupation"
        value={row.my_occupation ?? ""}
        onChange={(v) => setRow({ ...row, my_occupation: v })}
      />
      <Input label="My job" value={row.my_job ?? ""} onChange={(v) => setRow({ ...row, my_job: v })} />
      <Input
        label="Yeshiva / seminar"
        value={row.yeshiva_seminar ?? ""}
        onChange={(v) => setRow({ ...row, yeshiva_seminar: v })}
      />

      {/* Their preferences */}
      <Input
        label="Their occupation"
        value={row.their_occupation ?? ""}
        onChange={(v) => setRow({ ...row, their_occupation: v })}
      />
      <ArrayField
        label="Their community"
        value={row.their_community ?? []}
        onChange={(v) => setRow({ ...row, their_community: v })}
      />
      <Input
        label="Their primary language"
        value={row.their_primary_language ?? ""}
        onChange={(v) => setRow({ ...row, their_primary_language: v })}
      />
      <ArrayField
        label="Their additional languages"
        value={row.their_addittional_languages ?? []}
        onChange={(v) => setRow({ ...row, their_addittional_languages: v })}
      />
      <ArrayField
        label="Their status"
        value={row.their_status ?? []}
        onChange={(v) => setRow({ ...row, their_status: v })}
      />

      {/* Long text */}
      <TextArea label="About me" value={row.about_me ?? ""} onChange={(v) => setRow({ ...row, about_me: v })} />
      <TextArea label="About them" value={row.about_them ?? ""} onChange={(v) => setRow({ ...row, about_them: v })} />
      <TextArea label="References" value={row.references ?? ""} onChange={(v) => setRow({ ...row, references: v })} />

      {/* Arrays */}
      <ArrayField
        label="My additional languages"
        value={row.my_addittional_languages ?? []}
        onChange={(v) => setRow({ ...row, my_addittional_languages: v })}
      />

      <button
        type="button"
        disabled={saving}
        style={{
          marginTop: 16,
          padding: "8px 14px",
          border: "1px solid black",
          background: "#fff",
          cursor: "pointer",
        }}
        onClick={async () => {
          setError(null);
          setSaving(true);

          const { error } = await supabase
            .from("intake_forms")
            .update({
              first_name: row.first_name,
              surname: row.surname,
              fathers_name: row.fathers_name,
              mothers_name: row.mothers_name,
              date_of_birth: row.date_of_birth,
              city: row.city,
              country: row.country,
              phone: row.phone,
              email: row.email,

              preferred_communication: row.preferred_communication,

              // capital column name must be quoted in JS object
              "Contact_Name": row.Contact_Name,

              my_primary_language: row.my_primary_language,
              my_other_languages: row.my_other_languages,

              gender: row.gender,
              height: row.height,

              my_community: row.my_community,
              my_community_other: row.my_community_other,
              my_status: row.my_status,
              children: row.children,

              my_occupation: row.my_occupation,
              my_job: row.my_job,
              yeshiva_seminar: row.yeshiva_seminar,

              their_occupation: row.their_occupation,
              their_community: row.their_community,
              their_primary_language: row.their_primary_language,
              their_addittional_languages: row.their_addittional_languages,
              their_status: row.their_status,

              about_me: row.about_me,
              about_them: row.about_them,
              references: row.references,

              my_addittional_languages: row.my_addittional_languages,
            })
            .eq("id", row.id);

          setSaving(false);

          if (error) setError(error.message);
          else alert("Saved ✅");
        }}
      >
        {saving ? "Saving..." : "Save changes"}
      </button>
    </div>
  );
}
