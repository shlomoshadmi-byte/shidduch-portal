import ManageClient from "./manage-client";

type Props = {
  params: Promise<{ manage_token: string }>;
};

export default async function Page({ params }: Props) {
  // 1. Await the params
  const resolvedParams = await params;
  
  // 2. Extract the token
  const token = resolvedParams.manage_token;

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
          maxWidth: 800,       // Wider for the management form
          width: "100%",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <ManageClient manageToken={token} />
      </div>
    </main>
  );
}