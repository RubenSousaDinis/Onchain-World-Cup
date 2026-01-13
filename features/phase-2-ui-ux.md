# Phase 2: UI/UX Foundation & App Initialization

## Overview
Build the foundational user interface, design system, and app initialization logic. This phase establishes the UI framework that will later be connected to blockchain functionality. Focus on responsive design, component structure, and context-aware rendering for both desktop and Farcaster environments.

## Sub-tasks

### 2.1 App Initialization System
File: `app/layout.tsx`

This is critical for preventing infinite splash screen in Farcaster.

#### Root Layout Setup
- [ ] Detect context (desktop vs Farcaster)
- [ ] Initialize Farcaster SDK if in Farcaster context
- [ ] Call `sdk.actions.ready()` after app is ready to display
- [ ] Show loading state during initialization
- [ ] Handle initialization errors
- [ ] Set up global providers:
  - Wallet provider
  - Farcaster provider
  - Theme provider (if using)

#### Initialization Hook
File: `hooks/useAppInitialization.ts`

- [ ] Detect environment on mount
- [ ] Initialize appropriate services
- [ ] Call Farcaster SDK ready() when initialized
- [ ] Return initialization status
- [ ] Handle errors gracefully

### 2.2 Design System Setup

#### Theme Configuration
File: `styles/theme.ts`

- [ ] Define color palette
- [ ] Set up typography scale
- [ ] Configure spacing system
- [ ] Define breakpoints for responsive design
- [ ] Create component variants
- [ ] Support for both desktop and Farcaster contexts

#### Global Styles
File: `styles/globals.css`

- [ ] Reset/normalize CSS
- [ ] Base typography
- [ ] Color variables
- [ ] Responsive utilities
- [ ] Animation utilities

#### Component Library
- [ ] Choose UI library (shadcn/ui, MUI, or custom)
- [ ] Configure components
- [ ] Customize for World Cup theme
- [ ] Ensure mobile-friendly

### 2.3 Create Responsive Layout
File: `components/Layout.tsx`

- [ ] Navigation header
- [ ] Main content area
- [ ] Footer
- [ ] Responsive sidebar (desktop only)
- [ ] Mobile-optimized for Farcaster
- [ ] Sticky navigation
- [ ] Loading states

### 2.4 Build Match Card Component
File: `components/MatchCard.tsx`

This is a core component displayed throughout the app.

#### Match Card Design
- [ ] Display team names and flags
  - Team A on left
  - Team B on right
  - Flags prominently displayed
- [ ] Show current vote price with phase indicator
- [ ] Display total ETH per team
  - Visual bar showing proportion
  - Exact ETH amounts
- [ ] Show vote button with exact cost
- [ ] Display voting deadline countdown
  - "X hours Y minutes remaining"
  - Color-coded urgency (green → yellow → red)
- [ ] Phase indicator
  - "Phase 1: Linear" or "Phase 2: Exponential"
  - Visual differentiation
- [ ] Show winner after voting closes
  - Highlight winning team
  - Display final vote totals
- [ ] Responsive layout
  - Card on desktop
  - Full-width on mobile/Farcaster

#### Interactive States
- [ ] Hover effects (desktop)
- [ ] Click to expand details
- [ ] Active voting state
- [ ] Completed state
- [ ] Loading state

### 2.5 Create Match Detail Page
File: `app/matches/[id]/page.tsx`

#### Page Layout
- [ ] Large match header with teams
- [ ] Current price display
- [ ] Phase indicator with timeline
- [ ] Voting interface (if active)
- [ ] Voting statistics
- [ ] Vote history for this match
- [ ] Payout claim interface (if applicable)

#### Voting Statistics Section
- [ ] Total ETH per team (visual bar chart)
- [ ] Total vote count per team
- [ ] Number of unique voters
- [ ] Vote price history chart
- [ ] Recent votes feed
- [ ] Phase transition marker

#### User's Votes Section
- [ ] Show user's votes on this match
- [ ] Display vote count per team
- [ ] Show ETH contributed per team
- [ ] Calculate potential payout (if winner)
- [ ] Show claim button if claimable

