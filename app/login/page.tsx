import { Suspense } from "react";
import LoginClient from "./login-client";

export default function LoginPage() {
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
      {/* Content card */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e6e6e6",
          borderRadius: 14,
          padding: 32,
          maxWidth: 480,
          width: "100%",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ marginTop: 0, fontSize: "24px", textAlign: "center", marginBottom: "24px" }}>
          Secure Login
        </h1>

        <Suspense fallback={<div style={{ textAlign: "center" }}>Loading…</div>}>
          <LoginClient />
        </Suspense>
      </div>
    </main>
  );
}