# Dashboard Components

Reusable dashboard UI components with Championship Manager 01/02 styling for the Onchain World Cup app.

## Overview

The dashboard components library provides a consistent set of UI elements for building dashboards and information displays across the application. All components follow the CM 01/02 retro aesthetic and are fully responsive with built-in accessibility features.

## Components

### StatCard

Display statistical information with an icon and label.

#### Props

```typescript
interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  valueColor?: "default" | "accent" | "green" | "red"
  formatValue?: boolean  // Auto-format numbers with toLocaleString()
  className?: string
}
```

#### Usage

```tsx
import { StatCard } from "@/components/dashboard"
import { Users } from "lucide-react"

<StatCard
  icon={Users}
  label="Active Voters"
  value={1247}
  formatValue
/>

<StatCard
  icon={Trophy}
  label="Prize Pool"
  value="125.8 ETH"
  valueColor="accent"
/>
```

#### Features

- Icon with configurable color
- Formatted or raw number display
- Responsive text sizing (xl on mobile, 2xl on desktop)
- Monospace font for values
- CM 01/02 panel styling

---

### SectionCard

Panel component with header, content, and optional footer sections.

#### Props

```typescript
interface SectionCardProps {
  title: string
  children: ReactNode
  headerAction?: {
    label: string
    href: string
  }
  footer?: ReactNode
  className?: string
}
```

#### Usage

```tsx
import { SectionCard } from "@/components/dashboard"

<SectionCard
  title="Top 5 Countries"
  headerAction={{ label: "View All", href: "/qualification" }}
  footer={
    <button className="w-full cm-nav-tab py-3 rounded-sm font-bold uppercase">
      Vote Now
    </button>
  }
>
  <div className="space-y-3">
    {/* Content */}
  </div>
</SectionCard>
```

#### Features

- Header with title and optional action link
- Flexible content area
- Optional footer for CTAs or additional info
- Automatic header/footer borders
- Accent-colored header background

---

### CountdownTimer

Live countdown timer with days, hours, minutes, and optional seconds.

#### Props

```typescript
interface CountdownTimerProps {
  endDate?: Date                    // Future implementation
  initialTime?: {
    days: number
    hours: number
    minutes: number
    seconds: number
  }
  showSeconds?: boolean              // Default: true
  className?: string
}
```

#### Usage

```tsx
import { CountdownTimer } from "@/components/dashboard"

{/* With seconds (default) */}
<CountdownTimer />

{/* Without seconds */}
<CountdownTimer showSeconds={false} />

{/* Custom initial time */}
<CountdownTimer
  initialTime={{ days: 7, hours: 12, minutes: 30, seconds: 0 }}
/>
```

#### Features

- Auto-updates every second
- Responsive sizing (2xl on mobile, 3xl on desktop)
- Countdown stops at zero
- Cleanup on unmount
- Colon separators between units
- Highlighted values with muted labels

---

### InfoBanner

Informational banner for announcements, warnings, or tips.

#### Props

```typescript
interface InfoBannerProps {
  icon: LucideIcon
  title: string
  description: string | ReactNode
  variant?: "default" | "accent" | "warning" | "success"
  action?: ReactNode
  className?: string
}
```

#### Usage

```tsx
import { InfoBanner } from "@/components/dashboard"
import { Zap, AlertTriangle } from "lucide-react"
import Link from "next/link"

<InfoBanner
  icon={Zap}
  title="Early Voting Advantage"
  description="Vote prices increase as more people vote. Get better prices by voting early!"
  action={
    <Link href="/how-it-works" className="text-xs text-accent font-bold">
      Learn More
    </Link>
  }
/>

<InfoBanner
  icon={AlertTriangle}
  variant="warning"
  title="Voting Ends Soon"
  description="Only 2 hours remaining to place your votes!"
/>
```

#### Variants

- **default/accent**: Blue accent colors (CM highlight yellow)
- **warning**: Yellow colors for cautions
- **success**: Green colors for confirmations

#### Features

- Icon with variant-specific coloring
- Title and description
- Optional action slot (links, buttons)
- Bordered panel with variant-specific styling
- Responsive padding

---

### QuickActionCard

Clickable action card with icon, title, and description.

#### Props