### 2.6 Create Home Page
File: `app/page.tsx`

#### Home Page Sections
- [ ] Hero section
  - App title and description
  - Call-to-action (View Matches, Connect Wallet)
  - Current tournament phase indicator
- [ ] Active matches section
  - Matches currently open for voting
  - Sort by deadline (soonest first)
  - Card grid layout
- [ ] Upcoming matches section
  - Matches starting soon
  - Card grid layout
- [ ] Completed matches section
  - Recent results
  - Winners highlighted
- [ ] Statistics dashboard
  - Total ETH in all pools
  - Number of active matches
  - Number of voters
  - Total votes cast

#### Context-Specific Home
- [ ] Desktop: Full-featured home page
- [ ] Farcaster: Optimized for embedded view
  - Focus on active matches
  - Simplified layout
  - Touch-friendly

### 2.7 Create Dashboard Components

#### User Stats Component
File: `components/UserStats.tsx`

- [ ] Total ETH wagered
- [ ] Total votes cast
- [ ] Active matches count
- [ ] Claimable amount
- [ ] Total winnings
- [ ] Win rate percentage
- [ ] Visual charts/graphs

#### Active Matches Component
File: `components/ActiveMatches.tsx`

- [ ] List user's active votes
- [ ] Match cards with user's position
- [ ] Show potential winnings
- [ ] Link to match pages
- [ ] Sort/filter options

### 2.8 Real-Time Updates Implementation

#### Vote Price Updates
File: `hooks/useRealTimePrice.ts`

- [ ] Subscribe to price changes
- [ ] Poll contract periodically
- [ ] Listen to VoteCast events
- [ ] Update UI automatically
- [ ] Debounce updates

#### Match Status Updates
File: `hooks/useMatchStatus.ts`

- [ ] Monitor voting deadlines
- [ ] Update status (active → completed)
- [ ] Trigger winner determination
- [ ] Update UI when match completes

#### Vote Feed Updates
File: `components/LiveVoteFeed.tsx`

- [ ] Display recent votes across all matches
- [ ] Real-time updates
- [ ] Show: Time, Match, Team, Amount
- [ ] Scrolling feed
- [ ] Optional: Filter by match

### 2.9 Create Leaderboards
File: `app/leaderboards/page.tsx`

#### Leaderboard Categories
- [ ] Most Successful Voters
  - Rank by total winnings
  - Show win rate
  - Display total ETH won
- [ ] Largest Single Votes
  - Biggest individual votes
  - Show match and team
  - Display ETH amount
- [ ] Most Active Voters
  - Rank by total votes cast
  - Show number of matches
  - Display participation rate
- [ ] Early Birds
  - Voters with most Phase 1 votes
  - Highlight early voting advantage

#### Leaderboard Component
File: `components/Leaderboard.tsx`

- [ ] Table with rankings
- [ ] Columns: Rank, Address/Username, Stats
- [ ] Pagination
- [ ] Highlight current user
- [ ] Refresh button

### 2.10 Create Statistics Page
File: `app/stats/page.tsx`

#### Platform Statistics
- [ ] Total ETH in prize pools
- [ ] Total ETH wagered all-time
- [ ] Total votes cast
- [ ] Number of matches created
- [ ] Number of unique voters
- [ ] Average vote size
- [ ] Phase 1 vs Phase 2 vote distribution

#### Charts and Visualizations
- [ ] ETH over time chart
- [ ] Votes per day chart
- [ ] Price progression charts
- [ ] Win rate by team chart
- [ ] Phase distribution pie chart

### 2.11 Create Loading States
File: `components/LoadingStates.tsx`

- [ ] Page loading skeleton
- [ ] Match card skeleton
- [ ] Transaction pending indicator
- [ ] Button loading state
- [ ] Shimmer effects

### 2.12 Create Error States
File: `components/ErrorStates.tsx`

- [ ] Error boundary component
- [ ] 404 page
- [ ] Error message displays
- [ ] Retry buttons
- [ ] User-friendly error messages

### 2.13 Create Empty States
File: `components/EmptyStates.tsx`

