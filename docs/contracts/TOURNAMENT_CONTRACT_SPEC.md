# Tournament Match Contract Specification

## Overview

The Tournament Match Contract implements the **Phase 2** voting mechanism of the Onchain World Cup. Each match between two qualified countries has its own contract instance with dynamic 2-phase pricing.

**Key Difference from Qualification:**
- Qualification: Global contract, fixed price, all countries
- Tournament: Individual contracts, dynamic pricing, 2 countries per match

## Core Principles

From ROADMAP.md, tournament matches use the same support voting mechanics as qualification, but with:
1. **Match-based structure** (2 teams compete)
2. **Dynamic pricing** allowed (2-phase: linear → exponential)
3. **Winner determined by highest support**
4. **Real-world results are irrelevant**

## Contract Purpose

- Enable users to support one of two teams in a match
- Apply 2-phase dynamic pricing (linear → exponential)
- Determine winner based on total support (NOT real-world results)
- Distribute 90% of prize pool to supporters of winning team
- Collect 10% platform fee

## Match Mechanics

### Two-Phase Pricing

**Phase 1 (0-2 hours): Linear Increase**
```
price = 0.001 + (voteCount × 0.0001)
```

**Phase 2 (2-24 hours): Exponential Increase**
```
phase1EndPrice = 0.001 + (phase1VoteCount × 0.0001)
price = phase1EndPrice × (1.1 ^ phase2VoteCount)
```

**Voting Period:** 24 hours total

### Early Voter Advantage

**Critical:** Payouts are based on **vote COUNT**, not ETH amount.

**Example:**
- Alice votes 10 times early (Phase 1) → Pays ~0.015 ETH total → Gets 10 votes
- Bob votes 5 times late (Phase 2) → Pays ~0.0175 ETH total → Gets 5 votes
- If their team wins, Alice gets 2× Bob's payout despite spending less ETH

This design **intentionally rewards early participation**.

## State Variables

### Immutable Configuration

```solidity
bytes2 public immutable teamA;          // ISO country code (e.g., "BR")
bytes2 public immutable teamB;          // ISO country code (e.g., "AR")
uint256 public immutable matchStartTime;
uint256 public immutable votingDeadline; // matchStartTime + 24 hours
uint256 public immutable phase1EndTime;  // matchStartTime + 2 hours
address public immutable platformWallet;

// Pricing constants
uint256 public constant BASE_PRICE = 0.001 ether;
uint256 public constant LINEAR_INCREMENT = 0.0001 ether;
uint256 public constant EXPONENTIAL_MULTIPLIER = 110; // 1.1x = 110/100
uint256 public constant WINNER_SHARE_PERCENT = 90;
uint256 public constant PLATFORM_FEE_PERCENT = 10;
```

### Mutable State

```solidity
// Vote COUNT tracking (critical for payouts)
uint256 public teamAVoteCount;
uint256 public teamBVoteCount;
mapping(address => uint256) public userVotesTeamA;
mapping(address => uint256) public userVotesTeamB;

// ETH tracking (for display and prize pool)
uint256 public teamAETH;
uint256 public teamBETH;
mapping(address => uint256) public userETHTeamA;
mapping(address => uint256) public userETHTeamB;

// Phase 1 state (for Phase 2 pricing calculation)
uint256 public phase1VoteCount;
uint256 public phase1EndPrice;
bool public phase1Ended;

// Match result
bool public matchFinalized;
uint8 public winningTeam;  // 0 = teamA, 1 = teamB, 255 = tie

// Claims
mapping(address => bool) public hasClaimed;
mapping(address => uint256) public claimedAmount;
```

## Functions

### User Functions

#### `vote(uint8 team) payable`

Cast a vote for a team.

```solidity
function vote(uint8 team) external payable {
    require(team == 0 || team == 1, "Invalid team");
    require(block.timestamp < votingDeadline, "Voting closed");
    require(!matchFinalized, "Match finalized");

    // Get current price for this team
    uint256 currentPrice = calculateVotePrice(team);
    require(msg.value >= currentPrice, "Insufficient payment");

    // Track vote COUNT (this determines payout share)
    if (team == 0) {
        teamAVoteCount += 1;
        teamAETH += currentPrice;
        userVotesTeamA[msg.sender] += 1;
        userETHTeamA[msg.sender] += currentPrice;
    } else {
        teamBVoteCount += 1;
        teamBETH += currentPrice;
        userVotesTeamB[msg.sender] += 1;
        userETHTeamB[msg.sender] += currentPrice;
    }

    // Track Phase 1 end state (for Phase 2 pricing)
    if (!phase1Ended && block.timestamp >= phase1EndTime) {
        phase1Ended = true;
        phase1VoteCount = teamAVoteCount + teamBVoteCount;
        // phase1EndPrice is calculated dynamically
    }

    // Refund overpayment
    if (msg.value > currentPrice) {
        uint256 refund = msg.value - currentPrice;
        payable(msg.sender).transfer(refund);
    }

    bytes2 votedCountry = team == 0 ? teamA : teamB;
    emit VoteCast(
        msg.sender,
        votedCountry,
        currentPrice,
        getCurrentPhase(),
        teamAVoteCount + teamBVoteCount
    );
}
```

