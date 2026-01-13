# Phase 9: Testing & Deployment

## Overview
Comprehensive testing of all components, end-to-end flows, and deployment to production. Ensure the app works flawlessly in both desktop and Farcaster contexts before launch.

## Sub-tasks

### 9.1 Unit Testing

#### Smart Contract Tests
File: `test/contracts/`

- [ ] Test all MatchContract functions
- [ ] Test MatchFactory deployment and creation
- [ ] Test MatchRegistry registration
- [ ] Test pricing formulas (Phase 1 and Phase 2)
- [ ] Test vote counting
- [ ] Test payout calculations
- [ ] Test winner determination
- [ ] Test access control
- [ ] Test edge cases (deadlines, phase transitions)
- [ ] Achieve >90% code coverage

#### Frontend Unit Tests
File: `__tests__/`

- [ ] Test utility functions
  - Pricing calculations
  - Country code conversions
  - Date/time formatting
- [ ] Test hooks
  - useAppInitialization
  - useRealTimePrice
  - useMatchStatus
- [ ] Test components (with React Testing Library)
  - MatchCard
  - VotingInterface
  - PayoutClaim
  - PriceDisplay
  - PhaseIndicator

#### Backend/API Tests
File: `__tests__/api/`

- [ ] Test API endpoints
  - Match creation
  - Vote indexing
  - Match queries
  - Vote queries
  - Claimable amounts
- [ ] Test event indexer
- [ ] Test transaction processor
- [ ] Test database queries

### 9.2 Integration Testing

#### Voting Flow Integration Test
- [ ] Connect wallet
- [ ] View match and current price
- [ ] Submit vote transaction
- [ ] Confirm transaction
- [ ] Index vote to database
- [ ] Verify UI updates
- [ ] Check database record

#### Payout Flow Integration Test
- [ ] Vote on match
- [ ] Wait for deadline (or simulate)
- [ ] Determine winner
- [ ] Check claimable amount
- [ ] Claim payout transaction
- [ ] Confirm transaction
- [ ] Verify ETH received

#### Match Creation Flow Integration Test
- [ ] Call factory to create match
- [ ] Emit MatchCreated event
- [ ] Index event to database
- [ ] Verify match appears in UI
- [ ] Check match data accuracy

### 9.3 End-to-End Testing

#### E2E Test Suite
File: `e2e/`

Use Playwright or Cypress for E2E tests.

##### Complete Betting Journey
- [ ] Load home page
- [ ] Connect wallet (testnet)
- [ ] Browse matches
- [ ] Click on a match
- [ ] View match details
- [ ] Submit vote in Phase 1
- [ ] Wait for confirmation
- [ ] Submit another vote in Phase 2
- [ ] View dashboard
- [ ] Check vote history
- [ ] Wait for match to complete
- [ ] Claim payout
- [ ] Verify payout received

##### Farcaster Context E2E
- [ ] Load app in Farcaster preview
- [ ] Verify SDK initialization
- [ ] Verify no infinite splash
- [ ] Connect Farcaster wallet
- [ ] Submit vote
- [ ] Share to Farcaster
- [ ] Claim payout

##### Edge Case Scenarios
- [ ] Vote exactly at phase transition
- [ ] Vote exactly at deadline
- [ ] Vote with insufficient funds
- [ ] Claim with no votes
- [ ] Claim after already claimed
- [ ] Vote on wrong network

### 9.4 Wallet Integration Testing

#### Desktop Wallet Testing
- [ ] Test MetaMask connection
- [ ] Test WalletConnect connection
- [ ] Test wallet switching
- [ ] Test network switching to Base
- [ ] Test disconnect
- [ ] Test transaction signing
- [ ] Test transaction rejection

#### Farcaster Wallet Testing
- [ ] Test Farcaster embedded wallet connection
- [ ] Test SDK wallet integration
- [ ] Test Base network support
- [ ] Test transaction signing in Farcaster
- [ ] Test wallet in Warpcast client
- [ ] Test wallet in other Farcaster clients

### 9.5 Farcaster Mini App Testing

#### Manifest Testing
- [ ] Access `/.well-known/farcaster.json`
- [ ] Verify HTTP 200 response
- [ ] Validate JSON structure
- [ ] Verify `accountAssociation` signature
- [ ] Confirm domain matches
- [ ] Test from different locations/IPs

#### Meta Tags Testing
- [ ] Check `fc:miniapp` meta tags on pages
- [ ] Validate meta tag JSON structure
- [ ] Test OG image URLs (200 response)
- [ ] Verify OG images are 3:2 aspect ratio
- [ ] Verify icon images are 200x200px
- [ ] Confirm button title ≤ 32 characters

#### SDK Initialization Testing
- [ ] Test SDK initialization
- [ ] Verify `sdk.actions.ready()` is called
- [ ] Confirm no infinite splash screen
- [ ] Test initialization errors
- [ ] Test in desktop browser (graceful fallback)
- [ ] Test in Farcaster context

#### Preview Tool Testing
- [ ] Test in Farcaster preview tool
  - URL: `https://farcaster.xyz/~/developers/mini-apps/preview?url={YOUR_URL}`
