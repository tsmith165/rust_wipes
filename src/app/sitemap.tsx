interface SitemapEntry {
    url: string;
    lastModified: Date;
    changeFrequency: 'yearly' | 'weekly' | 'hourly' | 'daily' | 'monthly' | 'never' | 'always';
    priority: number;
}

export default function sitemap(): SitemapEntry[] {
    return [
        {
            url: 'https://www.rustwipes.net',
            lastModified: new Date(),
            changeFrequency: 'always',
            priority: 1,
        },
        {
            url: 'https://www.rustwipes.net/kits',
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: 'https://www.rustwipes.net/servers',
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 1,
        },
        {
            url: 'https://www.rustwipes.net/stats',
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 1,
        },
        {
            url: 'https://www.rustwipes.net/recent',
            lastModified: new Date(),
            changeFrequency: 'always',
            priority: 1,
        },
        {
            url: 'https://www.rustwipes.net/upcoming',
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 1,
        },
        {
            url: 'https://www.rustwipes.net/networks',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 1,
        },
        {
            url: 'https://www.rustwipes.net/checkout',
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 1,
        },
    ];
}
