/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'standalone',
  // Empty turbopack config to acknowledge we're using Turbopack (Next.js 16 default)
  turbopack: {},
}

export default nextConfig
