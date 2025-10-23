import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  // In production, these would come from a CMS or database
  const blogPosts = [
    {
      slug: 'eventi-ibridi-vs-fisici-guida-pmi-2025',
      lastModified: '2025-01-15',
    },
    {
      slug: 'organizzare-congresso-aziendale-checklist',
      lastModified: '2025-01-10',
    },
    {
      slug: 'formazione-corporate-roi-eventi',
      lastModified: '2025-01-05',
    },
  ];

  const blogUrls = blogPosts.map((post) => ({
    url: `https://tuosito.it/blog/${post.slug}`,
    lastModified: new Date(post.lastModified),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: 'https://tuosito.it',
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: 'https://tuosito.it/blog',
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    ...blogUrls,
    {
      url: 'https://tuosito.it/servizi',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: 'https://tuosito.it/contatti',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ];
}