import ManageClient from "./manage-client";

export default function Page({ params }: { params: { token: string } }) {
  return <ManageClient token={params.token} />;
}
