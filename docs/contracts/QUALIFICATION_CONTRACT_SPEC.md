# Qualification Contract Specification

## Overview

The Qualification Contract implements the **Phase 1** voting mechanism of the Onchain World Cup. This contract allows users to support countries using fixed-price ETH votes with time-based fees. At the end of the qualification period, the top 48 countries advance to the tournament phase.

**This is NOT a prediction market** - it's a social coordination game measuring onchain popularity.

## Core Principles (from ROADMAP.md)

1. **Simplicity over cleverness**
2. **No dynamic pricing curves**
3. **No prediction-market mechanics**
4. **Auditable arithmetic only**
5. **Clear UX in one paragraph**

## Contract Purpose

- Enable users to support countries with fixed-price ETH votes
- Apply time-based fees to incentivize early participation
- Track total support per country across all voters
- Determine top 48 countries for tournament qualification
- Distribute prize pool proportionally to supporters of qualified countries

## Voting Mechanics

### Fixed-Price Voting

```solidity
uint256 public constant VOTE_PRICE = 0.001 ether;
```

- Every vote costs exactly **0.001 ETH**
- No bonding curves
- No per-country multipliers
- No per-wallet curves
- Price is immutable

### Time-Based Fees

Fees increase globally over time to incentivize early participation and reduce late-stage manipulation.

**Example Schedule (configurable):**

| Week | Fee Percentage |
|------|----------------|
| Week 0 | 0% |
| Week 1 | 2% |
| Week 2 | 4% |
| Week 3 | 6% |
| Week 4 | 8% |
| Final Week | 10% |

**Fee Application:**
- Fee is applied at purchase time based on current week
- Fee ETH is excluded from prize pool
- Fee goes to platform wallet
- Fee schedule is immutable once phase starts

**Example:**
- User votes in Week 2 (4% fee)
- User pays: 0.001 ETH
- Prize pool receives: 0.001 × 0.96 = 0.00096 ETH
- Platform receives: 0.001 × 0.04 = 0.00004 ETH

## State Variables

### Core Voting State

```solidity
// Immutable configuration
uint256 public constant VOTE_PRICE = 0.001 ether;
uint256 public constant QUALIFICATION_COUNT = 48;
uint256 public immutable phaseStartTime;
uint256 public immutable phaseEndTime;
address public immutable platformWallet;

// Fee schedule (array of percentages by week)
uint8[] public feeSchedule; // e.g., [0, 2, 4, 6, 8, 10]

// Voting state
mapping(bytes2 => uint256) public countryVotes;      // Vote count per country
mapping(bytes2 => uint256) public countryETH;        // Total ETH per country (after fees)
mapping(address => mapping(bytes2 => uint256)) public userVotes;  // User votes per country
mapping(address => mapping(bytes2 => uint256)) public userETH;    // User ETH per country (after fees)

// Phase state
bool public qualificationFinalized;
bytes2[48] public qualifiedCountries;
uint256 public totalPrizePool;
uint256 public totalVotesOnQualified;

// Claims tracking
mapping(address => bool) public hasClaimedReward;
mapping(address => uint256) public claimedAmount;
```

### Country Code Format

- Uses **ISO 3166-1 alpha-2** country codes (e.g., "US", "BR", "FR")
- Stored as `bytes2` for gas efficiency
- Max 200+ countries supported

## Functions

### User Functions

#### `vote(bytes2 countryCode) payable`

Cast a support vote for a country.

