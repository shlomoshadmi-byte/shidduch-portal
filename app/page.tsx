import React from "react";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "sans-serif",
        // ✅ Your Background Image
        backgroundImage: 'url("/site-bg.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Semi-transparent Glass Card */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.95)", // White with slight transparency
          backdropFilter: "blur(10px)",
          padding: "48px 32px",
          borderRadius: 24,
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}
      >
        {/* ✅ One Heart Logo in the Middle */}
        <img
          src="/heart-logo.png"
          alt="Binah Shidduchim"
          style={{ 
            width: 140, 
            height: "auto", 
            marginBottom: 8 
          }}
        />

        <div>
          <h1 style={{ margin: 0, fontSize: "26px", color: "#333", fontWeight: 800 }}>
            Welcome
          </h1>
          <p style={{ margin: "12px 0 0", color: "#666", lineHeight: 1.5 }}>
            Please select your preferred language to submit a profile.
          </p>
        </div>

        {/* 🇺🇸 BUTTON 1: English Form */}
        <a
          href="https://forms.shidduch-gmach.org/english"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            width: "100%",
            padding: "16px",
            background: "#0052cc", // Blue
            color: "white",
            textDecoration: "none",
            borderRadius: 12,
            fontWeight: "bold",
            fontSize: "16px",
            boxShadow: "0 4px 12px rgba(0,82,204,0.3)",
          }}
        >
          Submit Profile (English)
        </a>

        {/* 🇮🇱 BUTTON 2: Hebrew Form */}
        <a
          href="https://forms.shidduch-gmach.org/hebrew"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            width: "100%",
            padding: "16px",
            background: "#fff",
            color: "#0052cc",
            border: "2px solid #0052cc",
            textDecoration: "none",
            borderRadius: 12,
            fontWeight: "bold",
            fontSize: "16px",
          }}
        >
          הגשת פרופיל (עברית)
        </a>

        <p style={{ fontSize: 13, color: "#999", marginTop: 12 }}>
          Already have a profile? Check your email for your personal manage link.
        </p>

      </div>
    </main>
  );
}