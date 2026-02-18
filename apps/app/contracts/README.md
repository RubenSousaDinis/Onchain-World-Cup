# Onchain World Cup Smart Contracts

## Overview

This directory contains the Solidity smart contracts for the Onchain World Cup 2026 betting platform.

## Contracts

### WorldCupMatch.sol

The main contract for individual World Cup matches. Features:

- **2-Phase Time-Based Pricing:**
  - Phase 1 (First 2 hours): Linear pricing with 5% fee
  - Phase 2 (Hours 2-24): Exponential pricing with 15% fee

- **Voting Mechanism:**
  - Users vote by sending ETH to the `vote(teamIndex)` function
  - Team with most ETH voted wins
  - All votes are recorded on-chain

- **Prize Distribution:**
  - 90% of total prize pool goes to winning voters (proportional to their votes)
  - 10% platform fee
  - In case of tie, all voters get full refunds

- **Winner Determination:**
  - Match must be finalized after match end time
  - Anyone can call `finalizeMatch()` to determine winner
  - Winners can withdraw their proportional share via `withdrawWinnings()`

### WorldCupFactory.sol

Factory contract for deploying match contracts. Features:

- Deploy new match contracts via `createMatch()`
- Track all deployed matches
- Centralized platform address management

## Deployment

To deploy these contracts to Base network:

1. Set up your deployment environment with Hardhat or Foundry
2. Configure Base network RPC and deployer private key
3. Deploy WorldCupFactory first
4. Use factory to deploy individual match contracts

## Testing

These contracts should be thoroughly tested before mainnet deployment:

- Test both pricing phases
- Test winner determination edge cases
- Test withdrawal mechanisms
- Test with tie scenarios
- Gas optimization testing

## Base Network Compatibility

These contracts are fully compatible with Base network and follow standard Ethereum/EVM patterns. They use:

- Solidity ^0.8.20
- Standard ERC patterns
- No external dependencies
- Gas-optimized storage patterns

## Security Considerations

- Reentrancy protection via checks-effects-interactions pattern
- Safe ETH transfers using low-level call
- Access control for platform fee withdrawal
- Time-based voting restrictions
- Vote finality (no vote changes after placement)
