import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
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
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
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
