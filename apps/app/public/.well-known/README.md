# Farcaster Manifest Configuration

## Overview
This folder contains the Farcaster Mini App manifest file required for the app to work within Farcaster clients.

## Setup Instructions

### Step 1: Generate Account Association Signature

The `accountAssociation` field in `farcaster.json` must be signed to prove domain ownership. You need to generate this signature using Farcaster's official tools.

#### Option 1: Use Farcaster's Hosted Manifest Service (Recommended)
1. Visit https://farcaster.xyz/~/developers/hosted-manifests
2. Enter your domain
3. Follow the instructions to sign your domain
4. Use the hosted manifest URL or copy the signed values to `farcaster.json`

#### Option 2: Generate Signature Manually
1. Use the `@farcaster/miniapp-sdk` package
2. Follow the official documentation at https://miniapps.farcaster.xyz/docs/specification#account-association
3. Sign your domain and update the `accountAssociation` object

### Step 2: Update Domain URLs

Replace all placeholder URLs in `farcaster.json` with your actual domain:
- `https://your-domain.vercel.app` → Your actual deployed URL
- `iconUrl` → Your app icon (200x200px recommended)
- `imageUrl` → OG image for social sharing (3:2 aspect ratio)
- `splashImageUrl` → Splash screen image (200x200px)

### Step 3: Verify Manifest

After deployment, verify your manifest is accessible:
\`\`\`bash
curl https://your-domain.vercel.app/.well-known/farcaster.json
\`\`\`

Should return valid JSON with all fields properly filled.

### Step 4: Test in Farcaster

1. Use the Farcaster Preview Tool: https://farcaster.xyz/~/developers/mini-apps/preview?url={your-url}
2. Share your app URL in a Farcaster client to test the embed
3. Verify the app launches correctly when clicked

## Manifest Schema

The manifest must include:
- `accountAssociation`: Signed domain proof
- `frame.version`: Must be `"1"`
- `frame.name`: Your app name
- `frame.iconUrl`: App icon URL
- `frame.homeUrl`: Main app URL
- `frame.imageUrl`: Social preview image (optional)
- `frame.splashImageUrl`: Loading screen image (optional)
- `frame.splashBackgroundColor`: Splash screen background color (optional)

## Troubleshooting

### Manifest Not Loading (404)
- Ensure the file is in `public/.well-known/farcaster.json`
- For Vercel, the file should be automatically served
- Check your build output includes the `.well-known` folder

### Invalid Signature Error
- The `accountAssociation` signature must match your deployed domain exactly
- Re-generate the signature if you change domains
- Use the hosted manifest service for easier management

### App Not Launching in Farcaster
- Verify the manifest is accessible via curl
- Check that `sdk.actions.ready()` is called in your app
- Ensure `fc:miniapp` meta tags are present in your HTML
- Test using the Farcaster preview tool first

## Additional Resources

- [Farcaster Mini Apps Documentation](https://miniapps.farcaster.xyz)
- [Manifest Specification](https://miniapps.farcaster.xyz/docs/specification#manifest)
- [Account Association](https://miniapps.farcaster.xyz/docs/specification#account-association)
- [SDK Reference](https://miniapps.farcaster.xyz/docs/sdk/actions/ready)
