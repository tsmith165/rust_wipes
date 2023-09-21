export default function sitemap() {
  return [
    {
      url: 'https://rustwipes.com',
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
    {
      url: 'https://rustwipes.com/upcoming',
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
    {
      url: 'https://acme.com/scraper',
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.5,
    },
  ]
}