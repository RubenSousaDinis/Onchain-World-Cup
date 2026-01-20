"use client"

import { useState } from "react"
import { Search, Flag } from "lucide-react"
import { RetroSidebar } from "@/components/retro-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { countries } from "@/lib/mock-data/countries-data"

export default function CountriesPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCountries = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.region.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Group by region
  const regions = Array.from(new Set(countries.map((c) => c.region)))
  const groupedCountries = regions.map((region) => ({
    region,
    countries: filteredCountries.filter((c) => c.region === region),
  }))

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        <RetroSidebar />
        <MobileNav />

        <main
          id="main-content"
          className="flex-1 lg:ml-24 p-4 lg:p-8 pb-20 lg:pb-8 max-w-full overflow-hidden"
        >
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Choose Your Country</h1>
            <p className="text-muted-foreground">
              Back your country in the qualification phase. Top 48 qualify for the tournament.
            </p>
          </div>

          {/* Search */}
          <div className="cm-panel p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search countries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-sm focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Countries grouped by region */}
          {groupedCountries.map(
            ({ region, countries: regionCountries }) =>
              regionCountries.length > 0 && (
                <div key={region} className="mb-8">
                  <h2 className="text-xl font-bold mb-4 cm-highlight">{region}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {regionCountries.map((country) => (
                      <div
                        key={country.code}
                        className="cm-panel p-4 hover:border-accent transition-colors"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="text-4xl">{country.flag}</div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg">{country.name}</h3>
                            <p className="text-sm text-muted-foreground">{country.code}</p>
                          </div>
                        </div>

                        <button className="w-full cm-nav-tab py-2 text-sm" disabled={true}>
                          Qualification Opens Soon
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
          )}

          {filteredCountries.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Flag className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No countries found matching "{searchQuery}"</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
