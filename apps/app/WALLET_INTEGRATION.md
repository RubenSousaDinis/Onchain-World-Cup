# Wallet Integration Guide

This guide explains how to use the unified wallet connection system that works seamlessly in both **Desktop** and **Farcaster** contexts.

## Setup

Before using the wallet integration, configure the required environment variables:

```bash
# Copy the example file
cp .env.example .env.local

# Add the contract addresses
NEXT_PUBLIC_QUALIFICATION_CONTRACT_SEPOLIA=0x5b202Aec41D1C85f294267D2A42Eac8865AAcCE9
NEXT_PUBLIC_QUALIFICATION_CONTRACT_MAINNET=  # Add when deployed to mainnet

# Add other required variables (see .env.example)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

**Important**: Never commit `.env.local` to version control!

## Architecture Overview

The wallet integration is split into clear, context-specific modules:

```
lib/wallet/
├── desktop-config.ts      # Desktop wallet (Reown AppKit, multiple wallets)
├── farcaster-config.ts    # Farcaster wallet (SDK auto-connect)

hooks/
├── useWalletConnection.ts # Unified wallet hook (works in both contexts)

lib/contracts/
├── qualification.ts       # Contract interaction utilities
```

## Key Concepts

### 1. Context Detection

The app automatically detects whether it's running in:
- **DESKTOP**: Standard web browser (Chrome, Safari, etc.)
- **FARCASTER**: Inside Farcaster Mini App

### 2. Wallet Behavior by Context

| Feature | Desktop | Farcaster |
|---------|---------|-----------|
| Wallet Connection | Manual (user clicks "Connect") | Automatic (SDK) |
| Wallet Options | 300+ wallets via Reown AppKit | Farcaster wallet only |
| Disconnect | ✅ Yes | ❌ No (managed by Farcaster) |
| User Display | Truncated address | Farcaster username/display name |

## Usage Examples

### 1. Using the Unified Wallet Hook

```tsx
import { useWalletConnection } from "@/hooks/useWalletConnection"

function MyComponent() {
  const {
    // Wallet state
    address,
    isConnected,
    chain,

    // Context information
    walletContext,  // "desktop" | "farcaster" | null
    isDesktop,      // boolean
    isFarcaster,    // boolean

    // Farcaster-specific data
    farcasterUser,  // { fid, username, displayName, pfpUrl } | null

    // Actions
    canDisconnect,  // boolean (false in Farcaster)
    disconnect,     // function (only works in desktop)
  } = useWalletConnection()

  return (
    <div>
      <p>Context: {walletContext}</p>
      <p>Address: {address}</p>
      <p>Connected: {isConnected ? "Yes" : "No"}</p>

      {/* Show Farcaster user info if available */}
      {isFarcaster && farcasterUser && (
        <div>
          <p>FID: {farcasterUser.fid}</p>
          <p>Username: @{farcasterUser.username}</p>
        </div>
      )}

      {/* Show disconnect button only in desktop context */}
      {canDisconnect && (
        <button onClick={disconnect}>Disconnect</button>
      )}
    </div>
  )
}
```

### 2. Connecting a Wallet (Desktop Only)

```tsx
import { useAppKit } from "@reown/appkit/react"
import { useWalletConnection } from "@/hooks/useWalletConnection"

function ConnectButton() {
  const { open } = useAppKit()
  const { isConnected, isDesktop } = useWalletConnection()

  // Don't show connect button in Farcaster (auto-connects)
  if (!isDesktop || isConnected) return null

  return (
    <button onClick={() => open()}>
      Connect Wallet
    </button>
  )
}
```

### 3. Farcaster Auto-Connect

```tsx
import { useFarcasterWalletConnection } from "@/lib/wallet/farcaster-config"

