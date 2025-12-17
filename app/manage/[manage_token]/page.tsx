import ManageClient from "./manage-client";

export default function Page({
  params,
}: {
  params: { manage_token: string };
}) {
  return <ManageClient manageToken={params.manage_token} />;
}
