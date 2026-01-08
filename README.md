# Crypto World Cup 2026

A full-stack Next.js application for ETH-based voting/betting on World Cup 2026 matches, powered by the Base network.

## Features

- **Retro Championship Manager 01/02 UI**: Classic soccer management game aesthetic with dark blue sidebar, purple tabs, and yellow highlights
- **Web3 Wallet Integration**: RainbowKit + wagmi for seamless Base network connectivity
- **Smart Contract Voting**: Time-based 2-phase pricing system
  - Phase 1 (0-2 hours): Linear pricing with 5% fee
  - Phase 2 (2-24 hours): Exponential pricing with 15% fee
- **Prize Pool Distribution**: 90% to winners, 10% platform fee
- **Real-time Updates**: Live match data and voting totals
- **User Dashboard**: Track personal bets, winnings, and leaderboard rankings

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 with custom retro theme
- **Web3**: wagmi v2, viem v2, RainbowKit v2
- **Smart Contracts**: Solidity ^0.8.20
- **Network**: Base (Mainnet & Sepolia Testnet)

## Getting Started

1. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Set up environment variables**:
   Create a `.env.local` file:
   \`\`\`
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
   \`\`\`

3. **Run development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Open** [http://localhost:3000](http://localhost:3000)

## Smart Contracts

The smart contracts are located in the `/contracts` directory:

- `WorldCupMatch.sol`: Individual match voting contract
- `WorldCupFactory.sol`: Factory for deploying match contracts

See `/contracts/README.md` for deployment instructions.

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── page.tsx           # Home page (live matches)
│   ├── my-bets/           # User bets dashboard
│   ├── leaderboard/       # Global rankings
│   └── schedule/          # Match schedule
├── components/            # React components
│   ├── match-card.tsx     # Match voting card
│   ├── vote-modal.tsx     # Voting interface
│   ├── retro-sidebar.tsx  # CM 01/02 style sidebar
│   └── providers/         # Web3 provider setup
├── contracts/             # Solidity smart contracts
├── lib/                   # Utilities and hooks
│   ├── wagmi-config.ts    # Web3 configuration
│   ├── contracts/         # Contract ABIs
│   └── hooks/            # Custom React hooks
└── public/               # Static assets
\`\`\`

## Key Features

### Voting System
- Users vote with ETH on match outcomes
- Dynamic pricing based on time before match
- Winner determined by total ETH voted for each team

### Prize Distribution
- 90% of total pool distributed to winning voters (proportional to their contribution)
- 10% platform fee
- Tie scenario: Full refunds to all voters

### Farcaster Integration
- Compatible with Farcaster clients
- Social features for sharing bets and results

## Deployment

Deploy to Vercel with one click or via CLI:

\`\`\`bash
vercel deploy
\`\`\`

Make sure to set up environment variables in your Vercel project settings.

## License

MIT
