export default function sitemap() {
  return [
    {
      url: 'https://www.rustwipes.net',
      lastModified: new Date(),
      changeFrequency: 'always',
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
      url: 'https://www.rustwipes.net/scraper/stats',
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.5,
    },
  ]
}