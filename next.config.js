/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    swcMinify: true,
    images: {
        domains: ['content.rustmaps.com'],
    },
};

module.exports = nextConfig;
