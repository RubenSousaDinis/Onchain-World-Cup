# WorldCupQualification Contract Documentation

## Overview

The `WorldCupQualification` contract is the core smart contract for the qualification phase of the Onchain World Cup. It enables users to vote for countries using ETH, with a linear pricing model and a unified prize pool distribution system.

## Contract Address

**Network**: Base (Mainnet/Testnet)  
**Contract**: `WorldCupQualification.sol`  
**Version**: 1.0

## Key Features

### 1. Linear Pricing Model
- **Base Price**: 0.001 ETH per vote
- **Price Increment**: 0.0005 ETH per additional vote
- **Formula**: `Price = BASE_PRICE + (voteCount × PRICE_INCREMENT)`
- Each country has its own vote count, so prices are independent per country

### 2. Unified Prize Pool
- All qualified countries share a single prize pool
- Payout formula: `(userQualifiedVotes × totalPrizePool) / totalQualifiedVotes`
- Users who voted for any of the top 48 countries share the pool proportionally

### 3. Platform Fee
- **Default**: 10% (1000 basis points)
- **Maximum**: 20% (2000 basis points)
- **Updatable**: Owner can adjust fee during qualification phase (for discounts/promotions)
- Fee is deducted from each vote and transferred immediately

### 4. Trust Guarantees
- ✅ Admin can only curate country list (cannot affect outcomes)
- ✅ Countries cannot qualify without votes
- ✅ All actions are transparent and time-limited
- ✅ Community decides the outcome
- ✅ Admin cannot inject ETH or modify votes

## Contract Structure

### Constants
```solidity
BASE_PRICE = 0.001 ether
PRICE_INCREMENT = 0.0005 ether
MAX_PLATFORM_FEE_BPS = 2000 (20%)
MAX_VOTES_PER_TX = 100
QUALIFICATION_SPOTS = 48
```

### State Variables
- `qualificationEndTime`: Timestamp when qualification phase ends
- `feeRecipient`: Address that receives platform fees
- `platformFeeBps`: Current platform fee in basis points (updatable)
- `qualificationFinalized`: Whether qualification results are finalized
- `totalPrizePool`: Total ETH available for winners (net of fees)
- `totalPlatformFees`: Total platform fees collected
- `totalETHCollected`: Total ETH collected (before fees)

### Country Management
- `validCountry[bytes2]`: Whitelist of countries that can receive votes
- `countryVotes[bytes2]`: Vote count per country
- `countryETH[bytes2]`: Total ETH collected per country
- `isQualified[bytes2]`: Whether a country qualified for tournament

### User Data
- `userVotes[address][bytes2]`: User's vote count per country
- `hasClaimed[address]`: Whether user has claimed winnings

## Core Functions

### Voting

#### `vote(bytes2 country, uint256 votes)`
Vote for a country by sending ETH.

**Parameters:**
- `country`: ISO 3166-1 alpha-2 country code (e.g., "US", "BR")
- `votes`: Number of votes to purchase (1-100)

**Behavior:**
- Calculates total cost based on current vote count
- Deducts platform fee (10% by default)
- Adds remaining ETH to prize pool
- Updates vote counts and ETH tracking
- Emits `Voted` and `VotePlaced` events

**Requirements:**
- Qualification period must not have ended
- Country must be in whitelist
- Payment must be sufficient
- Contract must not be finalized

### Pricing

#### `votePrice(bytes2 country) → uint256`
Get current price for next vote for a country.

#### `calculateVoteCost(bytes2 country, uint256 votes) → uint256`
Calculate total cost for multiple votes in one transaction.

### Qualification Finalization

#### `finalizeQualification(bytes2[] calldata qualifiedCountries)`
Finalize qualification by specifying the top 48 countries.

**Parameters:**
- `qualifiedCountries`: Array of exactly 48 country codes

**Requirements:**
- Only callable by owner
- Qualification period must have ended
- Must specify exactly 48 countries
- **CRITICAL**: Each country must have at least 1 vote (trust guarantee)

**Behavior:**
- Marks countries as qualified
- Calculates total qualified votes
- Emits `QualificationEnded`, `QualificationFinalized`, and `PrizesDistributed` events

### Claiming Winnings

