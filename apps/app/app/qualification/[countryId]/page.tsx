import { CountryDetailPageClient } from "./country-detail-page-client"

export default async function CountryDetailPage({
  params,
}: {
  params: Promise<{ countryId: string }>
}) {
  const { countryId } = await params
  return <CountryDetailPageClient countryId={countryId} />
}