function Layout({ children }) {
  // This hook automatically connects wallet in Farcaster context
  useFarcasterWalletConnection()

  return <div>{children}</div>
}
```

### 4. Displaying User Information

```tsx
import { getWalletDisplayName } from "@/lib/wallet/farcaster-config"
import { useWalletConnection } from "@/hooks/useWalletConnection"

function UserDisplay() {
  const { address, isFarcaster, farcasterUser } = useWalletConnection()

  const displayName = getWalletDisplayName(
    address,
    isFarcaster,
    farcasterUser?.username,
    farcasterUser?.displayName
  )

  return <span>{displayName}</span>
}
```

## Contract Interaction

### 1. Reading Contract Data

```tsx
import {
  useVotePrice,
  useCountryVotes,
  useUserVotes,
  formatVotePrice,
} from "@/lib/contracts/qualification"
import { useAccount } from "wagmi"

function CountryInfo({ countryCode }: { countryCode: string }) {
  const { chain } = useAccount()
  const chainId = chain?.id || 84532 // Default to Base Sepolia

  // Get current vote price
  const { data: price } = useVotePrice(chainId, countryCode)

  // Get total votes for country
  const { data: votes } = useCountryVotes(chainId, countryCode)

  return (
    <div>
      <p>Country: {countryCode}</p>
      <p>Vote Price: {formatVotePrice(price)} ETH</p>
      <p>Total Votes: {votes?.toString() || "0"}</p>
    </div>
  )
}
```

### 2. Voting for a Country

```tsx
import {
  useVote,
  useCalculateVoteCost,
  useWaitForVote,
  countryCodeToBytes8,
} from "@/lib/contracts/qualification"
import { useAccount } from "wagmi"
import { useState } from "react"

function VoteButton({ countryCode }: { countryCode: string }) {
  const { chain } = useAccount()
  const chainId = chain?.id || 84532
  const [voteCount, setVoteCount] = useState(1)

  // Calculate cost for votes
  const { data: cost } = useCalculateVoteCost(chainId, countryCode, voteCount)

  // Vote function
  const { vote, hash, isPending } = useVote()

  // Wait for transaction
  const { isLoading: isConfirming, isSuccess } = useWaitForVote(hash)

  const handleVote = async () => {
    if (!cost) return

    try {
      await vote(chainId, countryCode, voteCount, cost)
    } catch (error) {
      console.error("Vote failed:", error)
    }
  }

  return (
    <div>
      <input
        type="number"
        value={voteCount}
        onChange={(e) => setVoteCount(Number(e.target.value))}
        min={1}
        max={100}
      />
      <button
        onClick={handleVote}
        disabled={isPending || isConfirming}
      >
        {isPending ? "Confirming..." : isConfirming ? "Voting..." : "Vote"}
      </button>
      {isSuccess && <p>✅ Vote successful!</p>}
    </div>
  )
}
```

### 3. Claiming Winnings

```tsx
import { useClaim, useClaimable, formatVotePrice } from "@/lib/contracts/qualification"
import { useAccount } from "wagmi"

function ClaimButton() {
  const { address, chain } = useAccount()
  const chainId = chain?.id || 84532

  // Check claimable amount
  const { data: claimableAmount } = useClaimable(chainId, address)

  // Claim function
  const { claim, isPending } = useClaim()

  const handleClaim = async () => {
    try {
      await claim(chainId)
    } catch (error) {
      console.error("Claim failed:", error)
    }
  }

  if (!claimableAmount || claimableAmount === 0n) {
    return <p>No winnings to claim</p>
  }

  return (
    <div>
      <p>Claimable: {formatVotePrice(claimableAmount)} ETH</p>
      <button onClick={handleClaim} disabled={isPending}>
        {isPending ? "Claiming..." : "Claim Winnings"}
      </button>
    </div>
  )
}
```

## Helper Functions

### Country Code Conversion

```typescript
import { countryCodeToBytes8, bytes8ToCountryCode } from "@/lib/contracts/qualification"

// Convert string to bytes8 for contract calls
const usBytes = countryCodeToBytes8("US")
// => "0x5553000000000000"

