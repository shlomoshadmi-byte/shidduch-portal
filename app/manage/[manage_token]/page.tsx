import ManageClient from "./manage-client";

// Define the type for the params promise
type Props = {
  params: Promise<{ manage_token: string }>;
};

export default async function Page({ params }: Props) {
  // 1. Await the params to handle the Promise (Next.js 15 requirement)
  const resolvedParams = await params;
  
  // 2. Extract the token
  const token = resolvedParams.manage_token;

  // 3. Pass it to the client component
  return <ManageClient manageToken={token} />;
}