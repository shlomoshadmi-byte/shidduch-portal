import { Suspense } from "react";
import MeClient from "./me-client";

export default function MePage() {
  return (
    <main
      style={{
        padding: 24,
        fontFamily: "sans-serif",
        // Center the content on the page
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        minHeight: "80vh",
      }}
    >
      {/* 👇 THE WHITE CARD CONTAINER 
         This puts a clean white box behind your form so it's easy to read.
      */}
      <div
        style={{
          background: "#fff",            // White background behind text
          border: "1px solid #e6e6e6",
          borderRadius: 14,
          padding: 32,
          maxWidth: 800,                 // Wider than login, good for forms
          width: "100%",                 // Responsive
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)", // Pop-out effect
        }}
      >
        <Suspense fallback={<div style={{ textAlign: "center" }}>Loading your profile…</div>}>
          <MeClient />
        </Suspense>
      </div>
    </main>
  );
}