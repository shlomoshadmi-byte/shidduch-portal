export default function DeletedPage() {
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
          maxWidth: 680,
          width: "100%",
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ marginTop: 0, fontSize: "24px" }}>✅ Submission deleted</h1>

        <p style={{ fontSize: "18px", margin: "20px 0" }}>
          Your submission has been removed.
        </p>

        <p style={{ fontSize: 13, color: "#777" }}>
          Thank you for letting us know.
        </p>
      </div>
    </main>
  );
}