#### `claimable(address user) → uint256`
Calculate how much a user can claim.

**Formula:**
```
userQualifiedVotes = sum of user's votes for all qualified countries
claimable = (userQualifiedVotes × totalPrizePool) / totalQualifiedVotes
```

#### `claim()`
Withdraw winnings from the prize pool.

**Requirements:**
- Qualification must be finalized
- User must have voted for at least one qualified country
- User must not have already claimed

### Admin Functions

#### `addCountry(bytes2 country)`
Add a new country to the whitelist (owner only, during qualification).

#### `addCountries(bytes2[] calldata countries)`
Add multiple countries at once.

#### `removeCountry(bytes2 country)`
Remove a country from whitelist (only if it has 0 votes).

#### `setPlatformFee(uint256 newFeeBps)`
Update platform fee (owner only, during qualification, max 20%).

**Use Cases:**
- Offer discounts during qualification
- Run promotions (e.g., 0% fee for limited time)
- Adjust fee based on market conditions

#### `withdrawPlatformFees()`
Withdraw accumulated platform fees to fee recipient.

### View Functions

#### `getETHPerCountry(bytes2 country) → uint256`
Get total ETH collected for a country (read-only metric).

#### `getTotalPrizePool() → uint256`
Get total prize pool available for distribution.

#### `getPlatformFeeAmount() → uint256`
Get total platform fees collected.

#### `getUserVotes(address user) → (bytes2[], uint256[])`
Get all countries a user voted for and their vote counts.

#### `getQualificationDetails() → (uint256, uint256, uint8, bool, uint256)`
Get qualification phase details (prize pool, end time, spots, finalized status, voter count).

## Events

### `Voted(address indexed user, bytes2 indexed country, uint256 amount)`
Emitted when a user votes for a country.

### `VotePlaced(address indexed voter, bytes2 indexed country, uint256 votes, uint256 cost, uint256 timestamp)`
Detailed vote event with timestamp.

### `CountryAdded(bytes2 country)`
Emitted when admin adds a country.

### `CountryRemoved(bytes2 country)`
Emitted when admin removes a country.

### `PlatformFeeUpdated(uint256 oldFeeBps, uint256 newFeeBps)`
Emitted when platform fee is updated.

### `QualificationEnded()`
Emitted when qualification period ends.

### `QualificationFinalized(bytes2[] qualifiedCountries)`
Emitted when qualification results are finalized.

### `WinningsClaimed(address indexed user, uint256 amount)`
Emitted when a user claims their winnings.

### `PlatformFeesWithdrawn(uint256 amount)`
Emitted when platform fees are withdrawn.

### `PrizesDistributed(uint256 totalPrizePool)`
Emitted when prizes are finalized for distribution.

## Security Features

### Reentrancy Protection
- All payable functions use `ReentrancyGuard`
- Prevents reentrancy attacks

### Access Control
- Owner-only functions for admin actions
- Time-based restrictions on country management
- Finalization prevents further modifications

### Trust Guarantees
- Countries cannot qualify without votes
- Admin cannot inject ETH
- Admin cannot modify votes
- All actions are transparent via events

### Input Validation
- Country codes must be valid (bytes2, non-zero)
- Vote counts must be within limits (1-100)
- Fees cannot exceed maximum (20%)
- Payment must be sufficient

## Time-Based Restrictions

### During Qualification Phase
- ✅ Voting allowed
- ✅ Admin can add/remove countries
- ✅ Admin can update platform fee
- ✅ Admin can withdraw platform fees

### After Qualification Ends
- ❌ Voting blocked
- ❌ Country list frozen
- ❌ Platform fee frozen
- ✅ Admin can finalize qualification
- ✅ Users can claim winnings

### After Finalization
- ❌ All modifications blocked
- ✅ Users can claim winnings
- ✅ Admin can withdraw platform fees

## Pricing Examples

### Example 1: First Vote for a Country
- Country: "US"
- Current votes: 0
- Price: 0.001 ETH (BASE_PRICE)

### Example 2: 10th Vote for a Country
- Country: "BR"
- Current votes: 9
- Price: 0.001 + (9 × 0.0005) = 0.0055 ETH

