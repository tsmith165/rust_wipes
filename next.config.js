/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.rustwipes.com/:path*',
      },
    ]
  }
}

module.exports = nextConfig
