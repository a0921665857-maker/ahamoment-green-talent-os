import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ahamoment-green-talent-os.vercel.app').replace(/\/$/, '');
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Private surfaces: per-token reports and the admin area.
      disallow: ['/api/', '/zh-TW/result/', '/en/result/', '/zh-TW/admin', '/en/admin'],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
