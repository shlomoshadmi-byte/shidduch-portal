import DeleteClient from "./delete-client"; 

type Props = {
  params: Promise<{ delete_token: string }>;
};

export default async function DeletePage({ params }: Props) {
  // 1. Await the params (Next.js 15 requirement)
  const resolvedParams = await params;

  // 2. Extract the token
  const token = resolvedParams.delete_token;

  // 3. Pass it to the client component wrapped in the center layout
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
      <DeleteClient deleteToken={token} />
    </main>
  );
}