# Leaderboards and Statistics

Comprehensive leaderboard system and platform statistics for the Onchain World Cup app.

## Overview

This document covers the implementation of two key features:
1. **Enhanced Leaderboards** - Multiple leaderboard categories with rankings and podium displays
2. **Platform Statistics** - Comprehensive analytics dashboard with charts and visualizations

Both features follow the Championship Manager 01/02 retro aesthetic and are fully responsive.

---

## Leaderboards

### Location
- **Page**: `/app/leaderboard/page.tsx`
- **Mock Data**: `/lib/mock-data/leaderboard-data.ts`
- **Route**: `/leaderboard`

### Features

#### 1. Multiple Categories

Users can switch between different leaderboard types:

##### Most Successful (Default)
- Ranks users by total winnings (ETH)
- Shows win rate percentage
- Displays total votes cast
- Highlights the best performing voters

##### Largest Votes
- Ranks users by their single largest vote
- Shows the match where the large vote was placed
- Displays which team they voted for
- Useful for tracking "whale" voters

##### Most Active
- Ranks users by total number of votes cast
- Shows number of matches participated in
- Displays win rate
- Identifies the most engaged community members

##### Early Birds
- Ranks users by Phase 1 votes (early participation)
- Highlights voters who took advantage of linear pricing
- Shows total votes for context
- Rewards early adopters

#### 2. Top 3 Podium Display

Each category features a prominent podium for the top 3 users:
- **1st Place**: Center position, larger avatar, gold border
- **2nd Place**: Left position, silver styling
- **3rd Place**: Right position, bronze styling

Responsive layout:
- Mobile: Stacked vertically (1st, 2nd, 3rd)
- Desktop: Podium layout (2nd, 1st, 3rd)

#### 3. Complete Rankings Table

Scrollable table showing all users:
- Rank with icons for top 3 (Trophy, Medal, TrendingUp)
- User avatar and name (or address)
- Category-specific metrics
- Hover effects and alternating row colors
- Link to user profile page

#### 4. Search Functionality

- Search by wallet address
- Search by Farcaster username
- Real-time filtering
- Shows "No results" state when search yields no matches

#### 5. Infinite Scroll

- Initially loads 10 users
- Automatically loads more as user scrolls
- Smooth loading states
- Prevents excessive initial data loading

### Data Structure

```typescript
interface LeaderboardEntry {
  rank: number
  address: string
  farcasterName: string | null
  farcasterAvatar: string | null
  totalWinnings: string  // ETH amount
  totalVotes: number
  totalBets: number
  winRate: number  // Percentage
  largestVote?: string  // For "Largest Votes" category
  phase1Votes?: number  // For "Early Birds" category
  matchName?: string  // For "Largest Votes" category
  team?: string  // For "Largest Votes" category
}
```

### Usage Example

```tsx
import { LeaderboardPage } from "@/app/leaderboard/page"

// Categories are handled internally with tabs
// Data is fetched from mock data (will be replaced with API)
```

### Category-Specific Table Columns

#### Most Successful
- Rank | User | Total Votes | Winnings | Win Rate

#### Largest Votes
- Rank | User | Largest Vote | Match | Team

#### Most Active
- Rank | User | Total Votes | Matches | Win Rate

#### Early Birds
- Rank | User | Phase 1 Votes | Total Votes | Winnings

---

## Platform Statistics

### Location
- **Page**: `/app/stats/page.tsx`
- **Mock Data**: `/lib/mock-data/statistics-data.ts`
- **Route**: `/stats`

### Features

#### 1. Key Metrics Grid

8 stat cards displaying platform-wide metrics:
- **Total ETH in Pools**: Current prize pools
- **Total ETH Wagered**: All-time wagered amount
- **Total Votes Cast**: Number of individual votes
- **Matches Created**: Total matches on platform
- **Unique Voters**: Number of distinct voters
- **Average Vote Size**: Mean ETH per vote
- **Phase 1 Votes**: Percentage of votes in Phase 1
- **Phase 2 Votes**: Percentage of votes in Phase 2

