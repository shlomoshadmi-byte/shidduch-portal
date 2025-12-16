import { Suspense } from "react";
import ClaimClient from "./claim-client";

export default function ClaimPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 24,
        fontFamily: "sans-serif",
        background: "#fafafa",
      }}
    >
      {/* Brand header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <img
          src="/binah_logo.png"
          alt="Binah Shidduchim"
          style={{ height: 56 }}
        />
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>
            Binah Shidduchim
          </div>
          <div style={{ fontSize: 13, color: "#666" }}>
            Secure submission confirmation
          </div>
        </div>
      </header>

      {/* Page content */}
      <Suspense fallback={<div>Working…</div>}>
        <ClaimClient />
      </Suspense>
    </main>
  );
}
