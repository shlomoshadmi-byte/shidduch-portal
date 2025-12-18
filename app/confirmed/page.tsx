export default function ConfirmedPage() {
  return (
    <main
      style={{
        padding: 24,
        fontFamily: "sans-serif",
        // Center everything
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
          textAlign: "center", // Center text inside the card
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)", // Nice shadow effect
        }}
      >
        <h1 style={{ marginTop: 0, fontSize: "24px" }}>✅ Submission confirmed</h1>

        <p style={{ fontSize: "18px", margin: "20px 0" }}>
          Your submission is now linked to your account.
        </p>

        <p style={{ color: "#555", lineHeight: "1.6" }}>
          You will shortly receive another email with a permanent link to manage
          and update your submission.
        </p>
      </div>
    </main>
  );
}