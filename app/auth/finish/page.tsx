import { Suspense } from "react";
import FinishClient from "./finish-client";

export default function FinishAuthPage() {
  return (
    <Suspense fallback={<div style={{ padding: 16 }}>Signing you in…</div>}>
      <FinishClient />
    </Suspense>
  );
}
