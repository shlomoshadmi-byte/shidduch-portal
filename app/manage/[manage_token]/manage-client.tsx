"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type IntakeForm = {
  id: string;
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

export default function ManageClient({ manageToken }: { manageToken: string }) {
  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState<IntakeForm | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      setError(null);
      setLoading(true);

      if (!manageToken) {
        setError("Missing manage token. Open this page from your email link.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("intake_forms")
        .select(
          `
          id, deleted_at, delete_reason, photo_path,
          "First Name","Surname","Father's Name","Mother's Name","Date of Birth",
          "City","Country","Phone","Email","Preffered Communication",
          "Contact Name","My languages","Gender","Height","My Community","My Status",
          "Children","My Occupation",
          "Their Occupation","Their Community","Their Languages","Their Status",
          "About Me","About Them","References"
        `
        )
        .eq("manage_token", manageToken)
        .maybeSingle();

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setError("Invalid or expired manage link.");
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
  }, [manageToken]);

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (error) return <pre style={{ padding: 16, color: "crimson", whiteSpace: "pre-wrap" }}>{error}</pre>;
  if (!row) return <div style={{ padding: 16 }}>Not found.</div>;

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 700 }}>
      <h1>Manage submission</h1>
      <p>
        <b>
          {row["First Name"]} {row.Surname}
        </b>
      </p>
      <p>ID: {row.id}</p>
    </main>
  );
}
