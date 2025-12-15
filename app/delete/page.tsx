import { Suspense } from "react";
import DeleteClient from "./delete-client";

export default function DeletePage() {
  return (
    <Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>
      <DeleteClient />
    </Suspense>
  );
}
