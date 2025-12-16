import { Suspense } from "react";
import MeClient from "./me-client";

export default function MePage() {
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
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: 10,
    marginBottom: 24,
  }}
>
  <img
    src="/binah_logo.png"
    alt="Binah Shidduchim"
    style={{
      height: 110,       // bigger
      width: "auto",
      maxWidth: "90vw",  // mobile-safe
    }}
  />

  <div>
    <div style={{ fontSize: 22, fontWeight: 800 }}>Binah Shidduchim</div>
    <div style={{ fontSize: 13, color: "#666", marginTop: 2 }}>
      Manage your submission
    </div>
  </div>
</header>


      {/* Page content */}
      <Suspense fallback={<div>Loading…</div>}>
        <MeClient />
      </Suspense>
    </main>
  );
}
