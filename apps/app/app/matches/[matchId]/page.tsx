import { MatchDetailPageClient } from "./match-detail-page-client"

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ matchId: string }>
}) {
  const { matchId } = await params
  return <MatchDetailPageClient matchId={matchId} />
}