**Parameters:**
- `team`: 0 for teamA, 1 for teamB

**Requirements:**
- Valid team index
- Before voting deadline
- Match not finalized
- Sufficient payment

**Effects:**
- Increments vote COUNT for team (used for payouts)
- Adds ETH to team's total (for prize pool)
- Tracks user's votes and ETH per team
- Auto-detects Phase 1 end
- Refunds overpayment

#### `finalizeMatch()`

Determine match winner after voting deadline.

```solidity
function finalizeMatch() external {
    require(block.timestamp >= votingDeadline, "Voting not ended");
    require(!matchFinalized, "Already finalized");

    matchFinalized = true;

    // Winner is team with more ETH
    if (teamAETH > teamBETH) {
        winningTeam = 0;
    } else if (teamBETH > teamAETH) {
        winningTeam = 1;
    } else {
        winningTeam = 255; // Tie
    }

    emit MatchFinalized(winningTeam, teamAETH, teamBETH, block.timestamp);
}
```

**Requirements:**
- Voting deadline has passed
- Not already finalized

**Effects:**
- Sets `matchFinalized = true`
- Determines `winningTeam` based on total ETH

#### `claimPayout() returns (uint256)`

Claim payout for voting on winning team.

```solidity
function claimPayout() external returns (uint256) {
    require(matchFinalized, "Match not finalized");
    require(!hasClaimed[msg.sender], "Already claimed");

    uint256 payout = calculateWinnings(msg.sender);
    require(payout > 0, "No winnings");

    hasClaimed[msg.sender] = true;
    claimedAmount[msg.sender] = payout;

    payable(msg.sender).transfer(payout);

    emit PayoutClaimed(msg.sender, payout);
    return payout;
}
```

**Requirements:**
- Match is finalized
- User hasn't claimed yet
- User has winnings > 0

**Returns:**
- Amount claimed in wei

### View Functions

#### `calculateVotePrice(uint8 team) view returns (uint256)`

Calculate current vote price for a team.

```solidity
function calculateVotePrice(uint8 team) public view returns (uint256) {
    require(team == 0 || team == 1, "Invalid team");

    uint256 voteCount = team == 0 ? teamAVoteCount : teamBVoteCount;
    uint8 phase = getCurrentPhase();

    if (phase == 0) {
        revert("Voting closed");
    } else if (phase == 1) {
        // Phase 1: Linear pricing
        return BASE_PRICE + (voteCount * LINEAR_INCREMENT);
    } else {
        // Phase 2: Exponential pricing
        // Get Phase 1 end price
        uint256 phase1Price = getPhase1EndPrice();

        // Calculate votes in Phase 2 for this team
        uint256 teamPhase1Votes = getTeamPhase1Votes(team);
        uint256 phase2Votes = voteCount - teamPhase1Votes;

        // Apply exponential multiplier (1.1 ^ phase2Votes)
        uint256 price = phase1Price;
        for (uint256 i = 0; i < phase2Votes; i++) {
            price = (price * EXPONENTIAL_MULTIPLIER) / 100;
        }

        return price;
    }
}
```

**Formula Details:**

**Phase 1 (0-2 hours):**
```
price = 0.001 + (voteCount × 0.0001)
```

Example progression:
- Vote 1: 0.001 ETH
- Vote 10: 0.002 ETH
- Vote 20: 0.003 ETH
- Vote 100: 0.011 ETH

**Phase 2 (2-24 hours):**
```
phase1EndPrice = 0.001 + (phase1VoteCount × 0.0001)
price = phase1EndPrice × (1.1 ^ phase2VoteCount)
```

Example (assuming 100 votes in Phase 1, phase1EndPrice = 0.011):
- Vote 101: 0.011 × 1.1 = 0.0121 ETH
- Vote 105: 0.011 × 1.1⁵ = 0.0177 ETH
- Vote 110: 0.011 × 1.1¹⁰ = 0.0285 ETH

**Parameters:**
- `team`: 0 or 1

**Returns:**
- Current vote price in wei

