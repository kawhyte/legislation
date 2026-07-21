import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://legislation-tracker-inky.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/profile-setup', '/api/', '/reset-password'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
