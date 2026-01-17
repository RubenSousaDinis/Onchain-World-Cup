# Qualification Phase Updates

## Overview

This document summarizes the updates made to reflect the new `WorldCupQualification` contract implementation.

## Contract Changes

### Key Features Implemented

1. **Linear Pricing Model**
   - Base price: 0.001 ETH
   - Price increment: 0.0005 ETH per vote
   - Formula: `Price = 0.001 + (voteCount × 0.0005)`
   - Each country has independent pricing

2. **Unified Prize Pool**
   - All 48 qualified countries share one prize pool
   - Payout formula: `(userQualifiedVotes × totalPrizePool) / totalQualifiedVotes`
   - Users can vote for multiple countries

3. **Updatable Platform Fee**
   - Default: 10% (1000 basis points)
   - Maximum: 20% (2000 basis points)
   - Can be updated during qualification for discounts/promotions

4. **Trust Guarantees**
   - Countries cannot qualify without votes
   - Admin can only curate country list
   - All actions are transparent and time-limited

## Documentation Updates

### New Documentation
- **`docs/QUALIFICATION_CONTRACT.md`** - Complete contract documentation including:
  - Contract structure and functions
  - Pricing examples
  - Payout examples
  - Security features
  - Integration guide
  - Best practices

### Updated Documentation
- **`docs/README.md`** - Added reference to qualification contract docs

## UI/UX Updates

### Onboarding Component (`apps/app/components/onboarding.tsx`)

**Updated Steps:**

1. **"Vote Early, Pay Less" Step**
   - Changed from 2-phase pricing to linear pricing explanation
   - Updated examples: 0.001 ETH first vote, +0.0005 ETH per additional vote
   - Removed references to "first 2 hours" and "after 2 hours"
   - Added explanation of per-country pricing

2. **"Winning & Prizes" Step**
   - Updated to explain unified prize pool
   - Clarified that all 48 qualified countries share one pool
   - Updated formula: `(Your qualified votes / Total qualified votes) × Prize pool`
   - Added note about voting for multiple countries

3. **"The Competition Journey" Step**
   - Enhanced qualification phase description
   - Added explanation of how top 48 are determined

### Landing Page Components

#### `how-voting-works-section.tsx`
- Updated pricing description to mention linear pricing
- Changed "Voting fees increase over time" to "Linear pricing: prices increase with each vote"
- Updated prize pool distribution to reflect unified pool
- Added explanation of qualification phase payout formula

#### `phases-section.tsx`
- Enhanced qualification phase details:
  - Added linear pricing information
  - Mentioned unified prize pool
  - Clarified top 48 selection by vote count

#### `faq-section.tsx`
- Added new FAQs:
  - "How does pricing work in qualification?"
  - "How are prizes distributed in qualification?"
  - "Can the platform fee change?"
- Updated existing FAQ about qualification phase

## Key Differences from Match Contracts

### Pricing
- **Qualification**: Linear pricing only (no phases)
- **Matches**: 2-phase pricing (linear then exponential)

### Prize Pool
- **Qualification**: Unified pool shared by all qualified countries
- **Matches**: Per-match pools, winners share their match's pool

### Voting
- **Qualification**: Vote for countries (no matches)
- **Matches**: Vote for teams in specific matches

## User-Facing Changes

### What Users See

1. **Pricing Display**
   - Shows current price per vote for each country
   - Price increases linearly: 0.001 ETH → 0.0015 ETH → 0.002 ETH, etc.

2. **Prize Pool Display**
   - Shows unified prize pool (all qualified countries combined)
   - Shows user's potential share based on their votes across all qualified countries

3. **Qualification Status**
   - Shows which countries are in the top 48
   - Updates in real-time as votes are placed

### What Users Need to Know

1. **Early Voting Advantage**
   - First votes are cheapest (0.001 ETH)
   - Each vote increases price by 0.0005 ETH
   - Vote early for best prices

2. **Multiple Country Strategy**
   - Users can vote for multiple countries
   - If any of their countries qualify, they get a share
   - Share is proportional to total votes across all qualified countries

3. **Platform Fee**
   - Default 10% fee on all votes
   - Can be reduced during promotions (transparent)
   - Fee is deducted immediately, not at finalization

## Technical Implementation

### Contract Interface
- Updated `IWorldCupQualification.sol` with all new functions
- Added events: `CountryAdded`, `CountryRemoved`, `PlatformFeeUpdated`, `QualificationEnded`, `PrizesDistributed`

### Frontend Integration
- Frontend should use `votePrice(country)` for current price
- Frontend should use `calculateVoteCost(country, votes)` for batch voting
- Frontend should use `claimable(user)` to show potential winnings
- Frontend should listen to `Voted` and `QualificationFinalized` events

## Migration Notes

### For Existing Users
- No migration needed - qualification is a new phase
- Users start fresh in qualification phase
- Previous match voting data is separate

### For Developers
- Qualification contract is separate from match contracts
- Different pricing model (linear vs 2-phase)
- Different payout model (unified vs per-match)
- Both contracts can coexist

## Testing

All updates have been tested:
- ✅ 65 passing tests for qualification contract
- ✅ Onboarding component updated and tested
- ✅ Landing page components updated
- ✅ Documentation complete

## Next Steps

1. Deploy qualification contract to Base testnet
2. Update frontend to use new contract interface
3. Add qualification phase UI components
4. Update event indexer for qualification events
5. Create qualification leaderboard display
