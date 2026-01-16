# Testing Notification System

This guide will help you test all the notifications in the Onchain World Cup app.

## Prerequisites

### 1. Install a Web3 Wallet

You need a Web3 wallet to test wallet connection notifications. Choose one:

**Option A: MetaMask (Recommended for Desktop Testing)**
- Visit https://metamask.io/download/
- Install the browser extension
- Create a new wallet or import existing one
- Switch to **Base Sepolia** testnet for testing
  - Click network dropdown → "Show test networks" → Select "Base Sepolia"

**Option B: Coinbase Wallet**
- Visit https://www.coinbase.com/wallet/downloads
- Install browser extension or mobile app
- Create wallet
- Switch to Base Sepolia testnet

**Option C: Use Coinbase Smart Wallet (No Extension Needed)**
- This will work directly from the app
- Creates a wallet for you on first connection

### 2. Get Test ETH (for Base Sepolia)

If testing real transactions:
1. Visit Base Sepolia Faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
2. Enter your wallet address
3. Receive free test ETH

### 3. Start the Development Server

```bash
cd /Users/rubendinis/Documents/Code/v0-crypto-world-cup-app
npm run dev:app
```

Open http://localhost:3000 (or the port shown in terminal)

---

## Testing Scenarios

### Scenario 1: Wallet Connection (FIXED ✅)

**Previous Issue**: "Provider not found" error
**Fix Applied**: Smart connector selection + better error messages

#### Test 1A: With MetaMask/Coinbase Extension Installed

1. Click **"CONNECT WALLET"** button (in header or sidebar)
2. **Expected Notifications**:
   - 🔵 Info: "Connecting Wallet - Please approve the connection request..."
   - Extension popup appears
   - ✅ Success: "Wallet Connected - Connected to Base Sepolia" (or your network)

3. Click the connected wallet button to disconnect
4. **Expected Notification**:
   - 🔵 Info: "Wallet Disconnected - You can reconnect anytime to place votes"

#### Test 1B: Without Any Wallet Extension

1. Click **"CONNECT WALLET"** button
2. **Expected Notification**:
   - 🔴 Error: "No Wallet Found - Please install MetaMask, Coinbase Wallet, or another Web3 wallet to continue"

**To Fix**: Install MetaMask or Coinbase Wallet extension (see prerequisites)

#### Test 1C: User Cancels Connection

1. Click **"CONNECT WALLET"**
2. When the wallet popup appears, click **"Cancel"** or **"Reject"**
3. **Expected Notification**:
   - 🔵 Info: "Connection Cancelled - Wallet connection was cancelled"

---

### Scenario 2: Match Voting Notifications

#### Test 2A: Demo Mode (Without Wallet)

1. Navigate to `/matches` or homepage
2. Find any match and click **"Vote"** button
3. Vote modal opens
4. Select number of votes (e.g., 5)
5. Click **"Try Demo Vote"**
6. **Expected Notifications**:
   - 🔵 Info: "Demo Vote Placed - Connect your wallet to place real votes on-chain"
   - Share modal appears after 500ms

#### Test 2B: Real Vote (With Wallet Connected)

1. Connect your wallet first
2. Open any match vote modal
3. Select votes (e.g., 10 votes)
4. Click **"Buy X Votes for Y ETH"**
5. Approve transaction in wallet
6. **Expected Notification Sequence**:
   - 🔵 Info: "Transaction Submitted - Waiting for confirmation on Base network..."
   - ✅ Success: "Vote Confirmed! - Your 10 votes for [Team Name] have been recorded on-chain"
   - Success modal appears
   - Share modal opens

#### Test 2C: Rejected Transaction

1. Open vote modal (wallet connected)
2. Click vote button
3. **Reject** the transaction in your wallet
4. **Expected Notification**:
   - 🔴 Error: "Transaction Rejected - [Error details]"

#### Test 2D: Failed Transaction

1. Try to vote with insufficient ETH balance
2. **Expected Notification**:
   - 🔴 Error: "Transaction Failed - Your vote could not be confirmed. Please try again."

---

### Scenario 3: Qualification Voting

#### Test 3A: Vote Without Wallet (Auto-Connect)

1. Navigate to `/qualification`
2. Click **"Vote"** on any country
3. **Expected Notification Sequence**:
   - 🔵 Info: "Connecting Wallet - Please approve the connection request..."
   - Wallet popup appears
   - ✅ Success: "Wallet Connected - You can now place your vote"

4. Select vote count
5. Click **"Vote X ETH"**
6. **Expected Notifications**:
   - 🔵 Info: "Submitting Vote - Voting for [Country] with X votes..."
   - ✅ Success: "Vote Confirmed! - Your X votes for [Country] have been recorded"
   - Modal closes

