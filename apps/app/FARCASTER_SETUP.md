# Farcaster Mini App Setup Guide

This guide explains how to configure and deploy the Farcaster Mini App integration for Onchain World Cup.

## Overview

The app is integrated as a Farcaster Mini App, allowing users to access it directly from Farcaster clients (Warpcast, etc.) with embedded wallet support.

## Required Setup

### 1. Sign Your Domain

Visit https://farcaster.xyz/~/developers/hosted-manifests to sign your domain and get accountAssociation values.

### 2. Set Environment Variables

```bash
FARCASTER_ACCOUNT_ASSOCIATION_HEADER="your_header"
FARCASTER_ACCOUNT_ASSOCIATION_PAYLOAD="your_payload"
FARCASTER_ACCOUNT_ASSOCIATION_SIGNATURE="your_signature"
NEXT_PUBLIC_APP_DOMAIN="https://app.onchainworldcup.xyz"
```

### 3. Update Manifest

Update `public/.well-known/farcaster.json` with your signature values.

### 4. Deploy and Test

Verify manifest: `curl https://app.onchainworldcup.xyz/.well-known/farcaster.json`

Test in preview tool: https://farcaster.xyz/~/developers/mini-apps/preview?url=YOUR_URL

## Features Implemented

- ✅ Farcaster manifest generation
- ✅ Embed metadata (fc:miniapp)
- ✅ SDK initialization
- ✅ Wallet auto-connect
- ✅ User info display
- ✅ Context-aware UI

For detailed documentation, see inline comments in code.
