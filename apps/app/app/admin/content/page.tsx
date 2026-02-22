import type { Metadata } from "next"
import { ContentTab } from "@/components/admin/content-tab"

export const metadata: Metadata = {
  title: "Content Management — Onchain World Cup Admin",
  robots: { index: false, follow: false },
}

export default function AdminContentPage() {
  return <ContentTab />
}
