"use client"

import type React from "react"

import { Search, X } from "lucide-react"
import { useState } from "react"

interface RetroSearchProps {
  placeholder?: string
  onSearch: (query: string) => void
  value?: string
}

export function RetroSearch({ placeholder = "Search teams...", onSearch, value = "" }: RetroSearchProps) {
  const [query, setQuery] = useState(value)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setQuery(newQuery)
    onSearch(newQuery)
  }

  const handleClear = () => {
    setQuery("")
    onSearch("")
  }

  return (
    <div className="relative">
      <div className="cm-panel rounded-sm flex items-center gap-2 px-3 py-2 border border-border focus-within:border-accent transition-colors">
        <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none font-mono"
        />
        {query && (
          <button
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
