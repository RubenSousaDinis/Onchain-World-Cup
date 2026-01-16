# Onboarding Tour Component

## Overview
Interactive multi-step tour guide that introduces first-time users to the Onchain World Cup voting platform.

## Features

### 5-Step Interactive Tour
1. **Welcome** - Introduction to the platform and how it works
2. **2-Phase Pricing** - Explains the linear and exponential pricing model
3. **How to Vote** - Step-by-step guide for placing votes
4. **Early Voter Advantage** - Benefits of voting early
5. **Payout Mechanics** - How prize pools are distributed

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
- `components/onboarding.tsx` - Main onboarding modal component with 5 steps

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
