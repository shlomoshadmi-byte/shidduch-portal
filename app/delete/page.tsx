import { Suspense } from "react";
import DeleteClient from "./delete-client";

export default function DeletePage() {
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
            Delete submission
          </div>
        </div>
      </header>

      {/* Content */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e6e6e6",
          borderRadius: 14,
          padding: 24,
          maxWidth: 680,
        }}
      >
        <Suspense fallback={<div>Loading…</div>}>
          <DeleteClient />
        </Suspense>
      </div>
    </main>
  );
}