#### Test 3B: Failed Wallet Connection

1. Click vote without wallet
2. **Reject** the connection request
3. **Expected Notification**:
   - 🔵 Info: "Connection Cancelled - Wallet connection was cancelled"
   - Modal stays open for retry

---

### Scenario 4: Share Modal (Copy to Clipboard)

#### Test 4A: Successful Copy

1. Place a vote (demo or real)
2. Share modal appears
3. Click **"Copy Link"** button
4. **Expected Notification**:
   - ✅ Success: "Copied to Clipboard! - Share text has been copied. Paste it anywhere you like!"
   - Button changes to "Copied!" with checkmark
   - Checkmark reverts after 2 seconds

5. **Verify**: Paste (Cmd+V / Ctrl+V) into a text editor - should see share text

#### Test 4B: Copy Failure (Rare)

If clipboard access is blocked by browser:
- 🔴 Error: "Copy Failed - Unable to copy to clipboard. Please try again."

---

### Scenario 5: NFT Minting (Demo Mode)

**Note**: NFT contracts aren't deployed yet, so this is simulation only.

#### Test 5A: Mint NFT

1. Trigger NFT mint modal (if available in UI)
2. Click **"Mint NFT"** button
3. **Expected Notification Sequence**:
   - 🔵 Info: "Preparing NFT - Uploading metadata to IPFS..."
   - 🔵 Info: "Minting NFT - Waiting for transaction confirmation..."
   - ✅ Success: "NFT Minted! - Your achievement NFT has been minted successfully"
   - Modal closes after 2 seconds

#### Test 5B: Download Button

1. In NFT mint modal, click **"Download"**
2. **Expected Notification**:
   - 🔵 Info: "Download Coming Soon - This feature will be available after NFT contracts are deployed"

---

## Visual Checks

### Notification Appearance

**Location**: Top-right corner of screen
**Stacking**: Multiple notifications stack vertically with 12px gap
**Animation**: Smooth slide-in from right (300ms duration)
**Auto-dismiss**: Disappears after 5 seconds (unless duration is customized)

**Color Coding**:
- ✅ **Success** (Green): `bg-green-500/10 border-green-500/30`
- 🔴 **Error** (Red): `bg-destructive/10 border-destructive/30`
- 🔵 **Info** (Blue): `bg-accent/10 border-accent/30`
- ⚠️ **Warning** (Yellow): `bg-yellow-500/10 border-yellow-500/30`

**Structure**:
```
┌─────────────────────────────────────┐
│ [Icon] Title               [X]      │
│        Message text here            │
└─────────────────────────────────────┘
```

### Responsive Design

**Desktop** (>= 1024px):
- Fixed position: `top-4 right-4`
- Max width: `384px`

**Mobile** (< 1024px):
- Responsive padding
- Full width on very small screens (with padding)
- Touch targets: minimum 44x44px for X button

---

## Accessibility Testing

### Keyboard Navigation

1. Press `Tab` repeatedly to focus on notification
2. Press `Tab` again to focus X button
3. Press `Enter` or `Space` to dismiss
4. **Expected**: Yellow focus outline (3px solid yellow)

### Screen Reader Testing

**macOS (VoiceOver)**:
1. Press `Cmd + F5` to enable VoiceOver
2. Trigger any notification
3. **Expected**:
   - Success/Info/Warning: Announced politely (waits for pause)
   - Error: Announced assertively (interrupts immediately)

**Windows (NVDA)**:
1. Install NVDA (free): https://www.nvaccess.org/
2. Start NVDA
3. Trigger notifications
4. Should announce: "[Type] alert: [Title] [Message]"

### Reduced Motion

1. Open DevTools (F12)
2. Command Palette (Cmd+Shift+P / Ctrl+Shift+P)
3. Type "Show Rendering"
4. Check **"Emulate CSS prefers-reduced-motion"**
5. **Expected**: Notifications appear instantly (no slide animation)

---

## Edge Cases & Stress Tests

### Test 1: Multiple Notifications

**How**:
1. Quickly trigger 3-4 actions:
   - Click connect wallet
   - Open vote modal
   - Copy to clipboard
   - Disconnect wallet

**Expected**:
- All notifications appear stacked
- No overlap
- Each auto-dismisses independently
- Smooth stacking animation

### Test 2: Long Messages

**How**: Trigger an error with a very long message

**Expected**:
- Text wraps properly
- Notification expands vertically
- Still dismissible
- Doesn't break layout

### Test 3: Rapid Dismiss

**How**: Create notification, immediately click X button

**Expected**:
- Dismisses instantly
- No errors in console
- Smooth fade-out animation

