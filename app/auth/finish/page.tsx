import { Suspense } from "react";
import FinishClient from "./finish-client";

export default function FinishAuthPage() {
  return (
    <main
      style={{
        padding: 24,
        fontFamily: "sans-serif",
        // Center the content
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        minHeight: "80vh",
      }}
    >
      {/* 👇 White Card Wrapper */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e6e6e6",
          borderRadius: 14,
          padding: 32,
          maxWidth: 480,       // Kept it narrow since it's just a "Signing in" message
          width: "100%",
          textAlign: "center", // Centers the text inside the card
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <Suspense fallback={<div>Signing you in…</div>}>
          <FinishClient />
        </Suspense>
      </div>
    </main>
  );
}