"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

type IntakeForm = {
  id: string;
  created_at: string | null;
  updated_at: string | null;
  user_id: string | null;
  claim_token: string | null;

  deleted_at: string | null;
  delete_reason: string | null;

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
          id, created_at, updated_at, user_id, claim_token, deleted_at, delete_reason,
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
    placeholder,
  }: {
    label: string;
    value: string[];
    onChange: (v: string[]) => void;
    placeholder?: string;
  }) {
    return (
      <TextArea
        label={`${label} (comma-separated)`}
        value={arrToText(value)}
        onChange={(txt) => onChange(textToArr(txt))}
        placeholder={placeholder ?? "e.g. Email, WhatsApp"}
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
        <b>Created:</b> {row.created_at ?? ""}
      </div>
      <div>
        <b>Updated:</b> {row.updated_at ?? ""}
      </div>

      <Input
        label="First Name"
        value={row["First Name"] ?? ""}
        onChange={(v) => setRow({ ...row, ["First Name"]: v })}
      />
      <Input label="Surname" value={row.Surname ?? ""} onChange={(v) => setRow({ ...row, Surname: v })} />
      <Input
        label="Father's Name"
        value={row["Father's Name"] ?? ""}
        onChange={(v) => setRow({ ...row, ["Father's Name"]: v })}
      />
      <Input
        label="Mother's Name"
        value={row["Mother's Name"] ?? ""}
        onChange={(v) => setRow({ ...row, ["Mother's Name"]: v })}
      />
      <Input
        label="Date of Birth"
        type="text"
        value={row["Date of Birth"] ?? ""}
        onChange={(v) => setRow({ ...row, ["Date of Birth"]: v })}
      />

      <Input label="City" value={row.City ?? ""} onChange={(v) => setRow({ ...row, City: v })} />
      <Input label="Country" value={row.Country ?? ""} onChange={(v) => setRow({ ...row, Country: v })} />
      <Input label="Phone" value={row.Phone ?? ""} onChange={(v) => setRow({ ...row, Phone: v })} />
      <Input label="Email" value={row.Email ?? ""} onChange={(v) => setRow({ ...row, Email: v })} />

      <ArrayField
        label="Preffered Communication"
        value={row["Preffered Communication"] ?? []}
        onChange={(v) => setRow({ ...row, ["Preffered Communication"]: v })}
      />

      <Input
        label="Contact Name"
        value={row["Contact Name"] ?? ""}
        onChange={(v) => setRow({ ...row, ["Contact Name"]: v })}
      />
      <Input
        label="My languages"
        value={row["My languages"] ?? ""}
        onChange={(v) => setRow({ ...row, ["My languages"]: v })}
      />

      <Input label="Gender" value={row.Gender ?? ""} onChange={(v) => setRow({ ...row, Gender: v })} />
      <Input label="Height" value={row.Height ?? ""} onChange={(v) => setRow({ ...row, Height: v })} />

      <Input
        label="My Community"
        value={row["My Community"] ?? ""}
        onChange={(v) => setRow({ ...row, ["My Community"]: v })}
      />
      <Input
        label="My Status"
        value={row["My Status"] ?? ""}
        onChange={(v) => setRow({ ...row, ["My Status"]: v })}
      />
      <Input label="Children" value={row.Children ?? ""} onChange={(v) => setRow({ ...row, Children: v })} />

      <Input
        label="My Occupation"
        value={row["My Occupation"] ?? ""}
        onChange={(v) => setRow({ ...row, ["My Occupation"]: v })}
      />

      <Input
        label="Their Occupation"
        value={row["Their Occupation"] ?? ""}
        onChange={(v) => setRow({ ...row, ["Their Occupation"]: v })}
      />
      <Input
        label="Their Community"
        value={row["Their Community"] ?? ""}
        onChange={(v) => setRow({ ...row, ["Their Community"]: v })}
      />
      <Input
        label="Their Languages"
        value={row["Their Languages"] ?? ""}
        onChange={(v) => setRow({ ...row, ["Their Languages"]: v })}
      />

      <ArrayField
        label="Their Status"
        value={row["Their Status"] ?? []}
        onChange={(v) => setRow({ ...row, ["Their Status"]: v })}
        placeholder="e.g. Working, Learning"
      />

      <TextArea label="About Me" value={row["About Me"] ?? ""} onChange={(v) => setRow({ ...row, ["About Me"]: v })} />
      <TextArea
        label="About Them"
        value={row["About Them"] ?? ""}
        onChange={(v) => setRow({ ...row, ["About Them"]: v })}
      />
      <TextArea label="References" value={row.References ?? ""} onChange={(v) => setRow({ ...row, References: v })} />

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
              "First Name": row["First Name"],
              Surname: row.Surname,
              "Father's Name": row["Father's Name"],
              "Mother's Name": row["Mother's Name"],
              "Date of Birth": row["Date of Birth"],
              City: row.City,
              Country: row.Country,
              Phone: row.Phone,
              Email: row.Email,

              "Preffered Communication": row["Preffered Communication"],

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
              "Their Status": row["Their Status"],

              "About Me": row["About Me"],
              "About Them": row["About Them"],
              References: row.References,
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