```solidity
function vote(bytes2 countryCode) external payable {
    require(block.timestamp < phaseEndTime, "Qualification ended");
    require(!qualificationFinalized, "Qualification finalized");
    require(msg.value == VOTE_PRICE, "Incorrect payment");

    // Calculate current fee
    uint256 currentFee = getCurrentFee();
    uint256 feeAmount = (msg.value * currentFee) / 100;
    uint256 prizePoolAmount = msg.value - feeAmount;

    // Update state
    countryVotes[countryCode] += 1;
    countryETH[countryCode] += prizePoolAmount;
    userVotes[msg.sender][countryCode] += 1;
    userETH[msg.sender][countryCode] += prizePoolAmount;
    totalPrizePool += prizePoolAmount;

    // Transfer fee to platform
    if (feeAmount > 0) {
        payable(platformWallet).transfer(feeAmount);
    }

    emit VoteCast(msg.sender, countryCode, msg.value, currentFee, block.timestamp);
}
```

**Parameters:**
- `countryCode`: ISO 3166-1 alpha-2 country code (bytes2)

**Requirements:**
- Qualification phase has not ended
- Qualification not yet finalized
- Exact payment of 0.001 ETH

**Effects:**
- Increments vote count for country
- Adds ETH to country's prize pool (after fee)
- Tracks user's votes and ETH contribution
- Transfers fee to platform wallet

#### `claimReward() returns (uint256)`

Claim proportional reward for supporting qualified countries.

```solidity
function claimReward() external returns (uint256) {
    require(qualificationFinalized, "Qualification not finalized");
    require(!hasClaimedReward[msg.sender], "Already claimed");

    uint256 reward = calculateUserReward(msg.sender);
    require(reward > 0, "No reward to claim");

    hasClaimedReward[msg.sender] = true;
    claimedAmount[msg.sender] = reward;

    payable(msg.sender).transfer(reward);

    emit RewardClaimed(msg.sender, reward);
    return reward;
}
```

**Requirements:**
- Qualification must be finalized
- User has not already claimed
- User has claimable reward

**Returns:**
- Amount of ETH claimed

### View Functions

#### `getCurrentFee() view returns (uint256)`

Get current fee percentage based on time elapsed.

```solidity
function getCurrentFee() public view returns (uint256) {
    if (block.timestamp >= phaseEndTime) {
        return feeSchedule[feeSchedule.length - 1];
    }

    uint256 elapsed = block.timestamp - phaseStartTime;
    uint256 weeksPassed = elapsed / 1 weeks;

    if (weeksPassed >= feeSchedule.length) {
        return feeSchedule[feeSchedule.length - 1];
    }

    return feeSchedule[weeksPassed];
}
```

**Returns:**
- Current fee percentage (0-100)

#### `calculateUserReward(address user) view returns (uint256)`

Calculate claimable reward for a user.

```solidity
function calculateUserReward(address user) public view returns (uint256) {
    if (!qualificationFinalized) return 0;
    if (totalVotesOnQualified == 0) return 0;

    uint256 userVotesOnQualified = 0;

    // Sum user's votes on all qualified countries
    for (uint256 i = 0; i < QUALIFICATION_COUNT; i++) {
        bytes2 country = qualifiedCountries[i];
        userVotesOnQualified += userVotes[user][country];
    }

    if (userVotesOnQualified == 0) return 0;

    // Proportional reward based on vote count
    return (totalPrizePool * userVotesOnQualified) / totalVotesOnQualified;
}
```

**Formula:**
```
user_reward = (user_votes_on_qualified / total_votes_on_qualified) × total_prize_pool
```

**Parameters:**
- `user`: Address to check

**Returns:**
- Claimable reward amount in wei

#### `getQualifiedCountries() view returns (bytes2[48])`

Get the array of qualified country codes.

```solidity
function getQualifiedCountries() external view returns (bytes2[48] memory) {
    require(qualificationFinalized, "Not finalized");
    return qualifiedCountries;
}
```

**Returns:**
- Array of 48 country codes (bytes2)

#### `getUserStats(address user) view returns (UserStats memory)`

Get comprehensive stats for a user.

```solidity
struct UserStats {
    uint256 totalVotes;
    uint256 totalETH;
    uint256 votesOnQualified;
    uint256 claimableReward;
    bool hasClaimed;
}

function getUserStats(address user) external view returns (UserStats memory) {
    // Implementation calculates all user stats
}
```

