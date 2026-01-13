# Phase 2: UI/UX Foundation & App Initialization

## Overview
Build the foundational user interface, design system, and app initialization logic for the **two-phase system**: Qualification (fixed-price support voting) and Tournament (match-based betting). This phase establishes the UI framework that will later be connected to blockchain functionality. Focus on responsive design, component structure, and context-aware rendering for both desktop and Farcaster environments.

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

- [ ] Navigation header with phase indicator
- [ ] Main content area
- [ ] Footer
- [ ] Responsive sidebar (desktop only)
- [ ] Mobile-optimized for Farcaster
- [ ] Sticky navigation
- [ ] Loading states
- [ ] Phase-aware navigation (Qualification vs Tournament links)

### 2.3.5 Create Phase Switcher Component
File: `components/PhaseSwitcher.tsx`

**This component helps users understand the current phase**:
- [ ] Display current phase (Qualification or Tournament)
- [ ] Show phase countdown timer
- [ ] Link to qualification page when in qualification phase
- [ ] Link to tournament page when in tournament phase
- [ ] Visual indicator of phase status
- [ ] Responsive design

### 2.4 Build Qualification UI Components

#### Qualification Standings Component
File: `components/QualificationStandings.tsx`

**Live rankings for all countries during qualification**:
- [ ] Display all countries in ranked order
- [ ] Show for each country:
  - Current rank
  - Country name and flag
  - Total votes received
  - Total ETH (after fees)
  - Qualification status (top 48 highlighted)
- [ ] Real-time updates as votes come in
- [ ] Filter options (qualified, not qualified, search)
- [ ] Responsive table/card layout
- [ ] Mobile-optimized for Farcaster

#### Country Support Card Component
File: `components/CountrySupportCard.tsx`

**Individual country voting interface**:
- [ ] Display country flag and name
- [ ] Show current rank
- [ ] Display total votes and ETH
- [ ] Show qualification status
- [ ] "Support" button with fixed price (0.001 ETH)
- [ ] Display current time-based fee percentage
- [ ] Show user's previous votes for this country
- [ ] Responsive design

#### Qualification Home Page
File: `app/qualification/page.tsx`

**Main qualification interface**:
- [ ] Hero section explaining qualification
- [ ] Live standings table/grid
- [ ] Top 48 highlighted
- [ ] Search/filter countries
- [ ] Current fee percentage display
- [ ] Qualification deadline countdown
- [ ] Link to user's qualification votes
- [ ] Share to Farcaster functionality

#### User Qualification Stats Component
File: `components/UserQualificationStats.tsx`

**User's qualification activity**:
- [ ] Total votes cast during qualification
- [ ] Total ETH contributed
- [ ] Countries supported (with vote counts)
- [ ] Potential rewards if countries qualify
- [ ] Claimable rewards (after qualification ends)
- [ ] Visual breakdown

### 2.5 Build Tournament Match Card Component
File: `components/MatchCard.tsx`

**This is for Tournament phase only** (match-based voting with dynamic pricing).

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

**Phase-aware home page that adapts to current phase**:

#### Home Page Sections
- [ ] Hero section
  - App title and description
  - Current phase indicator (Qualification or Tournament)
  - Phase-specific call-to-action:
    - Qualification: "Support Your Country"
    - Tournament: "Vote on Matches"
  - Countdown to next phase
- [ ] Phase-specific content:
  - **During Qualification**:
    - Link to qualification standings
    - Top 48 preview
    - Featured countries
    - Qualification deadline countdown
  - **During Tournament**:
    - Active matches section (open for voting)
    - Upcoming matches section
    - Completed matches section
    - Tournament bracket preview
- [ ] Statistics dashboard (phase-specific)
  - **Qualification**: Total votes, total countries, total ETH, qualified count
  - **Tournament**: Total ETH in pools, active matches, total votes
- [ ] Recent activity feed
  - Recent votes (qualification or tournament)
  - Real-time updates

#### Context-Specific Home
- [ ] Desktop: Full-featured home page with both phase sections
- [ ] Farcaster: Optimized for embedded view
  - Focus on current phase only
  - Simplified layout
  - Touch-friendly

### 2.7 Create Dashboard Components

**Phase-aware dashboard showing combined stats from both phases**:

#### User Stats Component
File: `components/UserStats.tsx`

- [ ] **Qualification Stats**:
  - Total qualification votes cast
  - Total ETH contributed to qualification
  - Countries supported
  - Claimable qualification rewards (if applicable)
- [ ] **Tournament Stats**:
  - Total tournament votes cast
  - Total ETH wagered on matches
  - Active matches count
  - Claimable match winnings
  - Win rate percentage
- [ ] **Combined Stats**:
  - Total ETH spent across both phases
  - Total votes cast (qualification + tournament)
  - Total winnings
  - Visual charts/graphs

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
- **Two-Phase System**: UI must adapt to show Qualification or Tournament based on current phase
  - **Qualification**: Fixed-price support voting, standings-based, NO matches
  - **Tournament**: Match-based betting with dynamic pricing
- Clear display of vote count (not just ETH) is critical for tournament payout understanding
- Qualification rewards are proportional to ETH contributed to qualified countries
- Mobile touch targets must be large enough
- Loading states prevent perceived slowness
- Error messages should be helpful, not technical
- Phase indicator should be prominent throughout the app
- See `/docs/ROADMAP.md` and `/docs/architecture/TWO_PHASE_SYSTEM.md` for details
