export default function DeletedPage() {
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
            Submission deleted
          </div>
        </div>
      </header>

      {/* Content card */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e6e6e6",
          borderRadius: 14,
          padding: 24,
          maxWidth: 680,
        }}
      >
        <h1 style={{ marginTop: 0 }}>✅ Submission deleted</h1>

        <p>Your submission has been removed.</p>

        <p style={{ fontSize: 13, color: "#777" }}>
          Thank you for letting us know.
        </p>
      </div>
    </main>
  );
}
