/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    swcMinify: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'content.rustmaps.com',
            },
            {
                protocol: 'https',
                hostname: 'files.rustmaps.com',
            },
        ],
    },
};

module.exports = nextConfig;