#### `getCurrentPhase() view returns (uint8)`

Get current voting phase.

```solidity
function getCurrentPhase() public view returns (uint8) {
    if (block.timestamp >= votingDeadline) {
        return 0; // Voting closed
    } else if (block.timestamp < phase1EndTime) {
        return 1; // Phase 1
    } else {
        return 2; // Phase 2
    }
}
```

**Returns:**
- `0`: Voting closed
- `1`: Phase 1 (linear pricing)
- `2`: Phase 2 (exponential pricing)

#### `calculateWinnings(address user) view returns (uint256)`

Calculate claimable winnings for a user.

```solidity
function calculateWinnings(address user) public view returns (uint256) {
    if (!matchFinalized) return 0;

    // Handle tie (refund all votes)
    if (winningTeam == 255) {
        return userETHTeamA[user] + userETHTeamB[user];
    }

    // Get user's VOTE COUNT for winning team
    uint256 userVotes = winningTeam == 0 ? userVotesTeamA[user] : userVotesTeamB[user];
    if (userVotes == 0) return 0;

    // Calculate based on VOTE COUNT (not ETH amount)
    uint256 totalPrizePool = teamAETH + teamBETH;
    uint256 winnerPool = (totalPrizePool * WINNER_SHARE_PERCENT) / 100;
    uint256 winningTeamVoteCount = winningTeam == 0 ? teamAVoteCount : teamBVoteCount;

    // Payout = (user votes / total votes) × winner pool
    return (winnerPool * userVotes) / winningTeamVoteCount;
}
```

**Payout Formula:**
```
winnerPool = (teamAETH + teamBETH) × 0.90
userPayout = (userVoteCount / winningTeamVoteCount) × winnerPool
```

**Critical:** Uses vote COUNT, not ETH amount.

**Example:**
- Total prize pool: 10 ETH
- Winner pool (90%): 9 ETH
- Winning team votes: 100
- User's votes: 10
- User's payout: (10 / 100) × 9 = 0.9 ETH

**Parameters:**
- `user`: Address to calculate for

**Returns:**
- Claimable amount in wei

#### `getUserStats(address user) view returns (UserStats memory)`

Get comprehensive user stats.

```solidity
struct UserStats {
    uint256 votesTeamA;
    uint256 votesTeamB;
    uint256 ethTeamA;
    uint256 ethTeamB;
    uint256 claimableWinnings;
    bool hasClaimed;
}

function getUserStats(address user) external view returns (UserStats memory) {
    return UserStats({
        votesTeamA: userVotesTeamA[user],
        votesTeamB: userVotesTeamB[user],
        ethTeamA: userETHTeamA[user],
        ethTeamB: userETHTeamB[user],
        claimableWinnings: calculateWinnings(user),
        hasClaimed: hasClaimed[user]
    });
}
```

### Admin Functions

#### `withdrawPlatformFee()`

Withdraw platform fee (10% of prize pool).

```solidity
function withdrawPlatformFee() external {
    require(msg.sender == platformWallet, "Not platform wallet");
    require(matchFinalized, "Match not finalized");

    uint256 totalPrizePool = teamAETH + teamBETH;
    uint256 platformFee = (totalPrizePool * PLATFORM_FEE_PERCENT) / 100;

    payable(platformWallet).transfer(platformFee);

    emit PlatformFeeWithdrawn(platformWallet, platformFee);
}
```

## Events

### `VoteCast`

```solidity
event VoteCast(
    address indexed voter,
    bytes2 indexed country,
    uint256 price,
    uint8 phase,
    uint256 totalVotes
);
```

### `MatchFinalized`

```solidity
event MatchFinalized(
    uint8 winningTeam,
    uint256 teamAETH,
    uint256 teamBETH,
    uint256 timestamp
);
```

### `PayoutClaimed`

```solidity
event PayoutClaimed(
    address indexed claimer,
    uint256 amount
);
```

### `PlatformFeeWithdrawn`

```solidity
event PlatformFeeWithdrawn(
    address indexed platform,
    uint256 amount
);
```

## Factory Pattern

### MatchFactory Contract

Deploys individual match contracts.

```solidity
contract MatchFactory {
    address public matchRegistry;
    address public platformWallet;

    event MatchCreated(
        uint256 indexed matchId,
        address matchContract,
        bytes2 teamA,
        bytes2 teamB,
        uint256 startTime
    );

    function createMatch(
        uint256 matchId,
        bytes2 teamA,
        bytes2 teamB,
        uint256 startTime
    ) external onlyOwner returns (address) {
        TournamentMatch match = new TournamentMatch(
            teamA,
            teamB,
            startTime,
            platformWallet
        );

        // Register in MatchRegistry
        IMatchRegistry(matchRegistry).registerMatch(
            matchId,
            address(match),
            teamA,
            teamB,
            startTime
        );

        emit MatchCreated(matchId, address(match), teamA, teamB, startTime);
        return address(match);
    }
}
```