Uses the `StatCard` component from the dashboard library.

#### 2. Charts and Visualizations

##### ETH Wagered Over Time
- **Type**: Area chart
- **Data**: Last 7 days
- **Shows**: Cumulative ETH wagered
- **Color**: Accent (yellow/lime)
- **Features**: Hover tooltips, smooth gradient fill

##### Votes Per Day
- **Type**: Bar chart
- **Data**: Last 7 days
- **Shows**: Daily vote counts
- **Color**: Green
- **Features**: Hover tooltips, responsive bars

##### Top Countries by Votes
- **Type**: Horizontal bar chart
- **Data**: Top 5 countries
- **Shows**: Vote counts with country flags
- **Features**: Gradient bars, percentage-based width

##### Vote Distribution by Phase
- **Type**: Progress bars
- **Data**: Phase 1 vs Phase 2
- **Shows**: Percentage split
- **Colors**: Green (Phase 1), Accent (Phase 2)
- **Features**: Large percentage display, smooth animations

##### Platform Activity by Hour
- **Type**: Line chart
- **Data**: 24-hour pattern
- **Shows**: Votes per hour
- **Features**: SVG path rendering, gradient fill, time labels

#### 3. Additional Insights

Three insight panels providing context:

**Voting Insights**
- Most voted country
- Average votes per match
- Peak activity hour

**Financial Metrics**
- Largest single vote
- Prize pool growth rate
- Platform fees collected

**User Engagement**
- Average votes per user
- Returning user percentage
- New users today

### Data Structures

```typescript
interface PlatformStats {
  totalETHInPools: string
  totalETHWagered: string
  totalVotesCast: number
  matchesCreated: number
  uniqueVoters: number
  averageVoteSize: string
  phase1VotesPercent: number
  phase2VotesPercent: number
}

interface ChartDataPoint {
  label: string
  value: number
  displayValue?: string  // Optional formatted display
}
```

### Chart Components

All charts are custom-built using CSS and SVG to avoid heavy dependencies:

#### AreaChart
```tsx
<AreaChart
  data={ethOverTime}
  height={200}
  color="accent"
/>
```

#### BarChartComponent
```tsx
<BarChartComponent
  data={votesPerDay}
  height={200}
  color="green"
/>
```

#### HorizontalBarChart
```tsx
<HorizontalBarChart
  data={topCountriesByVotes}
  height={250}
/>
```

#### LineChart
```tsx
<LineChart
  data={activityByHour}
  height={200}
/>
```

### Chart Features

All charts include:
- **Responsive design**: Adapts to container width
- **Hover tooltips**: Shows exact values on hover
- **Smooth animations**: CSS transitions for visual appeal
- **Accessibility**: Proper ARIA labels and semantic markup
- **Performance**: Lightweight, no external chart libraries

---

## Navigation Integration

Both pages are accessible via navigation:

### Desktop Sidebar
- **Leaderboard**: Users icon, "Leaderboard" label
- **Statistics**: BarChart3 icon, "Statistics" label

### Mobile Bottom Nav
- **Leaderboard**: Users icon, "Leaders" label
- **Statistics**: BarChart3 icon, "Stats" label

---

## Responsive Design

### Breakpoints
- **Mobile**: < 1024px
- **Desktop**: ≥ 1024px

### Mobile Optimizations

**Leaderboards**:
- Stacked podium layout
- Condensed table columns
- Touch-friendly tap targets
- Compact search bar

**Statistics**:
- Stacked chart grid (1 column)
- Simplified chart labels
- Larger touch targets
- Condensed metric cards

### Desktop Enhancements

**Leaderboards**:
- Podium layout (2nd-1st-3rd)
- Full table with all columns
- Larger avatar sizes
- More detailed information

**Statistics**:
- 2-column chart grid
- Full chart labels and axes
- Expanded metric cards
- More detailed tooltips

---

## Color Scheme

Following CM 01/02 aesthetic:

**Accent Colors**:
- Primary: Yellow/Lime (`cm-highlight`)
- Secondary: Blue accent (`text-accent`)
- Success: Green (`text-green-500`)
- Error: Red (`text-red-500`)

**Chart Colors**:
- ETH/Financial: Accent (yellow/lime)
- Votes/Activity: Green
- Phase 1: Green
- Phase 2: Accent

---

## Accessibility

### ARIA Labels
- All icons marked `aria-hidden="true"`
- Proper navigation landmarks
- Screen reader friendly labels
- Clear focus indicators

### Keyboard Navigation
- All interactive elements focusable
- Logical tab order
- Keyboard shortcuts for tabs

### Color Contrast
- WCAG AA compliant
- High contrast text
- Distinct hover states

---

## Performance

### Optimization Strategies

**Leaderboards**:
- Infinite scroll (lazy loading)
- Virtual scrolling ready
- Debounced search
- Efficient re-renders

**Statistics**:
- CSS-based charts (no heavy libraries)
- Memoized chart components
- Lazy loading for charts
- Optimized SVG rendering

### Bundle Size
- No external chart libraries
- Lightweight custom charts
- Shared dashboard components
- Tree-shakeable exports

---

## Future Enhancements

### Leaderboards
- [ ] Real-time updates via WebSocket
- [ ] User profile pages
- [ ] Achievement badges
- [ ] Historical rankings
- [ ] Export to CSV
- [ ] Share leaderboard position

### Statistics
- [ ] Date range selector
- [ ] More chart types (pie, scatter)
- [ ] Downloadable reports
- [ ] Comparison views
- [ ] Live activity feed
- [ ] Advanced filtering

---

## Integration with Backend

### API Endpoints (To Be Implemented)

**Leaderboards**:
```typescript
GET /api/leaderboard?category=successful&limit=10&offset=0
GET /api/leaderboard?category=largest&limit=10&offset=0
GET /api/leaderboard?category=active&limit=10&offset=0
GET /api/leaderboard?category=early&limit=10&offset=0
```

**Statistics**:
```typescript
GET /api/stats/platform
GET /api/stats/eth-over-time?days=7
GET /api/stats/votes-per-day?days=7
GET /api/stats/top-countries?limit=10
GET /api/stats/activity-by-hour
```

### Real-Time Updates

Will use:
- WebSocket connections for live updates
- Optimistic UI updates
- Background data refresh
- Event-driven architecture

---

## Testing

### Unit Tests
```tsx
// Test leaderboard category switching
test("switches between leaderboard categories", () => {
  render(<LeaderboardPage />)
  fireEvent.click(screen.getByText("Largest Votes"))
  expect(screen.getByText("Largest Vote")).toBeInTheDocument()
})

// Test search functionality
test("filters users by search query", () => {
  render(<LeaderboardPage />)
  fireEvent.change(screen.getByPlaceholderText("Search..."), {
    target: { value: "cryptoking" }
  })
  expect(screen.getByText("cryptoking.eth")).toBeInTheDocument()
})

// Test chart rendering
test("renders ETH over time chart", () => {
  render(<StatsPage />)
  expect(screen.getByText("ETH Wagered Over Time")).toBeInTheDocument()
})
```

### Integration Tests
- Test navigation between pages
- Test data loading states
- Test error states
- Test responsive behavior

---

## Deployment Notes

### Environment Variables
None required for MVP (uses mock data)

### Build Considerations
- Ensure chart SVGs render correctly
- Test on different screen sizes
- Verify infinite scroll performance
- Check accessibility with screen readers

---

## Related Documentation

- [Dashboard Components](./DASHBOARD_COMPONENTS.md) - Shared UI components
- [Tournament Structure](./database/TOURNAMENT_STRUCTURE.md) - Data model
- [Phase 2 Requirements](../features/phase-2-ui-ux.md) - Original specifications

---

**Last Updated**: January 2026
**Version**: 1.0
**Status**: Ready for Backend Integration