const gbEngBytes = countryCodeToBytes8("GB-ENG")
// => "0x47422d454e470000"

// Convert bytes8 back to string
const code = bytes8ToCountryCode("0x5553000000000000")
// => "US"
```

### Price Formatting

```typescript
import { formatVotePrice, parseETHAmount } from "@/lib/contracts/qualification"

// Format wei to ETH string
const priceETH = formatVotePrice(1000000000000000n)
// => "0.001"

// Parse ETH string to wei
const priceWei = parseETHAmount("0.001")
// => 1000000000000000n
```

## Best Practices

### 1. Always Check Context Before Showing UI

```tsx
function WalletUI() {
  const { isDesktop, isFarcaster, isConnected } = useWalletConnection()

  return (
    <>
      {/* Desktop: Show connect button */}
      {isDesktop && !isConnected && <ConnectButton />}

      {/* Farcaster: Show auto-connecting state */}
      {isFarcaster && !isConnected && <p>Connecting...</p>}

      {/* Both: Show connected state */}
      {isConnected && <UserProfile />}
    </>
  )
}
```

### 2. Handle Chain ID Dynamically

```tsx
function useChainId() {
  const { chain } = useAccount()
  const isDev = process.env.NODE_ENV === "development"

  // Default to Base Sepolia in dev, Base Mainnet in production
  return chain?.id || (isDev ? 84532 : 8453)
}
```

### 3. Error Handling for Contract Calls

```tsx
const handleVote = async () => {
  try {
    await vote(chainId, countryCode, voteCount, cost)
  } catch (error) {
    if (error.message.includes("user rejected")) {
      toast.error("Transaction cancelled")
    } else if (error.message.includes("insufficient funds")) {
      toast.error("Insufficient ETH balance")
    } else {
      toast.error("Vote failed. Please try again.")
    }
    console.error(error)
  }
}
```

## Testing

### Testing Desktop Context

1. Open app in a regular browser
2. Connect wallet using Reown AppKit
3. Test voting functionality
4. Test disconnect

### Testing Farcaster Context

1. Open app in Farcaster Mobile app
2. Verify automatic wallet connection
3. Test voting functionality
4. Verify Farcaster user info is displayed

## Troubleshooting

### Wallet Not Connecting in Farcaster

- Check console for Farcaster SDK errors
- Ensure `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set
- Verify app is properly registered as Farcaster Mini App

### Contract Calls Failing

- Verify contract address for current chain
- Check user has sufficient ETH balance
- Ensure correct chain is selected (Base or Base Sepolia)
- Check contract is not paused

### Wrong Chain Selected

```tsx
import { useSwitchChain } from "wagmi"

function ChainSwitcher() {
  const { chain } = useAccount()
  const { switchChain } = useSwitchChain()
  const targetChainId = process.env.NODE_ENV === "production" ? 8453 : 84532

  if (chain?.id !== targetChainId) {
    return (
      <button onClick={() => switchChain({ chainId: targetChainId })}>
        Switch to {targetChainId === 8453 ? "Base" : "Base Sepolia"}
      </button>
    )
  }

  return null
}
```

## Contract Addresses

Contract addresses are configured via environment variables:

```bash
# Base Sepolia (testnet)
NEXT_PUBLIC_QUALIFICATION_CONTRACT_SEPOLIA=0x5b202Aec41D1C85f294267D2A42Eac8865AAcCE9

# Base Mainnet (production)
NEXT_PUBLIC_QUALIFICATION_CONTRACT_MAINNET=
```

**Important**: Always set these in your `.env.local` file. See `.env.example` for the template.

## Related Issues

- #53: Configure Wallet Connection - Desktop Context ✅
- #54: Configure Wallet Connection - Farcaster Context ✅
- #55: Create Unified Wallet Interface ✅
- #56: Create Contract Interaction Utilities ✅