### Admin Functions

#### `snapshotQualification()`

Finalize qualification by determining top 48 countries.

```solidity
function snapshotQualification() external onlyOwner {
    require(block.timestamp >= phaseEndTime, "Phase not ended");
    require(!qualificationFinalized, "Already finalized");

    // Sort countries by vote count (off-chain sorting + on-chain verification preferred)
    // Or use optimized on-chain sorting if gas costs acceptable

    bytes2[] memory allCountries = getAllCountries();
    bytes2[] memory sorted = sortCountriesByVotes(allCountries);

    // Take top 48
    for (uint256 i = 0; i < QUALIFICATION_COUNT; i++) {
        qualifiedCountries[i] = sorted[i];
        totalVotesOnQualified += countryVotes[sorted[i]];
    }

    qualificationFinalized = true;

    emit QualificationSnapshot(qualifiedCountries, block.timestamp);
}
```

**Requirements:**
- Phase end time has passed
- Not already finalized
- Only callable by contract owner

**Gas Optimization Notes:**
- Consider off-chain sorting with on-chain verification
- Alternative: Submit top 48 as parameter with proof
- Must be gas-efficient for 200+ countries

## Events

### `VoteCast`

Emitted when a user casts a vote.

```solidity
event VoteCast(
    address indexed voter,
    bytes2 indexed country,
    uint256 amount,
    uint256 feePercent,
    uint256 timestamp
);
```

**Parameters:**
- `voter`: Address that cast the vote
- `country`: Country code voted for
- `amount`: ETH amount paid (0.001 ETH)
- `feePercent`: Fee percentage at time of vote
- `timestamp`: Block timestamp

### `QualificationSnapshot`

Emitted when qualification is finalized.

```solidity
event QualificationSnapshot(
    bytes2[48] qualifiedCountries,
    uint256 timestamp
);
```

**Parameters:**
- `qualifiedCountries`: Array of top 48 country codes
- `timestamp`: Block timestamp

### `RewardClaimed`

Emitted when a user claims their reward.

```solidity
event RewardClaimed(
    address indexed user,
    uint256 amount
);
```

**Parameters:**
- `user`: Address that claimed
- `amount`: ETH amount claimed

## Reward Distribution

### Prize Pool Formation

```
prize_pool = sum(all ETH contributed after fees)
```

- Only ETH-backed votes contribute to prize pool
- Fee ETH is excluded
- Prize pool accumulates throughout qualification phase

### Eligibility

Only users who voted for **qualified countries** (top 48) receive rewards.

Users who voted for eliminated countries receive nothing.

### Distribution Formula

```solidity
user_reward = (user_votes_on_qualified_teams / total_votes_on_qualified_teams) × prize_pool
```

**Example:**
- Total prize pool: 100 ETH
- Total votes on qualified teams: 50,000
- User's votes on qualified teams: 100
- User's reward: (100 / 50,000) × 100 = 0.2 ETH

### Properties

- Linear and deterministic
- No dynamic multipliers
- No floating-point math (uses integer division)
- Claims are user-initiated (pull pattern)
- One claim per user

## Anti-Sybil Mechanisms

### Economic Cost

The system relies on **economic cost**, not identity:

- Every vote requires 0.001 ETH (no free votes)
- Multiple votes from same wallet allowed but always cost ETH
- Sybil attacks are economically expensive

### Optional Wallet Eligibility

Contract can be extended with minimum eligibility criteria:

```solidity
function isEligibleWallet(address wallet) internal view returns (bool) {
    // Example checks:
    // - Wallet age > X days
    // - Previous on-chain activity > Y transactions
    // - Minimum balance > Z ETH
    // Could integrate with Gitcoin Passport or similar
}
```

This is optional and not part of the core MVP.

## Gas Optimization

### Storage Optimization

- Use `bytes2` for country codes (vs strings)
- Pack state variables efficiently
- Use mappings instead of arrays where possible

