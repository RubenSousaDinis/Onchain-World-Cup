# API Security Guide

This document explains the security measures implemented to protect the API from abuse and control costs.

## 🔒 Security Features

### 1. **Rate Limiting**
All API endpoints have rate limits to prevent abuse and control costs.

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Public Read (countries, leaderboard) | 100 requests | 1 minute |
| Expensive Read (indexer status) | 20 requests | 1 minute |
| Write Operations (indexer sync) | 5 requests | 1 minute |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2024-01-26T10:30:00.000Z
```

**Rate Limit Response (429):**
```json
{
  "error": "Too many requests",
  "message": "You have exceeded the rate limit. Please try again later.",
  "retryAfter": "2024-01-26T10:30:00.000Z"
}
```

### 2. **API Key Authentication**
Protected endpoints require API key authentication:
- **POST /api/indexer/sync** - Blockchain event syncing
- Any future admin/write operations

**Authentication bypassed in development (localhost)** to make testing easier.

### 3. **CORS Protection**
Currently allows all origins (`*`) for development. In production, you should restrict to specific domains.

## 🔑 API Key Setup

### Step 1: Generate API Keys

Generate secure random keys:
```bash
# Generate a single API key
openssl rand -hex 32

# Output example:
# 7f3d9a8b2c1e5f6a4d8e9b3c7a5f2d1e9b4c8a6f3d5e7b2a1c4f8e6d9a3b7c5f1e
```

### Step 2: Configure Environment Variables

Add to your `.env.local` file (never commit this!):
```bash
# Single API key
API_SECRET_KEYS=7f3d9a8b2c1e5f6a4d8e9b3c7a5f2d1e9b4c8a6f3d5e7b2a1c4f8e6d9a3b7c5f1e

# Multiple API keys (comma-separated)
API_SECRET_KEYS=7f3d9a8b2c1e5f6a4d8e9b3c7a5f2d1e,abc123def456ghi789jkl012mno345pqr
```

### Step 3: Use API Keys

**Option 1: Authorization Header (Recommended)**
```bash
curl -X POST http://localhost:3101/api/indexer/sync \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"chainId": 84532}'
```

**Option 2: X-API-Key Header**
```bash
curl -X POST http://localhost:3101/api/indexer/sync \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"chainId": 84532}'
```

## 📋 Protected Endpoints

### POST /api/indexer/sync
**Protection:** API Key Authentication + Rate Limiting (5 req/min)

**Why Protected:**
- Makes RPC calls to blockchain (costs money)
- Writes to database (costs resources)
- Can be expensive if abused

**Usage:**
```bash
curl -X POST https://your-domain.com/api/indexer/sync \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"chainId": 84532}'
```

**Development (localhost):**
```bash
# No API key needed in development
curl -X POST http://localhost:3101/api/indexer/sync \
  -H "Content-Type: application/json" \
  -d '{"chainId": 84532}'
```

## 🌍 Public Endpoints (Rate Limited)

These endpoints don't require authentication but are rate limited:

### GET /api/indexer/sync
**Rate Limit:** 20 requests/minute
```bash
curl http://localhost:3101/api/indexer/sync?chainId=84532
```

### GET /api/countries
**Rate Limit:** 100 requests/minute
```bash
curl http://localhost:3101/api/countries?limit=10
```

### GET /api/qualification/countries
**Rate Limit:** 100 requests/minute
```bash
curl http://localhost:3101/api/qualification/countries?limit=10
```

### GET /api/qualification/votes
**Rate Limit:** 100 requests/minute
```bash
curl http://localhost:3101/api/qualification/votes?limit=20
```

### GET /api/qualification/leaderboard
**Rate Limit:** 100 requests/minute
```bash
curl http://localhost:3101/api/qualification/leaderboard
```

### GET /api/qualification/summary
**Rate Limit:** 100 requests/minute
```bash
curl http://localhost:3101/api/qualification/summary
```

## 🚀 Production Deployment

### 1. Set API Keys in Vercel

```bash
# Using Vercel CLI
vercel env add API_SECRET_KEYS

# Or in Vercel Dashboard:
# Settings > Environment Variables > Add New
# Name: API_SECRET_KEYS
# Value: your-generated-api-key
```

### 2. Configure CORS (Optional but Recommended)

Edit `lib/api-utils.ts` to restrict CORS to your domain:

```typescript
export const corsHeaders = {
  "Access-Control-Allow-Origin": "https://your-domain.com", // Change from "*"
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
}
```

### 3. Set Up Cron Job with API Key

Create `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/indexer/sync?apiKey=YOUR_API_KEY",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**Better approach:** Use environment variable:
```json
{
  "crons": [
    {
      "path": "/api/indexer/sync",
      "schedule": "*/5 * * * *",
      "headers": {
        "Authorization": "Bearer $API_SECRET_KEYS"
      }
    }
  ]
}
```

