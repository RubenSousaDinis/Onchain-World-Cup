# Vote Script

⚠️ **DEVELOPMENT ONLY** - This script is for local testing and development purposes only.

A utility script to submit votes to the WorldCupQualification contract and immediately index them in the database.

## ⚠️ Important Safety Notice

This script is **ONLY for development and testing**. It should NOT be used in production environments.

**The script will automatically exit if `NODE_ENV=production` is set.**

### Why Development Only?

- This script uses private keys directly from environment variables
- It bypasses normal user authentication flows
- It's designed for manual testing and data seeding
- Production votes should go through the web interface

### Production Voting

In production, users should:
- Vote through the web application interface
- Authenticate with wallet signatures (SIWE/SIWF)
- Votes are automatically indexed via the daily cron job

## Overview

This script automates the process of:
1. Connecting to the WorldCupQualification contract
2. Calculating the cost for the requested number of votes
3. Submitting a vote transaction to the blockchain
4. Waiting for transaction confirmation
5. Triggering the indexer API to immediately update the database (development only)

## Prerequisites

1. **Environment Variables**: Ensure your `.env.local` file has:
   ```bash
   # Required: Private key of the wallet that will vote
   PRIVATE_KEY=your_private_key_here

   # Required: Contract addresses
   NEXT_PUBLIC_QUALIFICATION_CONTRACT_SEPOLIA=0x5b202Aec41D1C85f294267D2A42Eac8865AAcCE9
   NEXT_PUBLIC_QUALIFICATION_CONTRACT_MAINNET=your_mainnet_address_here
   ```

2. **ETH Balance**: The voting wallet must have sufficient ETH to:
   - Pay for the votes
   - Pay for gas fees

3. **Development Server** (optional): For automatic indexing, run:
   ```bash
   npm run dev
   ```

## Usage

### Basic Usage

```bash
npm run vote -- <COUNTRY_CODE> <VOTE_COUNT> [CHAIN_ID]
```

### Parameters

- `COUNTRY_CODE`: 2-8 character country code (e.g., BR, AR, US, PT, GB-ENG)
- `VOTE_COUNT`: Number of votes to cast (1-100)
- `CHAIN_ID`: (Optional) Network chain ID
  - `84532` - Base Sepolia testnet (default)
  - `8453` - Base Mainnet

### Examples

```bash
# Vote 5 times for Brazil on Base Sepolia (testnet)
npm run vote -- BR 5

# Vote 10 times for Argentina on Base Sepolia
npm run vote -- AR 10 84532

# Vote 3 times for Portugal on Base Mainnet
npm run vote -- PT 3 8453

# Vote 1 time for England (using subdivision code)
npm run vote -- GB-ENG 1
```

## What the Script Does

### Step 1: Validation
- Validates country code length (max 8 characters)
- Validates vote count (1-100)
- Validates chain ID (84532 or 8453)
- Checks contract address is configured

### Step 2: Cost Calculation
- Connects to the contract
- Calls `calculateVoteCost()` to get the total ETH cost
- Verifies the wallet has sufficient balance

### Step 3: Vote Submission
- Converts country code to bytes8 format
- Submits the `vote()` transaction with the calculated ETH value
- Displays transaction hash

### Step 4: Confirmation
- Waits for the transaction to be mined
- Displays block number and gas used

### Step 5: Indexing
- Calls `POST /api/indexer/sync` to immediately index the transaction
- Updates database with vote data
- Requires dev server to be running (`npm run dev`)
- If dev server is not running, transaction will still be on blockchain and indexed by cron job later

## Safety Features

### 1. Production Check
The script automatically exits if `NODE_ENV=production`:
```
❌ ERROR: This script is for DEVELOPMENT ONLY
❌ Running this script in production is not allowed.
```

### 2. Mainnet Warning
When voting on Base Mainnet (chainId 8453), the script displays a 5-second warning:
```
⚠️  WARNING: You are about to interact with BASE MAINNET
⚠️  This will use REAL ETH and create REAL transactions
⚠️  Make sure this is intentional!

Press Ctrl+C within 5 seconds to cancel...
```

This gives you time to cancel if you accidentally selected mainnet.

## Output

The script provides detailed output at each step:

