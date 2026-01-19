# Deployment Scripts

Scripts for deploying and managing Onchain World Cup smart contracts.

## Qualification Contract Scripts

### Deploy Qualification Contract

Deploy the `WorldCupQualification` contract to Base network.

```bash
# Deploy to Base Sepolia testnet
npm run deploy:qualification:sepolia

# Deploy to Base Mainnet
npm run deploy:qualification:mainnet

# Deploy to local Hardhat network
npx hardhat run scripts/deploy-qualification.js --network hardhat
```

#### Environment Variables (Optional)

You can customize deployment parameters via environment variables:

```bash
QUALIFICATION_END_TIME=1735689600 \
FEE_RECIPIENT=0x... \
INITIAL_PLATFORM_FEE_BPS=1000 \
INITIAL_COUNTRIES="US,BR,AR,FR,DE,IT,ES,NL,GB,PT" \
npx hardhat run scripts/deploy-qualification.js --network baseSepolia
```

**Parameters:**
- `QUALIFICATION_END_TIME`: Unix timestamp when qualification ends (default: 7 days from now)
- `FEE_RECIPIENT`: Address that receives platform fees (default: deployer address)
- `INITIAL_PLATFORM_FEE_BPS`: Initial platform fee in basis points (default: 1000 = 10%)
- `INITIAL_COUNTRIES`: Comma-separated list of 2-letter country codes (default: top 10 countries)

### Manage Qualification Contract

Manage an already-deployed qualification contract.

```bash
# Set contract address
export QUALIFICATION_CONTRACT_ADDRESS=0x...

# Check contract status
npx hardhat run scripts/manage-qualification.js --network baseSepolia --action status

# Add a single country
QUALIFICATION_CONTRACT_ADDRESS=0x... ACTION=addCountry COUNTRY="JP" \
npx hardhat run scripts/manage-qualification.js --network baseSepolia

# Add multiple countries
QUALIFICATION_CONTRACT_ADDRESS=0x... ACTION=addCountries COUNTRIES="JP,CN,KR,IN" \
npx hardhat run scripts/manage-qualification.js --network baseSepolia

# Update platform fee (for discounts/promotions)
QUALIFICATION_CONTRACT_ADDRESS=0x... ACTION=setFee FEE=500 \
npx hardhat run scripts/manage-qualification.js --network baseSepolia

# Finalize qualification (after end time)
QUALIFICATION_CONTRACT_ADDRESS=0x... ACTION=finalize \
COUNTRIES="US,BR,AR,FR,DE,IT,ES,NL,GB,PT,..." \
npx hardhat run scripts/manage-qualification.js --network baseSepolia
```

**Actions:**
- `status`: Display contract status and details (default)
- `addCountry`: Add a single country to the whitelist
- `addCountries`: Add multiple countries at once
- `setFee`: Update platform fee (0-2000 basis points, max 20%)
- `finalize`: Finalize qualification with top 48 countries

**Requirements:**
- `QUALIFICATION_CONTRACT_ADDRESS`: Contract address (required for all actions)
- `ACTION`: Action to perform (default: `status`)
- `COUNTRY`: Single 2-letter country code (for `addCountry`)
- `COUNTRIES`: Comma-separated country codes (for `addCountries` and `finalize`)
- `FEE`: Platform fee in basis points (for `setFee`)

## TypeScript Types Generation

TypeChain automatically generates TypeScript types from contract ABIs during compilation.

```bash
# Compile contracts and generate types
npm run generate:types

# Or separately:
npm run compile
npm run typechain
```

**Generated Types Location:**
- Types: `lib/contracts/types/contracts/`
- Factories: `lib/contracts/types/factories/contracts/`

**Usage in Frontend:**
```typescript
import { WorldCupQualification__factory } from "@/lib/contracts/types/factories/contracts/WorldCupQualification__factory";
import type { WorldCupQualification } from "@/lib/contracts/types/contracts/WorldCupQualification";

const contract = WorldCupQualification__factory.connect(address, provider);
```

## Configuration

### Hardhat Network Configuration

Networks are configured in `hardhat.config.js`:

- **Hardhat**: Local testing (chainId: 31337)
- **Base Sepolia**: Testnet (chainId: 84532)
- **Base Mainnet**: Production (chainId: 8453)

### Environment Variables

Required for deployment:

```env
# Private key for deployment (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# RPC URLs (optional, has defaults)
NEXT_PUBLIC_BASE_RPC_URL=https://sepolia.base.org
BASE_MAINNET_RPC_URL=https://mainnet.base.org

# Block explorer API key for verification
BASESCAN_API_KEY=your_basescan_api_key
```

## Verification

Contracts are automatically verified on Basescan after deployment (Base Sepolia and Mainnet only).

Manual verification:
```bash
npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS...>
```

## Examples

### Example 1: Deploy Qualification Contract with Custom Parameters

```bash
QUALIFICATION_END_TIME=1735689600 \
FEE_RECIPIENT=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb \
INITIAL_PLATFORM_FEE_BPS=500 \
INITIAL_COUNTRIES="US,BR,AR,FR,DE,IT,ES,NL,GB,PT,JP,CN" \
npx hardhat run scripts/deploy-qualification.js --network baseSepolia
```

### Example 2: Add Countries After Deployment

```bash
QUALIFICATION_CONTRACT_ADDRESS=0x... \
ACTION=addCountries \
COUNTRIES="JP,CN,KR,IN,AU,CA,MX,ZA,EG,NG" \
npx hardhat run scripts/manage-qualification.js --network baseSepolia
```

### Example 3: Offer Discount During Qualification

```bash
QUALIFICATION_CONTRACT_ADDRESS=0x... \
ACTION=setFee \
FEE=0 \
npx hardhat run scripts/manage-qualification.js --network baseSepolia
```

This sets platform fee to 0% (100% discount) for a promotion.

## Troubleshooting

### "Insufficient funds"
Make sure your deployer account has enough ETH for gas fees.

### "Contract verification failed"
The script will show manual verification command. Make sure your BASESCAN_API_KEY is set.

### "Qualification ended"
Time-based restrictions prevent certain actions after qualification period ends. Check `qualificationEndTime` in contract.

### "Country has no votes"
When finalizing qualification, all countries must have at least 1 vote (trust guarantee).
