import DeleteClient from "./delete-client"; 

type Props = {
  params: Promise<{ delete_token: string }>;
};

export default async function DeletePage({ params }: Props) {
  // 1. Await the params (Next.js 15 requirement)
  const resolvedParams = await params;

  // 2. Extract the token
  const token = resolvedParams.delete_token;

  // 3. Pass it to the client component wrapped in the white card
  return (
    <main
      style={{
        padding: 24,
        fontFamily: "sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        minHeight: "80vh",
      }}
    >
      {/* 👇 White Card Wrapper */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e6e6e6",
          borderRadius: 14,
          padding: 32,
          maxWidth: 600,       // A nice width for a form
          width: "100%",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <DeleteClient deleteToken={token} />
      </div>
    </main>
  );
}