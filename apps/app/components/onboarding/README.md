# Onboarding Tour Component

## Overview
Interactive multi-step tour guide that introduces first-time users to the Onchain World Cup voting platform.

## Features

### 5-Step Interactive Tour (Football-Fan Friendly)
1. **Welcome to Onchain World Cup** - Introduction to the community-driven competition
2. **Qualification Phase** - Current competition structure (192 → 48 countries)
3. **Vote Early, Pay Less** - Simple explanation of pricing (like early bird tickets)
4. **How to Vote** - 3 easy steps to get started
5. **Winning & Prizes** - How payouts work in simple terms

### Key Functionality
- ✅ Automatic display for first-time users
- ✅ LocalStorage persistence (won't show again after completion)
- ✅ Skip/dismiss option
- ✅ Manual restart via "Tour Guide" button on How It Works page
- ✅ Keyboard navigation (ESC to close)
- ✅ Progress indicators
- ✅ Responsive design
- ✅ Follows Championship Manager 01/02 retro theme

## Files Created

### Components
- `components/onboarding.tsx` - Main onboarding modal component with 5 steps optimized for football fans

### Hooks
- `hooks/useOnboarding.ts` - Hook to manage onboarding state and localStorage

### Providers
- `providers/onboarding-provider.tsx` - Context provider for global onboarding state

## Usage

### Automatic Display
The onboarding automatically shows to first-time users after a 500ms delay.

### Manual Trigger
Users can restart the tour anytime from the "How It Works" page via the "Tour Guide" button.

### Programmatic Access
```tsx
import { useOnboardingContext } from "@/providers/onboarding-provider"

function MyComponent() {
  const { showOnboarding, resetOnboarding } = useOnboardingContext()

  // Show the tour
  showOnboarding()

  // Reset and show from beginning
  resetOnboarding()
}
```

## Persistence Strategy

The onboarding system uses a hybrid storage approach:

### Database Storage (Primary)
- **When**: User has connected wallet
- **Where**: `user_stats.onboarding_completed_at` timestamp in Supabase
- **Logic**: NULL = not completed, NOT NULL = completed at that timestamp
- **Benefits**:
  - Persists across devices and browsers
  - Tied to wallet address
  - Enables analytics and tracking (includes completion timestamp)
  - More reliable than localStorage
  - Single field serves dual purpose (status + timestamp)

### LocalStorage (Fallback)
- **When**: User has NOT connected wallet
- **Where**: Browser localStorage key `onboardingCompleted`
- **Benefits**:
  - Works for guest users browsing without wallet
  - No API calls needed
  - Instant response

### How It Works
1. **Guest user visits** → Check localStorage
2. **Guest completes onboarding** → Save to localStorage
3. **User connects wallet** → Check database
4. **Migration logic** → If database says "not completed" BUT localStorage says "completed", migrate to database
5. **Cross-device sync** → User on different device with same wallet won't see onboarding again!

### Migration Flow (Guest → Connected)
When a guest user who completed onboarding later connects their wallet:
1. Check database: `onboarding_completed_at = null` (wallet not seen before)
2. Check localStorage: `onboardingCompleted = "true"` (completed as guest)
3. **Migrate**: Update database with completion timestamp
4. Clear localStorage (no longer needed)
5. **Result**: User doesn't see onboarding twice! ✅

## Design Decisions

1. **Multi-step format**: Better UX than single long page
2. **LocalStorage**: Simple, client-side persistence without database
3. **Context Provider**: Global state management for easy access
4. **Auto-show with delay**: Ensures app is loaded before showing tour
5. **Manual restart**: Users can review info anytime

## Styling
- Uses existing `cm-panel` retro styling
- Consistent with Championship Manager 01/02 theme
- Color-coded phases (green for Phase 1, orange for Phase 2)
- Accessible with ARIA labels and keyboard support

## Future Enhancements
- Analytics to track tour completion rates
- A/B testing different tour content
- User feedback collection
- Video demonstrations
- Interactive voting simulation
