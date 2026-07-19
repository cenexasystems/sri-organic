import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/products'],
      disallow: ['/admin', '/secure', '/cart', '/login', '/profile', '/invoice'],
    },
    sitemap: 'https://sriorganic.com/sitemap.xml',
  };
}