- [ ] Verify embed preview displays
- [ ] Test app launch from preview
- [ ] Check console for errors
- [ ] Verify all assets load

#### Client Testing
- [ ] Share link in Warpcast
- [ ] Verify embed appears in feed
- [ ] Click to launch app
- [ ] Test full flow in Warpcast
- [ ] Test in other Farcaster clients (if available)
- [ ] Verify wallet connection works
- [ ] Test voting in Farcaster context

### 9.6 Phase Transition Testing

#### Phase 1 to Phase 2 Transition
- [ ] Create test match
- [ ] Vote in Phase 1
- [ ] Verify linear pricing
- [ ] Wait for 2 hours (or fast-forward in test)
- [ ] Verify transition to Phase 2
- [ ] Verify exponential pricing
- [ ] Verify phase 1 end price is stored
- [ ] Vote in Phase 2
- [ ] Verify price calculation

#### Deadline Testing
- [ ] Vote before deadline
- [ ] Attempt vote at exact deadline
- [ ] Attempt vote after deadline (should fail)
- [ ] Verify winner determination after deadline
- [ ] Verify payouts available after deadline

### 9.7 Pricing Calculation Testing

#### Phase 1 Linear Pricing
- [ ] Test initial price (0.001 ETH)
- [ ] Test after 1 vote (0.0011 ETH)
- [ ] Test after 10 votes (0.002 ETH)
- [ ] Verify formula: `0.001 + (count × 0.0001)`
- [ ] Compare contract price vs frontend calculation

#### Phase 2 Exponential Pricing
- [ ] Test at start of Phase 2
- [ ] Test after 1 vote in Phase 2
- [ ] Test after 10 votes in Phase 2
- [ ] Verify formula: `phase1EndPrice × (1.1 ^ phase2Count)`
- [ ] Compare contract price vs frontend calculation
- [ ] Test with large vote counts

### 9.8 Error Handling Testing

#### Frontend Error Handling
- [ ] Test network disconnection
- [ ] Test wallet disconnection
- [ ] Test transaction rejection
- [ ] Test insufficient balance
- [ ] Test API errors
- [ ] Test loading states
- [ ] Verify user-friendly error messages

#### Backend Error Handling
- [ ] Test database connection failure
- [ ] Test RPC node failure
- [ ] Test invalid transaction hash
- [ ] Test event parsing errors
- [ ] Test concurrent request handling

### 9.9 Performance Testing

#### Load Testing
- [ ] Test with many simultaneous votes
- [ ] Test with large number of matches
- [ ] Test event indexer with high volume
- [ ] Test API response times
- [ ] Test database query performance

#### Frontend Performance
- [ ] Measure page load times
- [ ] Test Core Web Vitals
  - Largest Contentful Paint (LCP)
  - First Input Delay (FID)
  - Cumulative Layout Shift (CLS)
- [ ] Test with slow network (3G simulation)
- [ ] Test bundle size
- [ ] Optimize as needed

#### Real-Time Updates Performance
- [ ] Test with frequent price updates
- [ ] Test multiple simultaneous subscriptions
- [ ] Test memory leaks
- [ ] Test with long-running sessions

### 9.10 Security Testing

#### Smart Contract Security
- [ ] Audit for reentrancy vulnerabilities
- [ ] Test integer overflow/underflow
- [ ] Test access control bypasses
- [ ] Test front-running scenarios
- [ ] Consider professional audit (recommended)

#### Frontend Security
- [ ] Test for XSS vulnerabilities
- [ ] Test wallet connection security
- [ ] Validate user inputs
- [ ] Test API authentication (if applicable)
- [ ] Review environment variable exposure

#### Backend Security
- [ ] Test API rate limiting
- [ ] Test SQL injection (should be prevented by Prisma)
- [ ] Test unauthorized access
- [ ] Review secret management

### 9.11 Deployment Preparation

#### Environment Setup
- [ ] Create production environment variables
- [ ] Set up Base mainnet RPC
- [ ] Configure production database (Supabase)
- [ ] Set up domain and SSL
- [ ] Configure CORS properly

#### Contract Deployment
- [ ] Deploy contracts to Base mainnet
- [ ] Verify contracts on Base block explorer
- [ ] Update contract addresses in environment
- [ ] Fund platform wallet for operations
- [ ] Test contract interactions on mainnet

#### Database Setup
- [ ] Run migrations on production database
- [ ] Seed countries reference data
- [ ] Set up database backups
- [ ] Configure database security

### 9.12 Deploy Frontend

#### Vercel Deployment (Recommended)
- [ ] Connect GitHub repo to Vercel
- [ ] Configure build settings
- [ ] Add environment variables in Vercel
- [ ] Set up custom domain
- [ ] Configure redirects for manifest (if needed)
- [ ] Deploy to production
- [ ] Test deployed site

#### Alternative Hosting
If not using Vercel:
- [ ] Configure hosting platform
- [ ] Set up CI/CD pipeline
- [ ] Deploy application
- [ ] Configure CDN
- [ ] Set up monitoring

### 9.13 Deploy Backend Services

