# Phase 6: Farcaster Mini App Integration

## Overview
Integrate the app as a Farcaster Mini App to work seamlessly within Farcaster clients (Warpcast, etc.). This includes creating the manifest, adding embed metadata, initializing the SDK, and supporting Farcaster-specific features.

## Sub-tasks

### 6.1 Create Farcaster Manifest
File: `public/.well-known/farcaster.json` or redirect configuration

#### Manifest Structure
- [ ] Create manifest JSON file
- [ ] Add `accountAssociation` object:
  - Requires signature from Farcaster tool
  - Must sign the hosting domain
  - Signature proves domain ownership
- [ ] Add `frame` object:
  - `version: "1"` (NOT "next")
  - `name`: "Crypto World Cup"
  - `iconUrl`: App icon URL (200x200px)
  - `homeUrl`: App home URL
  - `splashImageUrl`: Splash screen image (200x200px)
  - `splashBackgroundColor`: Hex color

#### Manifest Hosting
- [ ] Ensure accessible at `/.well-known/farcaster.json`
- [ ] Returns HTTP 200 with valid JSON
- [ ] Proper CORS headers
- [ ] For Vercel: Set up redirect if needed
- [ ] Test manifest accessibility

#### Signing Domain
- [ ] Use Farcaster signing tool to sign domain
- [ ] Generate `accountAssociation` payload
- [ ] Include signature in manifest
- [ ] Verify domain matches hosting domain exactly

### 6.2 Create Manifest Generation Utility
File: `utils/manifest.ts`

- [ ] Function to generate manifest JSON
- [ ] Validate manifest structure
- [ ] Include signature helpers
- [ ] Export for API route or static file

### 6.3 Create Manifest API Route (Alternative)
File: `app/api/farcaster/manifest/route.ts`

If serving manifest dynamically instead of static file:
- [ ] GET endpoint returns manifest JSON
- [ ] Set proper content-type header
- [ ] Include CORS headers
- [ ] Validate before serving

### 6.4 Add Embed Metadata
File: `app/layout.tsx` and shareable pages

#### Meta Tags Structure
- [ ] Add `fc:miniapp` meta tag (NOT `fc:frame`)
- [ ] Meta tag content is JSON string
- [ ] Structure:
  ```typescript
  {
    version: "1",
    imageUrl: "https://...", // 3:2 aspect ratio OG image
    button: {
      title: "Open App", // Max 32 characters
      action: {
        type: "launch_frame",
        name: "Crypto World Cup",
        url: "https://...", // Optional
        splashImageUrl: "https://...", // 200x200px
        splashBackgroundColor: "#f7f7f7"
      }
    }
  }
  ```

#### Implementation
- [ ] Add to root layout (`app/layout.tsx`)
- [ ] Add to all shareable pages
- [ ] Implement in `generateMetadata()` function
- [ ] Ensure OG image is 3:2 aspect ratio
- [ ] Ensure button title ≤ 32 characters
- [ ] Ensure splash image is 200x200px

### 6.5 Create Embed Metadata Utility
File: `utils/miniappMetadata.ts`

- [ ] Function to generate meta tags
- [ ] Accept page-specific parameters
- [ ] Return metadata object for Next.js
- [ ] Validate image dimensions
- [ ] Validate button title length

### 6.6 Initialize Farcaster SDK
File: `lib/farcaster.ts`

#### SDK Installation
- [ ] Install `@farcaster/miniapp-sdk`
- [ ] Import SDK in app

#### SDK Initialization
- [ ] Detect if running in Farcaster context
- [ ] Initialize SDK
- [ ] Call `sdk.actions.ready()` after app loads
- [ ] Handle SDK initialization errors
- [ ] Add fallback for non-Farcaster contexts

#### Context Detection
- [ ] Detect Farcaster client user agent
- [ ] Check for Farcaster SDK availability
- [ ] Set context state (isFarcaster)
- [ ] Export context for app use

### 6.7 Create Farcaster Provider Component
File: `components/FarcasterProvider.tsx`

- [ ] Context provider for Farcaster state
- [ ] Initialize SDK on mount (in Farcaster context)
- [ ] Call `sdk.actions.ready()` after initialization
- [ ] Provide context to child components
- [ ] Handle loading states
- [ ] Handle errors gracefully

### 6.8 Implement App Initialization Hook
File: `hooks/useFarcasterInit.ts`

- [ ] Hook to handle Farcaster initialization
- [ ] Detect context
- [ ] Initialize SDK if in Farcaster
- [ ] Call `ready()` when app is initialized
- [ ] Return initialization status
- [ ] Handle infinite splash screen issue

### 6.9 Dual Context Support

#### Context-Aware Rendering
File: `components/ContextAwareUI.tsx`

- [ ] Component that renders based on context
- [ ] Desktop version: Full-featured UI
- [ ] Farcaster version: Optimized for embedded view
- [ ] Responsive design for both contexts

#### Conditional Features
- [ ] Detect environment (desktop vs Farcaster)
- [ ] Show/hide features based on context
- [ ] Adjust layout for embedded contexts
- [ ] Touch-friendly controls for Farcaster mobile

### 6.10 Wallet Integration for Farcaster
File: `lib/farcasterWallet.ts`

- [ ] Use Farcaster embedded wallets
- [ ] Access via `@farcaster/miniapp-sdk`
- [ ] Connect to Base network
- [ ] Handle wallet connection
- [ ] Sign transactions
- [ ] Handle wallet errors

### 6.11 Social Features