```typescript
interface QuickActionCardProps {
  icon: LucideIcon
  title: string
  description: string
  href: string
  variant?: "default" | "primary" | "disabled"
  onClick?: (e: React.MouseEvent) => void
  className?: string
}
```

#### Usage

```tsx
import { QuickActionCard } from "@/components/dashboard"
import { Trophy, Zap, Clock } from "lucide-react"

<QuickActionCard
  icon={Trophy}
  title="Vote for Qualification"
  description="Support your country to qualify for the tournament"
  href="/qualification"
  variant="primary"
/>

<QuickActionCard
  icon={Zap}
  title="My Votes"
  description="View your voting history"
  href="/my-bets"
/>

<QuickActionCard
  icon={Clock}
  title="Match Schedule"
  description="Available after qualification phase"
  href="/schedule"
  variant="disabled"
/>
```

#### Variants

- **default**: Secondary background, muted icon
- **primary**: Accent background/border, highlighted title
- **disabled**: Grayed out, non-clickable

#### Features

- Hover effects (except disabled)
- Icon and text layout
- Link component (Next.js)
- Disabled state prevents clicks
- Responsive sizing

---

### TopListItem

List item component for rankings and leaderboards.

#### Props

```typescript
interface TopListItemProps {
  rank: number
  icon?: ReactNode           // Emoji, image, or component
  title: string
  subtitle?: string
  value: string | number
  valueLabel?: string
  href?: string
  highlighted?: boolean      // Highlight rank number
  className?: string
}
```

#### Usage

```tsx
import { TopListItem } from "@/components/dashboard"

<TopListItem
  rank={1}
  icon="🇧🇷"
  title="Brazil"
  value={2500}
  valueLabel="votes"
  href="/qualification"
  highlighted
/>

<TopListItem
  rank={5}
  icon={<TrophyIcon />}
  title="Player Name"
  subtitle="0x1234...5678"
  value="45.8 ETH"
  href="/users/0x1234"
/>
```

#### Features

- Rank number (with optional highlighting)
- Flexible icon slot (emoji, image, component)
- Title and optional subtitle
- Value with optional label
- Clickable (when href provided)
- Hover effects
- Text truncation for long titles
- Responsive spacing

---

### EmptyState

Placeholder component for empty data states.

#### Props

```typescript
interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
  className?: string
}
```

#### Usage

```tsx
import { EmptyState } from "@/components/dashboard"
import { Award, Trophy } from "lucide-react"
import Link from "next/link"

<EmptyState
  icon={Award}
  title="No votes yet"
  description="Start voting to appear on the leaderboard"
  action={
    <Link href="/qualification" className="cm-nav-tab px-4 py-2 rounded-sm">
      Start Voting
    </Link>
  }
/>

<EmptyState
  icon={Trophy}
  title="No matches available"
  description="Check back after the qualification phase"
/>
```

#### Features

- Large centered icon (accent color, 50% opacity)
- Title and description text
- Optional action slot for CTAs
- Centered layout
- Padding for spacing

---

## Usage Examples

### Dashboard Page

```tsx
import {
  StatCard,
  SectionCard,
  CountdownTimer,
  InfoBanner,
  QuickActionCard,
  TopListItem,
  EmptyState,
} from "@/components/dashboard"

export default function DashboardPage() {
  return (
    <main className="p-4 lg:p-8">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Active Users" value={1247} formatValue />
        <StatCard icon={Trophy} label="Prize Pool" value="125.8 ETH" valueColor="accent" />
        <StatCard icon={TrendingUp} label="Total Votes" value={48750} formatValue valueColor="green" />
        <StatCard icon={Clock} label="Time Left" value="30d" />
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard
          title="Top Countries"
          headerAction={{ label: "View All", href: "/all" }}
        >
          <div className="space-y-3">
            {countries.map((c) => (
              <TopListItem
                key={c.rank}
                rank={c.rank}
                icon={c.flag}
                title={c.name}
                value={c.votes}
                valueLabel="votes"
                highlighted
              />
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Quick Actions">
          <div className="space-y-3">
            <QuickActionCard
              icon={Trophy}
              title="Vote Now"
              description="Support your favorite team"
              href="/vote"
              variant="primary"
            />
            <QuickActionCard
              icon={Zap}
              title="My Votes"
              description="View voting history"
              href="/my-votes"
            />
          </div>
        </SectionCard>
      </div>

      {/* Info Banner */}
      <InfoBanner
        icon={Zap}
        title="Special Offer"
        description="Early voters get 20% better odds!"
        variant="accent"
        className="mt-8"
      />
    </main>
  )
}
```

