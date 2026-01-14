"use client"

interface NavTab {
  label: string
  value?: string
  href?: string
  disabled?: boolean
  className?: string
}

interface RetroNavTabsProps {
  tabs: NavTab[]
  activeTab: string
  onTabChange: (tab: string) => void
}

export function RetroNavTabs({ tabs, activeTab, onTabChange }: RetroNavTabsProps) {
  return (
    <div className="flex gap-1 mb-4 lg:mb-6 overflow-x-auto pb-2 scrollbar-hide max-w-full">
      {tabs.map((tab) => (
        <button
          key={tab.value || tab.label}
          onClick={() => !tab.disabled && onTabChange(tab.value || tab.label)}
          disabled={tab.disabled}
          className={`cm-nav-tab px-3 lg:px-6 py-2 lg:py-3 text-xs lg:text-sm font-bold uppercase tracking-wide whitespace-nowrap flex-shrink-0 ${
            activeTab === (tab.value || tab.label) ? "active" : ""
          } ${tab.disabled ? "opacity-40 cursor-not-allowed hover:bg-transparent" : ""} ${tab.className || ""}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
