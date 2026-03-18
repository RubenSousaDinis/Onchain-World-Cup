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
    // Remove console.log in production but keep console.warn and console.error
    // so debug instrumentation (e.g. AppKit event subscriptions) survives the build.
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["warn", "error"] } : false,
  },
  // Empty turbopack config to acknowledge we're using Turbopack (Next.js 16 default)
  // The webpack config below is only used in production builds
  turbopack: {},
  async rewrites() {
    return [
      {
        source: "/.well-known/farcaster.json",
        destination: "/api/farcaster/manifest",
      },
    ]
  },
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
          // CSP temporarily removed to diagnose social login failure.
          // Reown's own example has zero CSP/COOP headers — social login works there.
          // If social login works without CSP, we'll add it back directive by directive.
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
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
    // Required by AppKit — prevents webpack from bundling Node-only modules
    config.externals.push('pino-pretty', 'lokijs', 'encoding')

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