#### Event Indexer Deployment
- [ ] Deploy indexer as background service
- [ ] Or: Set up as cron job
- [ ] Or: Use The Graph for indexing
- [ ] Verify indexer is running
- [ ] Monitor indexer logs

#### API Deployment
- [ ] Deploy API routes (included with Next.js)
- [ ] Test API endpoints on production
- [ ] Set up API monitoring
- [ ] Configure rate limiting

### 9.14 Post-Deployment Testing

#### Production Verification
- [ ] Test all flows on production
- [ ] Verify manifest accessibility
- [ ] Test meta tags on production URLs
- [ ] Test Farcaster preview with production URL
- [ ] Test voting with real ETH (small amounts)
- [ ] Test wallet connections
- [ ] Test event indexing
- [ ] Verify database is updating

#### Farcaster Production Testing
- [ ] Share production link in Farcaster
- [ ] Test embed in Farcaster feed
- [ ] Launch app from Farcaster
- [ ] Test voting in Farcaster client
- [ ] Test wallet in Farcaster
- [ ] Verify SDK initialization

### 9.15 Monitoring and Logging

#### Application Monitoring
- [ ] Set up error tracking (Sentry, Bugsnag)
- [ ] Set up analytics (Vercel Analytics, Google Analytics)
- [ ] Monitor API performance
- [ ] Track user flows
- [ ] Monitor transaction success rates

#### Blockchain Monitoring
- [ ] Monitor contract events
- [ ] Track gas usage
- [ ] Monitor indexer status
- [ ] Alert on indexing delays
- [ ] Track platform fee accumulation

#### Database Monitoring
- [ ] Monitor database performance
- [ ] Track query times
- [ ] Monitor storage usage
- [ ] Set up alerts for errors

### 9.16 Documentation

#### User Documentation
- [ ] Create user guide
  - How to connect wallet
  - How to vote
  - Understanding phases
  - Claiming payouts
- [ ] Create FAQ
- [ ] Create troubleshooting guide

#### Developer Documentation
- [ ] Document API endpoints
- [ ] Document contract ABIs
- [ ] Document deployment process
- [ ] Document environment setup
- [ ] Document database schema

#### Code Documentation
- [ ] Add JSDoc comments to functions
- [ ] Document complex logic
- [ ] Create README for each major component
- [ ] Update main README

### 9.17 Launch Preparation

#### Pre-Launch Checklist
- [ ] All tests passing
- [ ] Smart contracts audited (if budget allows)
- [ ] Production deployment successful
- [ ] Farcaster integration verified
- [ ] Monitoring in place
- [ ] Documentation complete
- [ ] Support channels ready
- [ ] Marketing materials prepared

#### Soft Launch
- [ ] Launch to small group first
- [ ] Monitor for issues
- [ ] Gather feedback
- [ ] Fix critical bugs
- [ ] Optimize based on usage

#### Full Launch
- [ ] Announce on Farcaster
- [ ] Announce on other social media
- [ ] Create demo video
- [ ] Write launch blog post
- [ ] Monitor closely for first 24 hours

### 9.18 Post-Launch

#### Ongoing Maintenance
- [ ] Monitor error rates
- [ ] Respond to user issues
- [ ] Fix bugs as discovered
- [ ] Optimize performance
- [ ] Update dependencies

#### Feature Iteration
- [ ] Gather user feedback
- [ ] Plan improvements
- [ ] Implement new features
- [ ] A/B test changes

## Acceptance Criteria
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] Wallet integration works flawlessly
- [ ] Farcaster Mini App works in all clients
- [ ] Phase transitions work correctly
- [ ] Pricing calculations are accurate
- [ ] Error handling is robust
- [ ] Performance meets targets
- [ ] Security vulnerabilities addressed
- [ ] Deployed to production successfully
- [ ] Monitoring and logging active
- [ ] Documentation complete

## Dependencies
All previous phases (1-8)

## Estimated Complexity
High - Comprehensive testing and deployment requires thoroughness

## Testing Tools
- **Smart Contracts**: Hardhat/Foundry
- **Frontend**: Jest, React Testing Library
- **E2E**: Playwright or Cypress
- **Load Testing**: k6 or Artillery
- **Monitoring**: Sentry, Vercel Analytics

## Critical Tests
- [ ] Full betting journey (vote → wait → claim)
- [ ] Phase transition at 2-hour mark
- [ ] Payout calculation based on vote count
- [ ] Farcaster SDK initialization
- [ ] Wallet connection in both contexts
- [ ] Real-time price updates

## Production Checklist
- [ ] Smart contracts deployed to Base mainnet
- [ ] Contracts verified on block explorer
- [ ] Frontend deployed (Vercel or similar)
- [ ] Domain configured with SSL
- [ ] Manifest accessible at `/.well-known/farcaster.json`
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Event indexer running
- [ ] Monitoring active
- [ ] Tested in Farcaster clients

## Important Notes
- Test extensively on testnet before mainnet
- Use small amounts for production testing
- Have rollback plan ready
- Monitor closely after launch
- Be ready to respond to issues quickly
- Consider professional security audit for smart contracts
- Farcaster integration must be tested in real clients, not just preview tool
- Real-time updates are critical for user experience
