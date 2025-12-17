import ManageClient from "./manage-client";

export default function Page({ params }: { params: { manage_token: string } }) {
  console.log("PAGE PARAMS =", params); // 👈 ADD THIS
  return <ManageClient manageToken={params.manage_token} />;
}
