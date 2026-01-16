# State Components

This directory provides a comprehensive set of UI state components for the Onchain World Cup app. These components handle loading, error, and empty states with consistent styling that matches the CM 01/02 retro aesthetic.

## Components Overview

### Loading States (`loading-states.tsx`)

Components for displaying loading states throughout the app.

#### `PageLoader`
Full-page loading spinner for page-level loading states.

```tsx
import { PageLoader } from "@/components/states"

export default function Page() {
  const { data, isLoading } = useQuery()

  if (isLoading) return <PageLoader />

  return <div>{/* content */}</div>
}
```

#### `CardSkeleton`
Animated skeleton loader for card-based layouts.

```tsx
import { CardSkeleton } from "@/components/states"

export function CountryCard({ country, isLoading }) {
  if (isLoading) return <CardSkeleton />

  return <div className="cm-panel">{/* country content */}</div>
}
```

#### `TableSkeleton`
Configurable skeleton loader for tables with customizable row count.

```tsx
import { TableSkeleton } from "@/components/states"

export function LeaderboardTable({ data, isLoading }) {
  if (isLoading) return <TableSkeleton rows={10} />

  return <table>{/* table content */}</table>
}
```

#### `ButtonLoader`
Small spinner for button loading states.

```tsx
import { ButtonLoader } from "@/components/states"

export function VoteButton({ isVoting }) {
  return (
    <button disabled={isVoting}>
      {isVoting ? <ButtonLoader /> : "Vote"}
    </button>
  )
}
```

#### `InlineLoader`
Inline loading indicator with customizable text.

```tsx
import { InlineLoader } from "@/components/states"

export function DataFetcher() {
  return (
    <div>
      <InlineLoader text="Loading votes..." />
    </div>
  )
}
```

---

### Error States (`error-states.tsx`)

Components for displaying error and warning states.

#### `ErrorState`
Flexible error display component with retry functionality.

```tsx
import { ErrorState } from "@/components/states"

export function DataView({ error, refetch }) {
  if (error) {
    return (
      <ErrorState
        title="Failed to Load Data"
        message="We couldn't fetch the latest data. Please try again."
        onRetry={refetch}
        type="error" // or "warning" or "offline"
      />
    )
  }

  return <div>{/* content */}</div>
}
```

**Props:**
- `title` (optional): Error heading
- `message`: Error description
- `onRetry` (optional): Callback for retry button
- `type` (optional): "error" | "warning" | "offline"

#### `PageError`
Full-page error view for page-level errors.

```tsx
import { PageError } from "@/components/states"

export default function Page() {
  const { data, error, refetch } = useQuery()

  if (error) {
    return <PageError message="Failed to load page" onRetry={refetch} />
  }

  return <div>{/* content */}</div>
}
```

#### `InlineError`
Compact inline error message for form validation or inline errors.

```tsx
import { InlineError } from "@/components/states"

export function VoteForm({ error }) {
  return (
    <form>
      {/* form fields */}
      {error && <InlineError message={error.message} />}
    </form>
  )
}
```

#### `WarningBanner`
Yellow warning banner for non-critical alerts.

```tsx
import { WarningBanner } from "@/components/states"

export function VotingSection() {
  return (
    <div>
      <WarningBanner message="Voting fees increase over time. Vote early for better prices!" />
      {/* content */}
    </div>
  )
}
```

---

### Empty States (`empty-states.tsx`)

Components for displaying empty data states with helpful CTAs.

#### `EmptyState`
Base empty state component that can be customized for any scenario.

```tsx
import { EmptyState } from "@/components/states"
import { Trophy } from "lucide-react"

export function CustomEmpty() {
  return (
    <EmptyState
      icon={<Trophy className="w-16 h-16" />}
      title="No Tournaments Yet"
      description="There are no active tournaments right now."
      action={{
        label: "Create Tournament",
        onClick: () => console.log("Create")
      }}
    />
  )
}
```

**Props:**
- `icon` (optional): React node for icon display
- `title`: Heading text
- `description`: Explanation text
- `action` (optional): Object with `label` and either `href` or `onClick`

