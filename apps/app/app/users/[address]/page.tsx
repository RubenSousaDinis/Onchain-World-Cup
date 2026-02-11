import { UserProfilePageClient } from "./user-profile-page-client"

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ address: string }>
}) {
  const { address } = await params
  return <UserProfilePageClient address={address} />
}