```
========== Vote Script Configuration ==========
Network: baseSepolia
Chain ID: 84532
Contract Address: 0x5b202Aec41D1C85f294267D2A42Eac8865AAcCE9
Voter Address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
Voter Balance: 0.5 ETH
Country Code: BR
Vote Count: 5

========== Calculating Vote Cost ==========
Total Cost: 0.015 ETH

========== Submitting Vote Transaction ==========
✅ Transaction submitted!
Transaction Hash: 0xabc123...

⏳ Waiting for transaction confirmation...
✅ Transaction confirmed!
Block Number: 12345678
Gas Used: 150000

========== Vote Summary ==========
{
  "txHash": "0xabc123...",
  "countryCode": "BR",
  "voteCount": 5,
  "totalCostEth": "0.015",
  "blockNumber": "12345678"
}

========== Triggering Indexer API ==========
Calling indexer API: http://localhost:3101/api/indexer/sync
✅ Indexer API response: {
  "success": true,
  "chainId": 84532,
  ...
}

✨ Vote complete!
```

## Verification

After running the script, you can verify the vote:

### 1. Check Blockchain
View the transaction on the block explorer:
- **Base Sepolia**: https://sepolia.basescan.org/tx/YOUR_TX_HASH
- **Base Mainnet**: https://basescan.org/tx/YOUR_TX_HASH

### 2. Check Database
Open Prisma Studio to view the indexed data:
```bash
npm run prisma:studio
```

Look for:
- New record in `QualificationVote` table
- Updated stats in `CountryStats` table
- Updated stats in `UserStat` table

### 3. Check via API
Query the API endpoints:

```bash
# Get country stats
curl http://localhost:3101/api/qualification/countries/BR

# Get all votes
curl http://localhost:3101/api/qualification/votes

# Get leaderboard
curl http://localhost:3101/api/qualification/leaderboard
```

## Troubleshooting

### Error: "Insufficient balance"
- Your wallet doesn't have enough ETH
- Add ETH to your wallet or reduce the vote count

### Error: "Contract address not found"
- Check that `NEXT_PUBLIC_QUALIFICATION_CONTRACT_SEPOLIA` or `NEXT_PUBLIC_QUALIFICATION_CONTRACT_MAINNET` is set in `.env.local`

### Error: "Country code too long"
- Country codes must be 8 characters or less
- Use standard ISO codes (BR, US, PT, etc.)

### Error: "Transaction reverted"
Possible causes:
- Qualification period has ended
- Contract is paused
- Invalid country code
- Insufficient ETH sent

### Warning: "Indexer API call failed"
- The transaction is still on the blockchain
- Make sure development server is running (`npm run dev`)
- The cron job will index it within 24 hours

## Advanced Usage

### Batch Voting
To vote for multiple countries, create a bash script:

```bash
#!/bin/bash
# vote-batch.sh

cd apps/app

npm run vote -- BR 10
npm run vote -- AR 8
npm run vote -- US 5
npm run vote -- PT 12
```

### Custom Network
The script automatically detects the network from chain ID:
- 84532 → Uses `baseSepolia` network from hardhat config
- 8453 → Uses `baseMainnet` network from hardhat config

## Related Documentation

- [Contract Documentation](../contracts/WorldCupQualification.sol)
- [API Documentation](../QUALIFICATION_API.md)
- [Indexer Documentation](../lib/indexer/)
- [Deployment Guide](./deploy-qualification.ts)

## Security Notes

- ⚠️ **Development Only**: Script will not run if `NODE_ENV=production`
- ⚠️ **Private Keys**: Never commit `.env.local` with real private keys
- ⚠️ **Mainnet Warning**: 5-second delay before mainnet transactions
- ⚠️ **Test Networks**: Prefer Base Sepolia for testing
- **Authentication**: Indexer API authentication is bypassed in development
- **Gas Prices**: The script uses default gas prices from the network
- **Nonce Management**: Hardhat automatically manages nonces for sequential transactions

## For Production Use

**DO NOT use this script in production.** Instead:

1. Users vote through the web interface at `https://your-domain.com`
2. Users authenticate with wallet signatures (SIWE/SIWF)
3. Frontend calls contract directly via wagmi
4. Votes are indexed by:
   - Immediate indexing via `/api/votes/immediate-index` (requires auth)
   - Daily cron job at `/api/cron/indexer-sync`

If you need to submit a vote programmatically in production, use the web API with proper authentication.