#### `NoVotesEmpty`
Pre-configured empty state for users with no votes.

```tsx
import { NoVotesEmpty } from "@/components/states"

export function MyVotes({ votes }) {
  if (votes.length === 0) return <NoVotesEmpty />

  return <div>{/* votes list */}</div>
}
```

#### `NoMatchesEmpty`
Empty state for when no matches are available.

```tsx
import { NoMatchesEmpty } from "@/components/states"

export function MatchesList({ matches }) {
  if (matches.length === 0) return <NoMatchesEmpty />

  return <div>{/* matches */}</div>
}
```

#### `NoSearchResults`
Empty state for search with no results.

```tsx
import { NoSearchResults } from "@/components/states"

export function SearchResults({ results, query }) {
  if (results.length === 0) return <NoSearchResults query={query} />

  return <div>{/* results */}</div>
}
```

#### `NoClaimablePayouts`
Empty state for users with no claimable rewards.

```tsx
import { NoClaimablePayouts } from "@/components/states"

export function PayoutsPage({ payouts }) {
  if (payouts.length === 0) return <NoClaimablePayouts />

  return <div>{/* payouts */}</div>
}
```

#### `NoLeaderboardData`
Empty state for leaderboard when no data is available.

```tsx
import { NoLeaderboardData } from "@/components/states"

export function Leaderboard({ data }) {
  if (!data || data.length === 0) return <NoLeaderboardData />

  return <div>{/* leaderboard */}</div>
}
```

---

## Design System

All state components follow the CM 01/02 retro aesthetic:

- **Colors**: Uses primary, accent, and muted colors from the theme
- **Panels**: `.cm-panel` class for retro-styled containers
- **Typography**: `.cm-highlight` class for emphasized text
- **Buttons**: `.cm-nav-tab` class for action buttons
- **Icons**: Lucide React icons for consistent iconography

## Best Practices

### Loading States
- Use `PageLoader` for initial page loads
- Use `CardSkeleton` or `TableSkeleton` for component-level loading
- Use `ButtonLoader` for action button states
- Use `InlineLoader` for small data fetches

### Error States
- Always provide retry functionality when possible
- Use `PageError` for critical page-level errors
- Use `InlineError` for form validation and non-critical errors
- Use `WarningBanner` for important but non-blocking messages

### Empty States
- Provide clear next steps (CTAs) when appropriate
- Use descriptive, friendly messaging
- Include relevant icons to improve visual communication
- Link to actions that help users get started

## Accessibility

All components include:
- Proper ARIA labels where needed
- Keyboard navigation support
- Color contrast meeting WCAG AA standards
- Screen reader friendly content

## Examples

### Complete Data Fetching Pattern

```tsx
import {
  PageLoader,
  PageError,
  NoVotesEmpty,
} from "@/components/states"

export function MyVotesPage() {
  const { data: votes, isLoading, error, refetch } = useVotes()

  if (isLoading) return <PageLoader />
  if (error) return <PageError message={error.message} onRetry={refetch} />
  if (!votes || votes.length === 0) return <NoVotesEmpty />

  return (
    <div>
      {votes.map(vote => (
        <VoteCard key={vote.id} vote={vote} />
      ))}
    </div>
  )
}
```

### Form with Inline States

```tsx
import { ButtonLoader, InlineError } from "@/components/states"

export function VoteForm() {
  const [error, setError] = useState(null)
  const { mutate, isPending } = useVote()

  return (
    <form onSubmit={handleSubmit}>
      <input type="number" />
      {error && <InlineError message={error} />}
      <button disabled={isPending}>
        {isPending ? <ButtonLoader /> : "Submit Vote"}
      </button>
    </form>
  )
}
```

---

## Related Issues

This documentation and index file closes:
- **#31**: Phase 2: UI/UX Foundation & App Initialization - 2.11 Create Loading States
- **#32**: Phase 2: UI/UX Foundation & App Initialization - 2.12 Create Error States
- **#33**: Phase 2: UI/UX Foundation & App Initialization - 2.13 Create Empty States

All components were implemented with comprehensive coverage of common UI state patterns and full integration with the app's design system.