### Example 3: Buying 3 Votes at Once
- Country: "AR"
- Current votes: 5
- Vote 1: 0.001 + (5 × 0.0005) = 0.0035 ETH
- Vote 2: 0.001 + (6 × 0.0005) = 0.004 ETH
- Vote 3: 0.001 + (7 × 0.0005) = 0.0045 ETH
- **Total**: 0.012 ETH

## Payout Examples

### Scenario: 3 Countries Qualify

**Setup:**
- US: 100 votes, 1 ETH collected
- BR: 50 votes, 0.5 ETH collected
- AR: 25 votes, 0.25 ETH collected
- Total qualified votes: 175
- Total prize pool: 1.575 ETH (90% of 1.75 ETH)

**User A:**
- Voted 10 times for US
- Share: (10 / 175) × 1.575 = 0.09 ETH

**User B:**
- Voted 5 times for US, 5 times for BR
- Share: ((5 + 5) / 175) × 1.575 = 0.09 ETH

**User C:**
- Voted 20 times for AR
- Share: (20 / 175) × 1.575 = 0.18 ETH

## Gas Optimization

- Uses `bytes2` for country codes (gas efficient)
- Minimal state variables
- Efficient vote counting
- Batch operations where possible

## Deployment

### Constructor Parameters
```solidity
constructor(
    uint256 _qualificationEndTime,      // Timestamp when qualification ends
    address _feeRecipient,              // Address to receive platform fees
    bytes2[] memory _initialCountries,  // Initial country whitelist
    uint256 _initialPlatformFeeBps      // Initial platform fee (e.g., 1000 = 10%)
)
```

### Example Deployment
```javascript
const qualificationEndTime = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days from now
const feeRecipient = "0x..."; // Platform wallet
const initialCountries = ["US", "BR", "AR", ...]; // Convert to bytes2
const initialFee = 1000; // 10%

await WorldCupQualification.deploy(
  qualificationEndTime,
  feeRecipient,
  initialCountries,
  initialFee
);
```

## Integration Guide

### Frontend Integration

1. **Get Current Price**
```typescript
const price = await contract.votePrice("US");
```

2. **Calculate Vote Cost**
```typescript
const cost = await contract.calculateVoteCost("US", 3);
```

3. **Vote**
```typescript
await contract.vote("US", 1, { value: price });
```

4. **Check Claimable Amount**
```typescript
const claimable = await contract.claimable(userAddress);
```

5. **Claim Winnings**
```typescript
await contract.claim();
```

### Event Listening

```typescript
// Listen for votes
contract.on("Voted", (user, country, amount) => {
  console.log(`${user} voted ${amount} ETH for ${country}`);
});

// Listen for qualification finalization
contract.on("QualificationFinalized", (countries) => {
  console.log("Qualified countries:", countries);
});
```

## Best Practices

1. **Price Slippage**: Always check price right before submitting transaction
2. **Gas Estimation**: Estimate gas before voting
3. **Event Indexing**: Index events for efficient queries
4. **Error Handling**: Handle insufficient payment gracefully
5. **User Education**: Explain linear pricing to users

## Testing

Comprehensive test suite with 65+ tests covering:
- Deployment and initialization
- Voting and pricing
- Qualification finalization
- Winnings calculation and claiming
- Admin functions
- Security guarantees
- Edge cases

Run tests:
```bash
npx hardhat test test/WorldCupQualification.test.js
```

## Security Audit Checklist

- [x] Reentrancy protection
- [x] Access control
- [x] Input validation
- [x] Integer overflow protection (Solidity 0.8+)
- [x] Time-based restrictions
- [x] Trust guarantees
- [x] Event emissions
- [x] Comprehensive test coverage

## Known Limitations

1. **Gas Costs**: Sorting countries in `getTopCountries()` can be expensive for many countries
2. **Voter Count**: Exact voter count not tracked (approximation in `getQualificationDetails()`)
3. **Price Slippage**: Users may see different prices than displayed if voting simultaneously

## Future Enhancements

- Batch voting optimizations
- Voter tracking for exact counts
- Price slippage protection
- Multi-sig for critical admin functions

## Support

For questions or issues:
- Check contract source code: `contracts/WorldCupQualification.sol`
- Review tests: `test/WorldCupQualification.test.js`
- Contact: [Your contact info]
