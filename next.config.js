/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
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
            {
                protocol: 'https',
                hostname: 'utfs.io',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'avatars.steamstatic.com',
                pathname: '**',
            },
        ],
        minimumCacheTTL: 60 * 60 * 24 * 7, //In seconds
    },
    // headers() {
    //     return [
    //         {
    //             source: '/:all*(js|css|jpg|png|svg)',
    //             headers: [
    //                 {
    //                     key: 'Cache-Control',
    //                     value: 'public, max-age=3600, stale-while-revalidate=86400',
    //                 },
    //             ],
    //         },
    //     ];
    // },
};

module.exports = nextConfig;
