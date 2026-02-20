"use client"

import { useState } from "react"
import { CreateMatchForm } from "./create-match-form"
import { MatchStatusUpdater } from "./match-status-updater"

export function MatchesTab() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="space-y-6">
      <CreateMatchForm onCreated={() => setRefreshKey((k) => k + 1)} />
      <MatchStatusUpdater key={refreshKey} />
    </div>
  )
}