## Critical Fixes from Old Implementation

### ❌ OLD (INCORRECT):
```solidity
// Wrong: Stores ETH amount as "votes"
team1TotalVotes += msg.value;

// Wrong: Payout based on ETH contributed
return (winnerPool * voterAmount) / winningTeamTotal;
```

### ✅ NEW (CORRECT):
```solidity
// Right: Track vote COUNT separately
teamAVoteCount += 1;
teamAETH += currentPrice;

// Right: Payout based on vote COUNT
return (winnerPool * userVoteCount) / winningTeamVoteCount;
```

## Gas Optimization

### Storage Packing

```solidity
// Pack booleans and small uints
bool public phase1Ended;
bool public matchFinalized;
uint8 public winningTeam;
```

### Price Calculation

Phase 2 exponential calculation uses a loop:
```solidity
for (uint256 i = 0; i < phase2Votes; i++) {
    price = (price * 110) / 100;
}
```

For high vote counts, this could be gas-intensive. Consider:
- Caching calculated prices
- Using logarithmic calculation
- Setting max votes per team

## Security Considerations

### Reentrancy

- Use `ReentrancyGuard` on `vote()` and `claimPayout()`
- Follow Checks-Effects-Interactions pattern

### Integer Math

- All calculations use Solidity 0.8.0+ overflow protection
- Division always rounds down (favors protocol)

### Access Control

- Only factory can deploy
- Only platform wallet can withdraw fees
- Match finalization is permissionless (anyone can call after deadline)

## Testing Requirements

### Unit Tests

- Vote in Phase 1 (linear pricing)
- Vote in Phase 2 (exponential pricing)
- Phase transition accuracy
- Vote count vs ETH tracking
- Payout calculation correctness
- Early voter advantage verification
- Tie handling
- Claim prevention (double claim, early claim)
- Platform fee calculation

### Integration Tests

- Full 24-hour match lifecycle
- Multiple users voting across phases
- Price progression accuracy
- Winner determination
- Payout distribution
- Gas costs per operation

### Edge Cases

- First vote
- Last vote before deadline
- Vote at exact phase transition
- Tie scenario
- All votes on one team
- User votes for both teams
- Extremely high vote counts (gas limits)

## Example Scenario

### Match: Brazil vs Argentina

**Phase 1 (0-2 hours):**

Alice votes for Brazil 10 times:
- Vote 1: 0.001 ETH → BR has 1 vote
- Vote 2: 0.0011 ETH → BR has 2 votes
- ...
- Vote 10: 0.0019 ETH → BR has 10 votes
- **Alice spent: ~0.0145 ETH, owns 10 votes**

**Phase 2 (2-24 hours):**

Bob votes for Brazil 5 times (starting when BR has 50 votes from Phase 1):
- Phase 1 ended at vote 50, phase1EndPrice = 0.006 ETH
- Vote 51: 0.006 × 1.1 = 0.0066 ETH
- Vote 52: 0.006 × 1.1² = 0.00726 ETH
- ...
- **Bob spent: ~0.038 ETH, owns 5 votes**

**Match Result:**
- Brazil wins with 100 ETH total
- Winner pool (90%): 90 ETH
- Brazil total votes: 200

**Payouts:**
- Alice: (10 / 200) × 90 = 4.5 ETH
- Bob: (5 / 200) × 90 = 2.25 ETH

**Alice gets 2× Bob's payout despite spending 4× less ETH.**

This is the intended early voter advantage.

## Deployment Checklist

- [ ] Compile with optimizer enabled
- [ ] Deploy MatchFactory to testnet
- [ ] Create test match and verify pricing
- [ ] Test full 24h cycle (use test time manipulation)
- [ ] Verify vote count vs ETH tracking
- [ ] Verify payout calculations
- [ ] Deploy to mainnet
- [ ] Set platform wallet
- [ ] Verify on block explorer

## Related Documents

- [ROADMAP.md](../ROADMAP.md) - Official specification
- [QUALIFICATION_CONTRACT_SPEC.md](./QUALIFICATION_CONTRACT_SPEC.md) - Qualification phase
- [TWO_PHASE_SYSTEM.md](../architecture/TWO_PHASE_SYSTEM.md) - System architecture
- [pricing_analysis.md](../planning/pricing_analysis.md) - Pricing mechanism analysis
