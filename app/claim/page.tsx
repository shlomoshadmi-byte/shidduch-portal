import { Suspense } from "react";
import ClaimClient from "./claim-client";

export default function ClaimPage() {
  return (
    <Suspense fallback={<div style={{ padding: 16 }}>Working…</div>}>
      <ClaimClient />
    </Suspense>
  );
}
