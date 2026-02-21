"use client"

import { useState } from "react"
import { CreateGroupSchedule } from "./create-group-schedule"
import { CreateMatchForm } from "./create-match-form"
import { MatchStatusUpdater } from "./match-status-updater"

export function MatchesTab() {
  const [refreshKey, setRefreshKey] = useState(0)
  const refresh = () => setRefreshKey((k) => k + 1)

  return (
    <div className="space-y-6">
      <CreateGroupSchedule onCreated={refresh} />
      <CreateMatchForm onCreated={refresh} />
      <MatchStatusUpdater key={refreshKey} />
    </div>
  )
}