### Function Optimization

- Minimize storage writes in `vote()`
- Cache frequently accessed values
- Use `calldata` for function parameters
- Optimize loops in `snapshotQualification()`

### Snapshot Optimization

For 200+ countries, on-chain sorting may be gas-prohibitive. Alternatives:

**Option 1: Off-Chain Sorting + On-Chain Verification**
```solidity
function snapshotQualification(bytes2[48] calldata _qualified) external onlyOwner {
    // Verify these are actually top 48
    // More gas efficient than on-chain sorting
}
```

**Option 2: Incremental Snapshot**
```solidity
// Allow snapshot to be built over multiple transactions
function addQualifiedCountry(bytes2 country, uint256 position) external onlyOwner {
    // Add countries one by one or in batches
}
```

## Security Considerations

### Reentrancy Protection

- Use OpenZeppelin's `ReentrancyGuard`
- Follow Checks-Effects-Interactions pattern
- `claimReward()` is vulnerable to reentrancy without protection

### Integer Overflow

- Use Solidity 0.8.0+ (built-in overflow protection)
- Or use SafeMath for older versions

### Access Control

- Use OpenZeppelin's `Ownable` for admin functions
- Only owner can finalize qualification
- Consider multi-sig for ownership

### Front-Running

Not a concern for this contract:
- Fixed-price voting (no arbitrage)
- Time-based fees are public and predictable
- No advantage to front-running votes

## Testing Requirements

### Unit Tests

- Vote with correct payment
- Vote with incorrect payment (should fail)
- Fee calculation at different times
- Prize pool accumulation
- User stats tracking
- Reward calculation
- Claim reward (success and failure cases)
- Double claim prevention
- Qualification snapshot
- Event emissions

### Integration Tests

- Full qualification cycle
- Multiple users voting
- Fee schedule progression
- Top 48 selection accuracy
- Reward distribution correctness
- Gas costs for all operations

### Edge Cases

- Vote on last block before deadline
- Vote after deadline (should fail)
- Claim before finalization (should fail)
- User with 0 qualified votes
- All users vote for same country
- Extremely uneven vote distribution

## Deployment Checklist

- [ ] Compile with optimizer enabled
- [ ] Deploy to testnet
- [ ] Test full qualification cycle on testnet
- [ ] Verify contract on block explorer
- [ ] Set platform wallet address
- [ ] Configure fee schedule
- [ ] Set phase start and end times
- [ ] Transfer ownership to multi-sig
- [ ] Audit contract code
- [ ] Deploy to mainnet
- [ ] Verify on mainnet explorer

## Example Usage Flow

### 1. Deployment

```solidity
QualificationContract qualification = new QualificationContract(
    platformWallet,
    startTime,
    endTime,
    [0, 2, 4, 6, 8, 10] // Fee schedule
);
```

### 2. User Votes

```solidity
// User votes for Brazil (0.001 ETH)
qualification.vote{value: 0.001 ether}("BR");

// User votes for Argentina (0.001 ETH)
qualification.vote{value: 0.001 ether}("AR");
```

### 3. Check Stats

```solidity
uint256 brazilVotes = qualification.countryVotes("BR");
uint256 currentFee = qualification.getCurrentFee();
```

### 4. Phase Ends

```solidity
// Admin finalizes after deadline
qualification.snapshotQualification();
```

### 5. Claim Rewards

```solidity
// User checks claimable amount
uint256 claimable = qualification.calculateUserReward(userAddress);

// User claims
uint256 claimed = qualification.claimReward();
```

## Related Documents

- [ROADMAP.md](../ROADMAP.md) - Official specification
- [TWO_PHASE_SYSTEM.md](../architecture/TWO_PHASE_SYSTEM.md) - System architecture
- [TOURNAMENT_CONTRACT_SPEC.md](./TOURNAMENT_CONTRACT_SPEC.md) - Tournament phase contract
