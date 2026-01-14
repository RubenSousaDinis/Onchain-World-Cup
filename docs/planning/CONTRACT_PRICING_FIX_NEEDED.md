# Contract Pricing Formula - Critical Fix Needed

## Status: ⚠️ NEEDS FIXING BEFORE DEPLOYMENT

## Summary

The current `WorldCupMatch.sol` contract has **incorrect pricing formulas** and **architectural issues** with how it tracks votes. This document explains what's wrong and what needs to be fixed.

## Current Implementation (WRONG)

### Phase 1 Linear Pricing
\`\`\`solidity
// Current (INCORRECT)
return BASE_PRICE + (BASE_PRICE * voteCount * 5) / 1000;
// Translates to: 0.001 + (0.001 * voteCount * 0.005)
\`\`\`

### Phase 2 Exponential Pricing
\`\`\`solidity
// Current (INCORRECT)
// Applies 2% increase per vote
price = (price * 102) / 100
\`\`\`

### Vote Tracking
\`\`\`solidity
// Current (INCORRECT)
// Tracks total ETH, NOT vote count
team1TotalVotes += msg.value; // This is ETH amount, not vote count!
\`\`\`

## Expected Implementation (from PLAN.md)

### Phase 1 Linear Pricing
\`\`\`
price = 0.001 + (voteCount × 0.0001)
\`\`\`
**Example:**
- Vote 1: 0.001 ETH
- Vote 2: 0.0011 ETH
- Vote 10: 0.002 ETH
- Vote 100: 0.011 ETH

### Phase 2 Exponential Pricing
\`\`\`
phase1EndPrice = 0.001 + (phase1VoteCount × 0.0001)
price = phase1EndPrice × (1.1 ^ phase2VoteCount)
\`\`\`
**Example (assuming 100 votes in Phase 1):**
- Phase 1 ended at: 0.011 ETH
- First vote in Phase 2: 0.011 × 1.1 = 0.0121 ETH
- Second vote in Phase 2: 0.011 × 1.1² = 0.01331 ETH
- Third vote in Phase 2: 0.011 × 1.1³ = 0.014641 ETH

### Vote Count Tracking
**Critical:** The contract must track the NUMBER of votes, not ETH amount.

## Major Architectural Issues

### Issue 1: Confusion Between Votes and ETH

**Current Problem:**
- Variable named `team1TotalVotes` actually stores **total ETH**, not vote count
- Variable `voteCount` is calculated as `existingVotes / BASE_PRICE`, which is wrong

**What Needs to Happen:**
- Track actual vote count separately
- Each transaction = 1 vote (at the current price)
- Store both vote count AND ETH amount

### Issue 2: Payout Based on Wrong Metric

**Current (WRONG):**
\`\`\`solidity
// Payout proportional to ETH contributed
return (winnerPool * voterAmount) / winningTeamTotal;
\`\`\`

**Expected (CORRECT):**
\`\`\`
// Payout proportional to NUMBER of votes
userShare = (userVoteCount / totalVoteCount) × winnerPool
\`\`\`

**Why This Matters:**
- **Early voter** votes 10 times @ 0.001 ETH = 0.01 ETH total, 10 votes
- **Late voter** votes 5 times @ 0.002 ETH = 0.01 ETH total, 5 votes
- Both spent same ETH, but early voter should get **2x payout** (10 votes vs 5 votes)
- This is the **early voter advantage** that makes the system fair and incentivizes early participation

### Issue 3: No Phase 1 End State Tracking

**Current Problem:**
- Contract doesn't store phase 1 end price
- Contract doesn't track how many votes were in phase 1 vs phase 2
- Phase 2 pricing can't calculate correctly without these values

**What's Needed:**
\`\`\`solidity
uint256 public phase1EndPrice;
uint256 public phase1VoteCount;
bool public phase1Ended;
\`\`\`

## Required Changes

### 1. Add New State Variables
\`\`\`solidity
// Track actual vote counts (not ETH amounts)
uint256 public team1VoteCount;      // Number of votes for team 1
uint256 public team2VoteCount;      // Number of votes for team 2
mapping(address => mapping(uint8 => uint256)) public userVoteCount; // user => team => vote count

// Track ETH amounts separately
uint256 public team1TotalETH;       // Total ETH voted for team 1
uint256 public team2TotalETH;       // Total ETH voted for team 2
mapping(address => mapping(uint8 => uint256)) public userETH; // user => team => ETH contributed

// Phase 1 state
uint256 public phase1EndPrice;
uint256 public phase1VoteCount;
bool public phase1Ended;
\`\`\`

### 2. Fix Phase 1 Pricing
\`\`\`solidity
function calculateVotePrice(uint8 teamIndex) public view returns (uint256) {
    uint8 phase = getCurrentPhase();
    require(phase > 0, "Voting is closed");

    uint256 voteCount = teamIndex == 0 ? team1VoteCount : team2VoteCount;

    if (phase == 1) {
        // Phase 1: Linear increment of 0.0001 ETH per vote
        return BASE_PRICE + (voteCount * 0.0001 ether);
    } else {
        // Phase 2 logic...
    }
}
\`\`\`

### 3. Fix Phase 2 Pricing
\`\`\`solidity
if (phase == 2) {
    // Get phase 1 end price (calculate or retrieve stored value)
    uint256 phase1Price = phase1EndPrice;
    if (phase1Price == 0) {
        // Calculate if not stored yet
        phase1Price = BASE_PRICE + (phase1VoteCount * 0.0001 ether);
    }

    // Calculate votes in phase 2
    uint256 phase2Votes = voteCount - phase1VoteCount;

    // Apply exponential multiplier (1.1 ^ phase2Votes)
    uint256 price = phase1Price;
    for (uint256 i = 0; i < phase2Votes; i++) {
        price = (price * 11) / 10; // Multiply by 1.1
    }

    return price;
}
\`\`\`

### 4. Fix Vote Function
\`\`\`solidity
function vote(uint8 teamIndex) external payable {
    require(teamIndex == 0 || teamIndex == 1, "Invalid team index");
    require(getCurrentPhase() > 0, "Voting is closed");

    // Calculate current price for ONE vote
    uint256 currentPrice = calculateVotePrice(teamIndex);
    require(msg.value >= currentPrice, "Insufficient payment");

    // Track vote COUNT (this is what matters for payout)
    if (teamIndex == 0) {
        team1VoteCount += 1;           // Increment vote count
        team1TotalETH += msg.value;    // Track ETH separately
    } else {
        team2VoteCount += 1;
        team2TotalETH += msg.value;
    }

    // Track user's votes
    userVoteCount[msg.sender][teamIndex] += 1;
    userETH[msg.sender][teamIndex] += msg.value;

    // Store phase 1 end state when transitioning
    if (!phase1Ended && getCurrentPhase() == 2) {
        phase1Ended = true;
        phase1VoteCount = team1VoteCount + team2VoteCount;
        phase1EndPrice = calculateVotePrice(teamIndex); // Store last phase 1 price
    }

    // Refund overpayment
    if (msg.value > currentPrice) {
        uint256 refund = msg.value - currentPrice;
        payable(msg.sender).transfer(refund);
    }

    emit VotePlaced(msg.sender, teamIndex, currentPrice, block.timestamp);
}
\`\`\`

### 5. Fix Payout Calculation
\`\`\`solidity
function calculateWinnings(address voter) public view returns (uint256) {
    require(matchFinalized, "Match not finalized yet");

    // Handle tie
    if (winningTeam == 255) {
        return userETH[voter][0] + userETH[voter][1];
    }

    // Get user's VOTE COUNT (not ETH amount)
    uint256 voterVoteCount = userVoteCount[voter][winningTeam];
    if (voterVoteCount == 0) return 0;

    // Calculate based on VOTE COUNT
    uint256 totalPrizePool = team1TotalETH + team2TotalETH;
    uint256 winnerPool = (totalPrizePool * WINNER_SHARE_PERCENT) / 100;
    uint256 winningTeamVoteCount = winningTeam == 0 ? team1VoteCount : team2VoteCount;

    // Payout = (user votes / total votes) × winner pool
    return (winnerPool * voterVoteCount) / winningTeamVoteCount;
}
\`\`\`

## Impact Analysis

### Contract Changes Required
- ✅ State variables: Add vote count tracking
- ✅ Pricing functions: Fix formulas
- ✅ Vote function: Track both count and ETH
- ✅ Payout function: Calculate based on vote count
- ✅ Events: Update to reflect vote count
- ⚠️ **Breaking Change**: Contract interface changes

### Frontend Changes Required
- Update contract ABI
- Update vote modal to show vote count vs ETH
- Display "You will get X votes for Y ETH"
- Show user's vote count per team (not just ETH)
- Update payout UI to show vote-based calculation

### Testing Required
- Test Phase 1 pricing at different vote counts
- Test Phase 2 pricing with exponential growth
- Test phase transition
- Test payout calculations favor early voters
- Test edge cases (first vote, 100th vote, etc.)

## Example Scenario

### Scenario: Early vs Late Voter

**Phase 1 (First 2 hours):**
- Alice votes 10 times:
  - Vote 1: 0.001 ETH
  - Vote 2: 0.0011 ETH
  - ... (prices increasing)
  - Vote 10: 0.0019 ETH
  - Total spent: ~0.0145 ETH
  - **Votes earned: 10**

**Phase 2 (After 2 hours):**
- Bob votes 5 times:
  - Phase 1 ended at 0.011 ETH (after 100 votes)
  - Vote 1: 0.0121 ETH
  - Vote 2: 0.01331 ETH
  - Vote 3: 0.014641 ETH
  - Vote 4: 0.0161 ETH
  - Vote 5: 0.0177 ETH
  - Total spent: ~0.073 ETH
  - **Votes earned: 5**

**Result if Team Wins:**
- Total prize pool: 100 ETH (hypothetical)
- Winner pool (90%): 90 ETH
- Total votes for winner: 200

- Alice's payout: (10 / 200) × 90 = **4.5 ETH**
- Bob's payout: (5 / 200) × 90 = **2.25 ETH**

**Alice spent less but gets more!** This is the intended design.

## Recommendation

**DO NOT deploy current contract to mainnet.** It has fundamental flaws that:
1. Use wrong pricing formulas
2. Base payouts on ETH instead of vote count
3. Don't properly track phase state

**Action Required:**
1. Rewrite contract with correct implementation
2. Write comprehensive tests
3. Consider professional audit
4. Test extensively on testnet

## Priority

🔴 **CRITICAL** - Must fix before any real money is involved

## Related Documents

- `/docs/planning/PLAN.md` - Original specification
- `/docs/planning/V0_CODE_REVIEW.md` - Full code review
- `/docs/planning/pricing_analysis.md` - Pricing mechanism explained