### 4. Monitor Rate Limits

Check rate limit headers in responses:
```bash
curl -I http://localhost:3101/api/countries

# Response headers:
# X-RateLimit-Limit: 100
# X-RateLimit-Remaining: 99
# X-RateLimit-Reset: 2024-01-26T10:30:00.000Z
```

## 🔧 Advanced Configuration

### Upgrade to Redis-Based Rate Limiting (Production)

For multiple server instances, use Redis (Upstash):

1. **Install Upstash Redis:**
```bash
npm install @upstash/redis
```

2. **Update `lib/rate-limit.ts`:**
```typescript
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Use Redis instead of in-memory Map
```

3. **Add to `.env.local`:**
```bash
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

### Custom Rate Limits Per Endpoint

Edit `lib/rate-limit.ts`:
```typescript
export const RATE_LIMITS = {
  PUBLIC_READ: { limit: 200, windowSeconds: 60 },  // Increase to 200/min
  EXPENSIVE_READ: { limit: 10, windowSeconds: 60 }, // Decrease to 10/min
  WRITE: { limit: 2, windowSeconds: 60 },          // Decrease to 2/min
}
```

### IP Allowlist (Optional)

Add to `lib/api-auth.ts`:
```typescript
const ALLOWED_IPS = process.env.ALLOWED_IPS?.split(",") || []

export function isAllowedIP(request: Request): boolean {
  const ip = getClientIdentifier(request)
  return ALLOWED_IPS.length === 0 || ALLOWED_IPS.includes(ip)
}
```

## 🧪 Testing Security

### Test Rate Limiting
```bash
# Make 101 requests quickly
for i in {1..101}; do
  curl http://localhost:3101/api/countries?limit=1
done

# Request 101 should return 429 Too Many Requests
```

### Test Authentication
```bash
# Without API key (production) - should fail
curl -X POST https://your-domain.com/api/indexer/sync \
  -H "Content-Type: application/json" \
  -d '{"chainId": 84532}'

# With invalid API key - should fail
curl -X POST https://your-domain.com/api/indexer/sync \
  -H "Authorization: Bearer invalid-key" \
  -H "Content-Type: application/json" \
  -d '{"chainId": 84532}'

# With valid API key - should succeed
curl -X POST https://your-domain.com/api/indexer/sync \
  -H "Authorization: Bearer YOUR_VALID_KEY" \
  -H "Content-Type: application/json" \
  -d '{"chainId": 84532}'
```

## 📊 Cost Control

With these security measures:

1. **Rate Limiting** prevents DOS attacks and excessive API usage
2. **Authentication** ensures only authorized users can trigger expensive operations
3. **Caching** (already implemented) reduces database queries
4. **Selective indexing** (only sync when needed) minimizes RPC costs

**Estimated Cost Impact:**
- Without protection: Unlimited requests → $$$$
- With protection: ~100-200 req/min max → $
- With cron job only: ~12 requests/hour → ¢

## 🔒 Security Best Practices

1. ✅ **Never commit API keys** to version control
2. ✅ **Rotate API keys** regularly (quarterly)
3. ✅ **Use separate keys** for different environments
4. ✅ **Monitor rate limit** headers in responses
5. ✅ **Set up alerts** for 429 responses
6. ✅ **Use HTTPS** in production (automatic with Vercel)
7. ✅ **Restrict CORS** to your domain in production
8. ✅ **Consider IP allowlist** for cron jobs

## 🆘 Troubleshooting

### "Too many requests" (429)
- Wait for the reset time (check `X-RateLimit-Reset` header)
- Reduce request frequency
- Contact admin to increase rate limit

### "Unauthorized" (401)
- Check API key is correctly set in environment variables
- Verify Authorization header format: `Bearer YOUR_KEY`
- In development, ensure you're using localhost

### Rate limiting not working
- Check if multiple server instances (use Redis)
- Verify `getClientIdentifier()` returns correct IP
- Check if behind proxy (verify x-forwarded-for header)

## 📚 Related Documentation

- [API Documentation](./QUALIFICATION_API.md) - All API endpoints
- [Environment Variables](./.env.example) - Configuration
- [Wallet Integration](./WALLET_INTEGRATION.md) - Frontend integration