### Stats Grid with Different Colors

```tsx
<div className="grid grid-cols-4 gap-4">
  <StatCard
    icon={Users}
    label="Active"
    value={1234}
    valueColor="default"
    formatValue
  />
  <StatCard
    icon={TrendingUp}
    label="Growth"
    value={567}
    valueColor="green"
    formatValue
  />
  <StatCard
    icon={TrendingDown}
    label="Losses"
    value={89}
    valueColor="red"
    formatValue
  />
  <StatCard
    icon={Trophy}
    label="Prize"
    value="1.5 ETH"
    valueColor="accent"
  />
</div>
```

### Empty State with Actions

```tsx
<SectionCard title="My Votes">
  <EmptyState
    icon={Trophy}
    title="No votes yet"
    description="Place your first vote to get started"
    action={
      <Link
        href="/vote"
        className="inline-flex items-center gap-2 cm-nav-tab px-4 py-2 rounded-sm font-bold"
      >
        <Trophy className="w-4 h-4" />
        Start Voting
      </Link>
    }
  />
</SectionCard>
```

## Design Patterns

### Consistent Spacing

```tsx
{/* Card grids */}
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">

{/* Section spacing */}
<div className="space-y-3">

{/* Page margins */}
<main className="p-4 lg:p-8 pb-20 lg:pb-8">
```

### Responsive Classes

All components use responsive sizing:
- Text: `text-xs lg:text-sm`, `text-xl lg:text-2xl`
- Icons: `w-4 h-4`, `w-5 h-5 lg:w-6 lg:h-6`
- Padding: `p-4 lg:p-6`, `gap-3 lg:gap-4`
- Grids: `grid-cols-2 lg:grid-cols-4`

### Color Variants

- **CM Highlight**: Yellow/lime accent (`cm-highlight`)
- **Accent**: Secondary accent color (`text-accent`)
- **Green**: Success/growth (`text-green-500`)
- **Red**: Error/loss (`text-red-500`, `text-destructive`)
- **Muted**: Secondary text (`text-muted-foreground`)

## Accessibility

All components include:
- **Semantic HTML**: Proper heading hierarchy
- **ARIA Labels**: Icons marked `aria-hidden="true"`
- **Keyboard Navigation**: All interactive elements focusable
- **Focus Visible**: Yellow outline on focus
- **Color Contrast**: WCAG AA compliant
- **Screen Reader**: Descriptive labels

## TypeScript

All components are fully typed with TypeScript interfaces. Import types from component files if needed:

```tsx
import type { StatCardProps } from "@/components/dashboard/stat-card"
import type { SectionCardProps } from "@/components/dashboard/section-card"
```

## Styling

Components use:
- **Tailwind CSS**: Utility-first styling
- **CM 01/02 Classes**: `cm-panel`, `cm-highlight`, `cm-nav-tab`
- **Consistent Patterns**: Shared spacing, colors, typography
- **Dark Mode**: All components support dark mode automatically

## Performance

- **Lightweight**: Minimal dependencies (only Lucide icons)
- **Memoization**: Use React.memo() for list items if needed
- **Tree-shaking**: Barrel exports allow individual imports
- **No Client State**: Most components are pure/stateless (except CountdownTimer)

## Future Enhancements

Potential additions:
- **ChartCard**: Data visualization component
- **ProgressCard**: Progress bar with stats
- **NotificationCard**: Notification/alert component
- **FilterCard**: Filter controls panel
- **PaginationControls**: Pagination component
- **LoadingCard**: Loading skeleton states

## Testing

Example test for StatCard:

```tsx
import { render, screen } from "@testing-library/react"
import { StatCard } from "@/components/dashboard"
import { Users } from "lucide-react"

test("renders stat card with formatted value", () => {
  render(
    <StatCard
      icon={Users}
      label="Active Users"
      value={1234}
      formatValue
    />
  )

  expect(screen.getByText("Active Users")).toBeInTheDocument()
  expect(screen.getByText("1,234")).toBeInTheDocument()
})
```

---

**Need help?** Check the home page implementation (`apps/app/app/page.tsx`) for real-world usage examples.
