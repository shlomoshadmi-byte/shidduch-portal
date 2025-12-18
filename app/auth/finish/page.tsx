import { Suspense } from "react";
import FinishClient from "./finish-client";

export default function FinishAuthPage() {
  return (
    <main
      style={{
        padding: 24,
        fontFamily: "sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        minHeight: "80vh",
      }}
    >
      <Suspense fallback={<div style={{ padding: 16 }}>Signing you in…</div>}>
        <FinishClient />
      </Suspense>
    </main>
  );
}