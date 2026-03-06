import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.imgur.com" },
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Empty turbopack config to acknowledge we're using Turbopack (Next.js 16 default)
  // The webpack config below is only used in production builds
  turbopack: {},
  async redirects() {
    return [
      { source: "/about", destination: "https://onchainworldcup.xyz/about", permanent: true },
      { source: "/privacy", destination: "https://onchainworldcup.xyz/privacy-policy", permanent: true },
      { source: "/terms", destination: "https://onchainworldcup.xyz/terms", permanent: true },
    ]
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            // unsafe-inline + unsafe-eval required by Next.js inline scripts and wagmi/viem
            // frame-ancestors * required for Farcaster Mini App embedding
            // connect-src https: wss: covers Base RPC, WalletConnect, analytics
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com; connect-src 'self' https: wss:; img-src 'self' data: https: blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com https://fonts.reown.com; frame-src https://verify.walletconnect.org https://verify.walletconnect.com https://secure.walletconnect.com https://auth.reown.com; frame-ancestors *; worker-src blob:;",
          },
        ],
      },
      {
        // Scope CORS wildcard to API routes only
        source: "/api/(.*)",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
    ]
  },
  webpack: (config, { webpack }) => {
    const emptyModulePath = path.resolve(__dirname, 'empty-module.js')

    // Replace test files and test directories with empty module
    config.plugins.push(
      // Match paths containing /test/ directory (e.g., thread-stream/test/create-and-exit.js)
      new webpack.NormalModuleReplacementPlugin(
        /.*\/test\/.*/,
        emptyModulePath
      ),
      // Match test file extensions
      new webpack.NormalModuleReplacementPlugin(
        /.*\.(test|spec)\.(js|mjs|ts|tsx)$/,
        emptyModulePath
      ),
      // Ignore 'desm' module used in test files
      new webpack.IgnorePlugin({
        resourceRegExp: /^desm$/,
      })
    )

    return config
  },
}

export default nextConfig