### Test 4: Mobile View

**How**:
1. Resize browser to 375px width (iPhone size)
2. Trigger notifications

**Expected**:
- Notifications are readable
- X button is tappable (44x44px min)
- Doesn't overflow screen
- Safe area padding on notched devices

---

## Common Issues & Solutions

### Issue 1: "Provider not found" Error ✅ FIXED

**Solution**: Install MetaMask or Coinbase Wallet browser extension
- MetaMask: https://metamask.io/download/
- Coinbase: https://www.coinbase.com/wallet/downloads

### Issue 2: Wallet Connects but No Notification

**Cause**: Notification shown on page load before component mounted

**Solution**: This is intentional to prevent spam on every page load. Disconnect and reconnect to see the notification.

### Issue 3: Duplicate Notifications

**Cause**: Component re-rendered multiple times

**Solution**: Already handled with `hasShownConnectedNotification` flag

### Issue 4: Notifications Not Auto-Dismissing

**Check**:
- Console for errors
- Verify duration is not set to `0` (manual dismiss only)

### Issue 5: Can't Copy to Clipboard

**Causes**:
- Page not served over HTTPS (required for clipboard API)
- Browser privacy settings blocking clipboard

**Solution**:
- Use `localhost` (works without HTTPS)
- Or enable clipboard in browser settings

---

## Developer Tools

### View Notification State

Add this to browser console while app is running:

```javascript
// See all active notifications
document.querySelectorAll('[role="alert"]')

// Count notifications
document.querySelectorAll('[role="alert"]').length

// Force trigger notification (if component is rendered)
// This won't work directly, but you can dispatch events
```

### Test Specific Notification Types

Create a test component (optional):

```tsx
// components/notification-tester.tsx
"use client"

import { useNotifications } from "@/components/notifications"

export function NotificationTester() {
  const { success, error, warning, info } = useNotifications()

  return (
    <div className="fixed bottom-4 left-4 z-50 space-y-2">
      <button onClick={() => success("Success!", "This is a success message")}
              className="block bg-green-500 text-white px-4 py-2 rounded">
        Test Success
      </button>
      <button onClick={() => error("Error!", "This is an error message")}
              className="block bg-red-500 text-white px-4 py-2 rounded">
        Test Error
      </button>
      <button onClick={() => warning("Warning!", "This is a warning message")}
              className="block bg-yellow-500 text-white px-4 py-2 rounded">
        Test Warning
      </button>
      <button onClick={() => info("Info!", "This is an info message")}
              className="block bg-blue-500 text-white px-4 py-2 rounded">
        Test Info
      </button>
    </div>
  )
}
```

Add to any page to test all notification types instantly.

---

## Checklist

Use this checklist to verify all notifications work:

- [ ] Wallet connection success
- [ ] Wallet connection error (no wallet installed)
- [ ] Wallet connection cancelled
- [ ] Wallet disconnection
- [ ] Demo vote placed
- [ ] Real vote transaction submitted
- [ ] Real vote confirmed
- [ ] Vote transaction rejected
- [ ] Vote transaction failed
- [ ] Qualification vote submitted
- [ ] Qualification vote confirmed
- [ ] Copy to clipboard success
- [ ] Copy to clipboard failure (if testable)
- [ ] NFT mint notifications (demo)
- [ ] NFT download info
- [ ] Keyboard navigation works
- [ ] Screen reader announces (if testable)
- [ ] Multiple notifications stack properly
- [ ] Auto-dismiss after 5 seconds
- [ ] Manual dismiss (X button) works
- [ ] Mobile responsive (resize test)
- [ ] Reduced motion respected

---

## Next Steps After Testing

Once you've verified all notifications work:

1. **Report Issues**: If any notifications don't work as expected, note:
   - Which scenario
   - What happened vs. what was expected
   - Browser and wallet used
   - Console errors (F12 → Console tab)

2. **Customize**: Adjust durations, colors, or messages in:
   - `apps/app/components/notifications/notification.tsx`
   - `apps/app/components/notifications/notification-provider.tsx`

3. **Add More**: Use the `useNotifications()` hook in any component:
   ```tsx
   const { success, error, info, warning } = useNotifications()

   // Show notification
   success("Title", "Message", 3000) // 3 second duration
   ```

---

## Resources

- **Notification Documentation**: `apps/app/NOTIFICATIONS.md`
- **Wagmi Docs**: https://wagmi.sh/
- **Base Network**: https://base.org/
- **MetaMask**: https://metamask.io/
- **Coinbase Wallet**: https://www.coinbase.com/wallet

---

**Happy Testing! 🎉**

If you encounter any issues not covered in this guide, check the browser console (F12) for errors.
