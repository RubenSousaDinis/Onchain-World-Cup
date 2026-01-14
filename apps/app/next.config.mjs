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
    unoptimized: true,
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
