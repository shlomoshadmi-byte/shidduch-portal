import DeleteClient from "./delete-client"; // or whatever your client component is named

type Props = {
  params: Promise<{ delete_token: string }>;
};

export default async function DeletePage({ params }: Props) {
  // 1. Await the params (Next.js 15 requirement)
  const resolvedParams = await params;

  // 2. Extract the token
  const token = resolvedParams.delete_token;

  // 3. Pass it to the client component
  // Ensure your DeleteClient component accepts a prop named 'deleteToken'
  return <DeleteClient deleteToken={token} />;
}