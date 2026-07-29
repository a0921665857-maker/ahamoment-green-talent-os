import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ahamoment-green-talent-os.vercel.app').replace(/\/$/, '');
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Private surfaces: per-token reports, the twin rail, post-checkout
      // confirmations, and the admin area. None of these have any value in a
      // search result and two of them are reachable only with a bearer token.
      disallow: [
        '/api/',
        '/zh-TW/result/',
        '/en/result/',
        '/zh-TW/twin/',
        '/en/twin/',
        '/zh-TW/payment/',
        '/en/payment/',
        '/zh-TW/admin',
        '/en/admin',
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
