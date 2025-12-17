import DeleteClient from "./delete-client";

export default function Page({ params }: { params: { delete_token: string } }) {
  return <DeleteClient deleteToken={params.delete_token} />;
}
