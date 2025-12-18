import { Suspense } from "react";
import ClaimClient from "./claim-client";

export default function ClaimPage() {
  return (
    <main
      style={{
        padding: 24,
        fontFamily: "sans-serif",
        // 👇 These lines force everything to the center
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start", // Starts from top but centered horizontally
        minHeight: "80vh",            // Ensures it has room to look nice
      }}
    >
      {/* Page content */}
      <Suspense fallback={<div>Working…</div>}>
        <ClaimClient />
      </Suspense>
    </main>
  );
}