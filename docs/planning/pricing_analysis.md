# Final Pricing Model: Linear → Exponential (24-hour matches)

## Proposed Model

### Phase 1 (First 2 Hours): Linear Increase
**Goal**: Encourage early participation with accessible, predictable prices

```
price = 0.001 + (voteCount × 0.0001)
```

**Example progression:**
- Vote 1: 0.001 ETH
- Vote 10: 0.002 ETH
- Vote 20: 0.003 ETH
- Vote 30: 0.004 ETH

### Phase 2 (Hours 2-24): Exponential Increase
**Goal**: Create urgency, prevent sniping, maximize prize pool from remaining time

```
phase1EndPrice = 0.001 + (phase1VoteCount × 0.0001)
phase2VoteCount = totalVotes - phase1VoteCount
price = phase1EndPrice × (1.1 ^ phase2VoteCount)
```

**Example (assuming 30 votes in Phase 1):**
- Phase 1 end price: 0.004 ETH (vote 30)
- Vote 31 (hour 3): 0.004 × 1.1 = 0.0044 ETH
- Vote 35 (hour 6): 0.004 × 1.1^5 = 0.00644 ETH
- Vote 40 (hour 12): 0.004 × 1.1^10 = 0.01037 ETH
- Vote 45 (hour 18): 0.004 × 1.1^15 = 0.01671 ETH
- Vote 50 (hour 22): 0.004 × 1.1^20 = 0.02691 ETH

## Why This Works

### Advantages:
1. **Early Participation**: Linear phase encourages many early votes (accessible prices)
2. **Anti-Sniping**: Exponential phase makes waiting expensive
3. **Maximizes Prize Pool**: 
   - Many votes in Phase 1 (low prices)
   - Urgency in Phase 2 drives more votes before prices get too high
4. **Fair**: Early voters get best prices, but system rewards early participation

### Prize Pool Analysis

**Scenario: 50 total votes**
- 30 votes in Phase 1 (first 2 hours)
- 20 votes in Phase 2 (hours 2-24)

**Phase 1 votes:**
- Sum: 0.001 + 0.0011 + ... + 0.004 = ~0.075 ETH

**Phase 2 votes:**
- Vote 31: 0.0044 ETH
- Vote 32: 0.00484 ETH
- ...
- Vote 50: 0.02691 ETH
- Sum: ~0.15 ETH

**Total Prize Pool: ~0.225 ETH**

**vs. Pure Exponential (1.1x):**
- Would only get ~20-25 votes before price becomes prohibitive
- Total: ~0.05 ETH

**vs. Pure Linear:**
- Would get 50+ votes easily
- Total: ~0.15 ETH
- But no urgency/anti-sniping

## Smart Contract Implementation

```solidity
uint256 constant PHASE1_DURATION = 2 hours;
uint256 constant VOTING_DURATION = 24 hours;
uint256 constant INITIAL_PRICE = 0.001 ether;
uint256 constant LINEAR_INCREMENT = 0.0001 ether;
uint256 constant EXPONENTIAL_MULTIPLIER = 110; // 1.1x = 110/100

uint256 public votingStart;
uint256 public phase1EndTime;
uint256 public votingDeadline;
uint256 public phase1VoteCount;
uint256 public phase1EndPrice;

function getCurrentPrice() public view returns (uint256) {
    uint256 timeElapsed = block.timestamp - votingStart;
    
    if (timeElapsed < PHASE1_DURATION) {
        // Phase 1: Linear
        return INITIAL_PRICE + (voteCount * LINEAR_INCREMENT);
    } else {
        // Phase 2: Exponential from Phase 1 end price
        if (phase1EndPrice == 0) {
            // Calculate Phase 1 end price if not set
            phase1EndPrice = INITIAL_PRICE + (phase1VoteCount * LINEAR_INCREMENT);
        }
        
        uint256 phase2VoteCount = voteCount - phase1VoteCount;
        // Calculate: phase1EndPrice × (1.1 ^ phase2VoteCount)
        uint256 price = phase1EndPrice;
        for (uint256 i = 0; i < phase2VoteCount; i++) {
            price = (price * EXPONENTIAL_MULTIPLIER) / 100;
        }
        return price;
    }
}

function vote(uint8 team) public payable {
    require(block.timestamp < votingDeadline, "Voting closed");
    
    uint256 currentPrice = getCurrentPrice();
    require(msg.value >= currentPrice, "Insufficient payment");
    
    // Track Phase 1 end state
    if (block.timestamp < phase1EndTime && voteCount == 0) {
        phase1EndTime = votingStart + PHASE1_DURATION;
    }
    
    if (block.timestamp < phase1EndTime) {
        phase1VoteCount++;
    }
    
    // Record vote...
    voteCount++;
    // ... rest of vote logic
}
```

## Alternative: Smoother Exponential

If 1.1x multiplier is too aggressive, consider **1.08x** or **1.05x**:

### With 1.08x multiplier:
- Vote 31: 0.00432 ETH
- Vote 40: 0.00864 ETH
- Vote 50: 0.01728 ETH
- More accessible, still creates urgency

### With 1.05x multiplier:
- Vote 31: 0.0042 ETH
- Vote 40: 0.00684 ETH
- Vote 50: 0.01113 ETH
- Very accessible, less urgency

## Recommendation

**Use 1.08x or 1.1x for Phase 2:**
- 1.1x: Strong urgency, higher prize pools, but may limit late participation
- 1.08x: Balanced - good urgency, accessible prices, maximizes participation

## Questions

1. **Phase 2 multiplier**: 1.1x (aggressive) or 1.08x (balanced)?
2. **Linear increment**: 0.0001 ETH per vote good, or prefer different amount?
3. **Phase 1 duration**: 2 hours confirmed, or adjust?