#### Share to Farcaster Component
File: `components/FarcasterShare.tsx`

- [ ] Share match results to Farcaster
- [ ] Share voting activity
- [ ] Generate shareable content
- [ ] Include proper embed metadata
- [ ] Use SDK share actions (if available)

#### Share Match
- [ ] Create shareable link for match
- [ ] Include match details in embed
- [ ] Show preview with teams and odds
- [ ] Link back to voting interface

#### Share Vote
- [ ] Create shareable content for user's vote
- [ ] Display voted team and amount
- [ ] Show current match status
- [ ] Encourage others to vote

#### Share Win
- [ ] Share payout claim/win
- [ ] Display amount won
- [ ] Show vote count that led to win
- [ ] Celebrate early voting advantage

### 6.12 Display Farcaster User Info
File: `components/FarcasterUserInfo.tsx`

- [ ] Access Farcaster user data via SDK
- [ ] Display username if available
- [ ] Show Farcaster FID
- [ ] Display profile picture
- [ ] Link to Farcaster profile

### 6.13 Generate Shareable Links
File: `utils/shareLinks.ts`

- [ ] Create functions to generate share URLs
- [ ] Include proper query parameters
- [ ] Ensure embed metadata works on target pages
- [ ] Support different share types (match, vote, win)

### 6.14 Create OG Images
Directory: `public/og/`

#### Required Images
- [ ] App icon (200x200px)
  - For manifest `iconUrl`
  - PNG format
  - Transparent or solid background
- [ ] Splash image (200x200px)
  - For manifest and meta tags
  - App logo or branding
- [ ] OG images (3:2 aspect ratio)
  - Default app OG image
  - Dynamic match OG images (optional)
  - Show teams, odds, voting info

#### Dynamic OG Images (Optional)
File: `app/api/og/route.tsx`

- [ ] Use `@vercel/og` for dynamic images
- [ ] Generate match-specific images
- [ ] Include team flags and names
- [ ] Show current vote price
- [ ] Display voting deadline

### 6.15 Testing Farcaster Integration

#### Manifest Testing
- [ ] Verify manifest at `/.well-known/farcaster.json`
- [ ] Check HTTP 200 response
- [ ] Validate JSON structure
- [ ] Verify signature is correct
- [ ] Confirm domain matches

#### Meta Tags Testing
- [ ] Verify `fc:miniapp` meta tags present
- [ ] Check meta tag structure
- [ ] Validate image URLs return 200
- [ ] Verify image dimensions (3:2 for OG, 200x200 for icons)
- [ ] Confirm button title length ≤ 32 chars

#### SDK Testing
- [ ] Test SDK initialization
- [ ] Verify `ready()` is called
- [ ] Check no infinite splash screen
- [ ] Test in desktop browser (graceful degradation)
- [ ] Test error handling

#### Preview Tool Testing
- [ ] Use Farcaster preview tool:
  - `https://farcaster.xyz/~/developers/mini-apps/preview?url={url}`
- [ ] Test home URL
- [ ] Test shareable match URLs
- [ ] Verify embed preview appears
- [ ] Confirm app launches on click

#### Client Testing
- [ ] Test in Warpcast client
- [ ] Test in other Farcaster clients
- [ ] Share link in Farcaster feed
- [ ] Verify embed displays correctly
- [ ] Test voting flow in Farcaster context
- [ ] Test wallet connection in Farcaster

## Acceptance Criteria
- [ ] Manifest is accessible and valid
- [ ] Embed metadata on all pages
- [ ] SDK initializes correctly
- [ ] App works in both desktop and Farcaster contexts
- [ ] Farcaster wallet integration works
- [ ] Social sharing features functional
- [ ] No infinite splash screen
- [ ] Preview tool shows app correctly
- [ ] App launches in Farcaster clients

## Dependencies
- Phase 1 (Next.js app setup)
- Phase 4 (wallet integration foundation)

## Estimated Complexity
Medium-High - Requires understanding Farcaster Mini App spec

## Critical Requirements
- [ ] **Version**: Use `"1"` not `"next"`
- [ ] **Meta Tag**: Use `fc:miniapp` NOT `fc:frame`
- [ ] **SDK Ready**: MUST call `sdk.actions.ready()` after init
- [ ] **Manifest**: MUST be accessible at `/.well-known/farcaster.json`
- [ ] **Signed Domain**: accountAssociation must have valid signature
- [ ] **Images**: OG images 3:2 ratio, icons 200x200px
- [ ] **Button Title**: Max 32 characters

## Common Issues to Avoid
- [ ] Infinite splash screen (forgot to call `ready()`)
- [ ] 404 on manifest (wrong path or hosting config)
- [ ] Invalid signature (domain mismatch)
- [ ] Wrong meta tag (`fc:frame` instead of `fc:miniapp`)
- [ ] Wrong version (`"next"` instead of `"1"`)
- [ ] CORS issues on manifest
- [ ] Image dimension issues
- [ ] Button title too long

## Testing URLs
- Preview tool: `https://farcaster.xyz/~/developers/mini-apps/preview?url={YOUR_URL}`
- Manifest: `https://{YOUR_DOMAIN}/.well-known/farcaster.json`

## Notes
- This is a **Mini App**, not a **Frame**
- Frames are legacy, Mini Apps are current
- Must work seamlessly in both desktop and Farcaster contexts
- Farcaster uses embedded wallets, different from desktop MetaMask
- Social features enhance virality
- Proper embed metadata critical for discovery
