import { Suspense } from "react";
import MeClient from "./me-client";

export default function MePage() {
  return (
    <Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>
      <MeClient />
    </Suspense>
  );
}