- [ ] No matches found
- [ ] No votes yet
- [ ] No claimable payouts
- [ ] No results
- [ ] Call-to-action for each state

### 2.14 Mobile Optimization

#### Responsive Design
- [ ] Mobile-first approach
- [ ] Breakpoints for tablets and desktop
- [ ] Touch-friendly button sizes (min 44x44px)
- [ ] Simplified navigation on mobile
- [ ] Hamburger menu for mobile

#### Farcaster-Specific Optimization
- [ ] Optimize for embedded context
- [ ] Account for smaller viewport
- [ ] Simplified UI for mobile
- [ ] Focus on core actions
- [ ] Minimal navigation

### 2.15 Accessibility
File: Throughout components

- [ ] Semantic HTML
- [ ] ARIA labels
- [ ] Keyboard navigation
- [ ] Focus indicators
- [ ] Screen reader support
- [ ] Color contrast (WCAG AA)
- [ ] Alt text for images

### 2.16 Performance Optimization

#### Code Splitting
- [ ] Dynamic imports for heavy components
- [ ] Route-based code splitting
- [ ] Lazy load below-fold content

#### Image Optimization
- [ ] Next.js Image component for flags
- [ ] Lazy loading images
- [ ] Proper image sizes
- [ ] WebP format with fallbacks

#### Data Fetching
- [ ] Use SWR or React Query for caching
- [ ] Prefetch data on hover
- [ ] Optimistic updates
- [ ] Stale-while-revalidate strategy

### 2.17 Create Notification System
File: `components/Notifications.tsx`

- [ ] Toast notifications for actions
- [ ] Success messages
- [ ] Error messages
- [ ] Transaction confirmations
- [ ] Match updates (deadline approaching)
- [ ] Claimable payout alerts

### 2.18 Create Tour/Onboarding
File: `components/Onboarding.tsx`

- [ ] First-time user guide
- [ ] Explain 2-phase pricing
- [ ] Show how to vote
- [ ] Explain early voter advantage
- [ ] Explain payout mechanics
- [ ] Skip/dismiss option

### 2.19 Testing UI/UX
- [ ] Test on multiple screen sizes
- [ ] Test in desktop browsers
- [ ] Test in Farcaster clients
- [ ] Test touch interactions
- [ ] Test keyboard navigation
- [ ] Test with screen readers
- [ ] User testing for flow
- [ ] A/B test key components (optional)

## Acceptance Criteria
- [ ] App initializes correctly in both contexts
- [ ] No infinite splash screen in Farcaster
- [ ] Responsive design works on all devices
- [ ] Match cards display all information clearly
- [ ] Real-time updates work smoothly
- [ ] Dashboard shows comprehensive user data
- [ ] Leaderboards and stats are engaging
- [ ] Loading, error, and empty states are polished
- [ ] Accessible to all users
- [ ] Performance is optimized

## Dependencies
- Phase 1 (Project setup and Next.js foundation)

**Note**: This phase builds the UI foundation with mock/static data. Blockchain integration (Phase 4), voting components (Phase 5), and Farcaster features (Phase 6) will be connected to these UI components in later phases.

## Estimated Complexity
High - Comprehensive UI/UX requires attention to detail

## Design Principles
- **Mobile-First**: Design for smallest screens first
- **Context-Aware**: Adapt to desktop vs Farcaster
- **Performance**: Fast load times and smooth interactions
- **Accessibility**: Usable by everyone
- **Clarity**: Information is clear and easy to understand
- **Engagement**: Encourage participation and sharing

## Key UI Elements
- Match cards with team flags, prices, and countdowns
- Phase indicators showing pricing model
- Real-time vote updates
- Payout claim interface with clear calculations
- Comprehensive dashboard
- Engaging leaderboards
- Clear call-to-action buttons

## Important Notes
- Must call `sdk.actions.ready()` after app initialization (Farcaster)
- Desktop and Farcaster experiences should both be excellent
- Real-time updates enhance engagement
- Clear display of vote count (not just ETH) is critical for payout understanding
- Mobile touch targets must be large enough
- Loading states prevent perceived slowness
- Error messages should be helpful, not technical
