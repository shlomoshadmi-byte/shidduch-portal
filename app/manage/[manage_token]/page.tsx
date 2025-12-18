import ManageClient from "./manage-client";

type Props = {
  params: Promise<{ manage_token: string }>;
};

export default async function Page({ params }: Props) {
  // 1. Await the params to handle the Promise (Next.js 15 requirement)
  const resolvedParams = await params;
  
  // 2. Extract the token
  const token = resolvedParams.manage_token;

  // 3. Pass it to the client component wrapped in the center layout
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
      <ManageClient manageToken={token} />
    </main>
  );
}