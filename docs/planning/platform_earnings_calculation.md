# Platform Earnings Calculation - 100 Votes Per Match

## Pricing Model Recap

**Phase 1 (First 2 Hours): Linear**
```
price = 0.001 + (voteCount × 0.0001)
```

**Phase 2 (Hours 2-24): Exponential**
```
phase1EndPrice = 0.001 + (phase1VoteCount × 0.0001)
price = phase1EndPrice × (1.1 ^ phase2VoteCount)
```

**Platform Fee**: 10% of total prize pool

## Calculation: 100 Votes Total

### Scenario 1: 30 votes in Phase 1, 70 votes in Phase 2

**Phase 1 (Votes 1-30):**
- Vote 1: 0.001 ETH
- Vote 2: 0.0011 ETH
- Vote 3: 0.0012 ETH
- ...
- Vote 30: 0.001 + (29 × 0.0001) = 0.004 ETH

Phase 1 total: Sum from 0.001 to 0.004
= 30 × (0.001 + 0.004) / 2 = 30 × 0.0025 = **0.075 ETH**

Phase 1 end price: 0.004 ETH

**Phase 2 (Votes 31-100):**
- Starting price: 0.004 ETH
- Vote 31: 0.004 × 1.1 = 0.0044 ETH
- Vote 32: 0.004 × 1.1² = 0.00484 ETH
- ...
- Vote 100: 0.004 × 1.1^70 = 0.004 × 789.75 = **3.159 ETH**

Phase 2 total: Sum of geometric series
= 0.004 × (1.1^70 - 1) / (1.1 - 1)
= 0.004 × (789.75 - 1) / 0.1
= 0.004 × 7887.5 = **31.55 ETH**

**Total Prize Pool**: 0.075 + 31.55 = **31.625 ETH**
**Platform Fee (10%)**: **3.1625 ETH per match**

---

### Scenario 2: 20 votes in Phase 1, 80 votes in Phase 2

**Phase 1 (Votes 1-20):**
- Vote 1: 0.001 ETH
- Vote 20: 0.001 + (19 × 0.0001) = 0.0029 ETH

Phase 1 total: 20 × (0.001 + 0.0029) / 2 = **0.039 ETH**

Phase 1 end price: 0.0029 ETH

**Phase 2 (Votes 21-100):**
- Starting price: 0.0029 ETH
- Vote 100: 0.0029 × 1.1^80 = 0.0029 × 2048.4 = **5.94 ETH**

Phase 2 total: 0.0029 × (1.1^80 - 1) / 0.1
= 0.0029 × 20474 = **59.37 ETH**

**Total Prize Pool**: 0.039 + 59.37 = **59.409 ETH**
**Platform Fee (10%)**: **5.9409 ETH per match**

---

### Scenario 3: 50 votes in Phase 1, 50 votes in Phase 2

**Phase 1 (Votes 1-50):**
- Vote 1: 0.001 ETH
- Vote 50: 0.001 + (49 × 0.0001) = 0.0059 ETH

Phase 1 total: 50 × (0.001 + 0.0059) / 2 = **0.1725 ETH**

Phase 1 end price: 0.0059 ETH

**Phase 2 (Votes 51-100):**
- Starting price: 0.0059 ETH
- Vote 100: 0.0059 × 1.1^50 = 0.0059 × 117.39 = **0.6926 ETH**

Phase 2 total: 0.0059 × (1.1^50 - 1) / 0.1
= 0.0059 × 1163.9 = **6.867 ETH**

**Total Prize Pool**: 0.1725 + 6.867 = **7.0395 ETH**
**Platform Fee (10%)**: **0.70395 ETH per match**

---

## Summary Table

| Phase 1 Votes | Phase 2 Votes | Total Prize Pool | Platform Fee (10%) |
|--------------|---------------|------------------|-------------------|
| 30 | 70 | 31.625 ETH | **3.16 ETH** |
| 20 | 80 | 59.409 ETH | **5.94 ETH** |
| 50 | 50 | 7.04 ETH | **0.70 ETH** |
| 40 | 60 | ~15 ETH | **~1.5 ETH** |

## Key Insights

1. **More votes in Phase 2 = Higher prize pool**
   - Exponential growth in Phase 2 creates much larger pools
   - But prices become very high, limiting participation

2. **Realistic Scenario (30-40 Phase 1, 60-70 Phase 2)**
   - Expected prize pool: **15-35 ETH per match**
   - Platform fee: **1.5-3.5 ETH per match**

3. **Total Tournament Earnings**
   - If we have ~100 matches total (qualifiers + main)
   - At 2 ETH per match average: **200 ETH total platform fee**
   - At 3 ETH per match average: **300 ETH total platform fee**

## Conservative Estimate

Assuming realistic participation:
- **Average prize pool per match: 20 ETH**
- **Platform fee per match: 2 ETH**
- **100 matches total: 200 ETH platform earnings**

## Notes

- These calculations assume all votes go to one team (worst case for prize pool)
- In reality, votes split between teams, but total pool is the same
- Platform fee is always 10% regardless of vote distribution
- Gas costs for contract operations are separate from platform fee

