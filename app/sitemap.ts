import type { MetadataRoute } from 'next';
import { RESULT_CATEGORIES } from '@/lib/constants';

const LOCALES = ['zh-TW', 'en'] as const;

// Public, indexable routes. /result and /admin are intentionally excluded
// (private, per-token or gated). /types/[category] is included as SEO surface.
const STATIC_PATHS = [
  '',
  '/mri',
  '/salary-report',
  '/levelup',
  '/cost-of-living',
  '/jd',
  '/mba-roi',
  '/jobs',
  '/services',
  '/sample',
  '/privacy',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ahamoment-green-talent-os.vercel.app').replace(/\/$/, '');
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    for (const path of STATIC_PATHS) {
      entries.push({
        url: `${base}/${locale}${path}`,
        lastModified: now,
        changeFrequency: path === '' || path === '/jobs' ? 'weekly' : 'monthly',
        priority: path === '' ? 1 : path === '/mri' ? 0.9 : 0.6,
      });
    }
    for (const category of RESULT_CATEGORIES) {
      entries.push({
        url: `${base}/${locale}/types/${category}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.5,
      });
    }
  }

  return entries;
}
