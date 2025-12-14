import { Suspense } from "react";
import ConfirmedClient from "./confirmed-client";

export default function ConfirmedPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <ConfirmedClient />
    </Suspense>
  );
}
