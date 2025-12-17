import ManageClient from "./manage-client";

export default function ManagePage({
  params,
}: {
  params: { manage_token: string };
}) {
  return <ManageClient manageToken={params.manage_token} />;
}
