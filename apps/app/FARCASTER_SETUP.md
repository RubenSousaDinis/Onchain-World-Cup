# Farcaster Mini App Setup Guide

## Current Status

✅ Farcaster SDK integrated
✅ Manifest file created at `public/.well-known/farcaster.json`
⚠️ **Manifest needs to be signed** (required for production)

---

## Signing the Manifest (Required for Production)

The `accountAssociation` section in your manifest must be signed to prove you own the domain.

### Step 1: Deploy to Production

Your app must be deployed to your production domain first:
- **Production URL**: `https://app.onchainworldcup.xyz`
- The signature is tied to this specific domain

### Step 2: Get Your Farcaster ID (FID)

1. Go to [Farcaster client (e.g., Warpcast)](https://warpcast.com)
2. Click on your profile
3. Your FID is shown in the URL or profile details

### Step 3: Generate the Signature

Use the official Farcaster Frame Host CLI:

```bash
npx @farcaster/frame-host sign-manifest \
  --domain app.onchainworldcup.xyz \
  --fid YOUR_FID_HERE
```

**What this does**:
- Generates a cryptographic signature
- Proves you control the domain
- Creates `header`, `payload`, and `signature` values

### Step 4: Update the Manifest

Replace the placeholders in `public/.well-known/farcaster.json`:

```json
{
  "accountAssociation": {
    "header": "GENERATED_HEADER_VALUE",
    "payload": "GENERATED_PAYLOAD_VALUE",
    "signature": "GENERATED_SIGNATURE_VALUE"
  },
  "frame": {
    // ... rest stays the same
  }
}
```

### Step 5: Redeploy

After updating the manifest with signed values:
```bash
git add public/.well-known/farcaster.json
git commit -m "feat: add signed Farcaster manifest"
git push origin main
```

Then redeploy to Vercel/your hosting platform.

---

## Testing Without Signature (Development Only)

For local development and testing, you can use Farcaster Developer Mode:

1. Open your app in a Farcaster client (Warpcast, etc.)
2. Long press on the URL
3. Select "Developer Mode"
4. This bypasses signature verification for testing

**Note**: This only works for testing. Production Mini Apps **must** have a valid signature.

---

## Verifying the Setup

### Check Manifest is Accessible

Visit: `https://app.onchainworldcup.xyz/.well-known/farcaster.json`

Should return your manifest JSON with:
- Valid `accountAssociation` (once signed)
- Correct `frame` configuration with your domain

### Test in Farcaster Client

1. Share your app URL in a cast
2. Click on the preview
3. Click "Add App" or "Open"
4. App should load without errors

---

## Troubleshooting

### "Invalid signature" error
- Regenerate the signature using the CLI
- Ensure the domain matches exactly (no trailing slash, correct subdomain)
- Redeploy after updating manifest

### "Ready not called" error
- ✅ **Already fixed** with FarcasterReady component
- Ensure `sdk.actions.ready()` is called on app mount

### App not showing in Farcaster
- Check manifest is accessible at `/.well-known/farcaster.json`
- Verify all URLs in manifest are valid and accessible
- Clear Farcaster client cache (reinstall app)

### "Domain mismatch" error
- Signature must be generated for the exact domain
- If you change domains, regenerate the signature

---

## Security Notes

- **Never commit private keys** to Git
- The signature is public and safe to commit
- The FID (Farcaster ID) is public information
- Regenerate signature if you change domains

---

## Reference Links

- [Farcaster Frame Host](https://github.com/farcasterxyz/frame-host)
- [Farcaster Mini Apps Docs](https://docs.farcaster.xyz/developers/frames/mini-apps)
- [Account Association Spec](https://docs.farcaster.xyz/developers/frames/spec#account-association)

---

## Quick Reference

**Current manifest location**: `apps/app/public/.well-known/farcaster.json`
**Production domain**: `app.onchainworldcup.xyz`
**SDK package**: `@farcaster/miniapp-sdk`
**Ready component**: `apps/app/components/farcaster-ready.tsx`

---

**Last Updated**: January 2026
**Status**: Awaiting signature generation
