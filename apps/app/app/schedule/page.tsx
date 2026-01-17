"use client"

import { RetroSidebar } from "@/components/retro-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { Calendar, MapPin, Clock } from "lucide-react"

const mockSchedule = [
  {
    date: "June 11, 2026",
    matches: [
      {
        time: "11:00 AM",
        team1: "USA",
        team2: "Wales",
        team1Flag: "🇺🇸",
        team2Flag: "🏴",
        stadium: "Rose Bowl, LA",
        group: "A",
      },
      {
        time: "2:00 PM",
        team1: "Senegal",
        team2: "Netherlands",
        team1Flag: "🇸🇳",
        team2Flag: "🇳🇱",
        stadium: "MetLife Stadium, NY",
        group: "A",
      },
      {
        time: "5:00 PM",
        team1: "England",
        team2: "Iran",
        team1Flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
        team2Flag: "🇮🇷",
        stadium: "SoFi Stadium, LA",
        group: "B",
      },
    ],
  },
  {
    date: "June 12, 2026",
    matches: [
      {
        time: "11:00 AM",
        team1: "Argentina",
        team2: "Saudi Arabia",
        team1Flag: "🇦🇷",
        team2Flag: "🇸🇦",
        stadium: "AT&T Stadium, Dallas",
        group: "C",
      },
      {
        time: "2:00 PM",
        team1: "Mexico",
        team2: "Poland",
        team1Flag: "🇲🇽",
        team2Flag: "🇵🇱",
        stadium: "Arrowhead Stadium, KC",
        group: "C",
      },
      {
        time: "5:00 PM",
        team1: "France",
        team2: "Australia",
        team1Flag: "🇫🇷",
        team2Flag: "🇦🇺",
        stadium: "Levi's Stadium, SF",
        group: "D",
      },
    ],
  },
  {
    date: "June 13, 2026",
    matches: [
      {
        time: "11:00 AM",
        team1: "Germany",
        team2: "Japan",
        team1Flag: "🇩🇪",
        team2Flag: "🇯🇵",
        stadium: "Gillette Stadium, Boston",
        group: "E",
      },
      {
        time: "2:00 PM",
        team1: "Spain",
        team2: "Costa Rica",
        team1Flag: "🇪🇸",
        team2Flag: "🇨🇷",
        stadium: "Mercedes-Benz, Atlanta",
        group: "E",
      },
      {
        time: "5:00 PM",
        team1: "Brazil",
        team2: "Serbia",
        team1Flag: "🇧🇷",
        team2Flag: "🇷🇸",
        stadium: "Hard Rock Stadium, Miami",
        group: "G",
      },
    ],
  },
]

export default function SchedulePage() {
  return (
    <div className="min-h-screen flex">
      <RetroSidebar />
      <MobileNav />

      <main className="flex-1 lg:ml-24 p-4 lg:p-8 pb-20 lg:pb-8">
        <div className="cm-panel rounded-sm overflow-hidden mb-6 lg:mb-8">
          <div className="soccer-field-bg p-4 lg:p-6">
            <h1 className="text-2xl lg:text-4xl font-bold mb-2">
              <span className="cm-highlight">Match Schedule</span>
            </h1>
            <p className="text-xs lg:text-sm text-foreground/80">World Cup 2026 fixtures, venues, and match times</p>
          </div>
        </div>

        <div className="space-y-6 lg:space-y-8">
          {mockSchedule.map((day, dayIndex) => (
            <div key={dayIndex}>
              <div className="cm-panel rounded-sm overflow-hidden mb-3 lg:mb-4">
                <div className="bg-secondary/40 px-4 py-3 border-b-2 border-accent/30 flex items-center gap-3">
                  <Calendar className="w-4 lg:w-5 h-4 lg:h-5 text-accent" />
                  <h2 className="text-lg lg:text-xl font-bold cm-highlight">{day.date}</h2>
                  <span className="text-xs text-muted-foreground ml-auto">{day.matches.length} Matches</span>
                </div>
              </div>

              <div className="grid gap-3 lg:gap-4">
                {day.matches.map((match, matchIndex) => (
                  <div key={matchIndex} className="cm-panel rounded-sm overflow-hidden">
                    <div className="bg-secondary/30 px-3 lg:px-4 py-2 border-b border-border flex flex-col lg:flex-row lg:items-center justify-between gap-2 lg:gap-0">
                      <div className="flex items-center gap-2 lg:gap-3">
                        <Clock className="w-3 lg:w-3.5 h-3 lg:h-3.5 cm-highlight" />
                        <span className="text-xs font-mono cm-highlight font-bold">{match.time} ET</span>
                        <span className="bg-card px-2 py-0.5 rounded-sm text-xs lg:text-xs font-bold cm-highlight border border-accent/30">
                          Group {match.group}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs lg:text-xs text-foreground/70">
                        <MapPin className="w-3 lg:w-3.5 h-3 lg:h-3.5 text-accent" />
                        <span className="truncate font-mono">{match.stadium}</span>
                      </div>
                    </div>

                    <div className="p-3 lg:p-4 bg-secondary/10">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-6 flex-1">
                          {/* Team 1 */}
                          <div className="flex items-center gap-3 flex-1 bg-card/30 p-2 rounded-sm">
                            <span className="text-3xl lg:text-5xl">{match.team1Flag}</span>
                            <span className="text-base lg:text-xl font-bold text-foreground">{match.team1}</span>
                          </div>

                          {/* VS */}
                          <div className="bg-secondary px-4 py-2 rounded-sm text-center self-center">
                            <span className="text-xs lg:text-sm font-bold cm-highlight">VS</span>
                          </div>

                          {/* Team 2 */}
                          <div className="flex items-center gap-3 flex-1 lg:justify-end bg-card/30 p-2 rounded-sm">
                            <span className="text-base lg:text-xl font-bold text-foreground">{match.team2}</span>
                            <span className="text-3xl lg:text-5xl">{match.team2Flag}</span>
                          </div>
                        </div>

                        <button className="w-full lg:w-auto lg:ml-6 bg-secondary hover:bg-secondary/80 text-foreground px-4 lg:px-6 py-2 lg:py-3 rounded-sm text-xs lg:text-sm font-bold uppercase hover:scale-105 transition-transform border border-accent/30">
                          Vote Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
