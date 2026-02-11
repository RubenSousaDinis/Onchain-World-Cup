import { TeamDetailPageClient } from "./team-detail-page-client"

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ teamId: string }>
}) {
  const { teamId } = await params
  return <TeamDetailPageClient teamId={teamId} />
}
