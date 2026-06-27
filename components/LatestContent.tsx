import type { Locale } from '@/lib/constants';

// Self-contained widget copy (only 3 strings) — kept local rather than in the
// content schema to keep this an optional, drop-in section.
const COPY: Record<Locale, { readTitle: string; listenTitle: string; readMore: string }> = {
  en: { readTitle: 'Latest writing', listenTitle: 'Listen', readMore: 'More on the blog →' },
  'zh-TW': { readTitle: '最新文章', listenTitle: '收聽 Podcast', readMore: '到部落格看更多 →' },
};

interface Post {
  title: string;
  link: string;
}

/** Fetch the latest posts from a Ghost (RSS 2.0) feed. Dependency-free; best-effort. */
async function fetchPosts(blogUrl: string): Promise<Post[]> {
  try {
    const rss = blogUrl.replace(/\/?$/, '/') + 'rss/';
    const res = await fetch(rss, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const xml = await res.text();
    const items = xml.split('<item>').slice(1, 4);
    const posts: Post[] = [];
    for (const item of items) {
      const title = item
        .match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1]
        ?.trim();
      const link = item.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim();
      if (title && link) posts.push({ title, link });
    }
    return posts;
  } catch {
    return [];
  }
}

/** open.spotify.com/show/ID -> open.spotify.com/embed/show/ID */
function spotifyEmbed(url: string): string | null {
  const m = url.match(/open\.spotify\.com\/(show|episode|playlist)\/([A-Za-z0-9]+)/);
  return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}` : null;
}

export async function LatestContent({ locale }: { locale: Locale }) {
  const blogUrl = process.env.NEXT_PUBLIC_BLOG_URL;
  const podcastUrl = process.env.NEXT_PUBLIC_PODCAST_URL;
  const t = COPY[locale];

  const posts = blogUrl ? await fetchPosts(blogUrl) : [];
  const embed = podcastUrl ? spotifyEmbed(podcastUrl) : null;

  if (posts.length === 0 && !embed) return null;

  return (
    <section className="border-t border-line">
      <div className="mx-auto grid max-w-3xl gap-10 px-6 py-12 sm:grid-cols-2">
        {posts.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold">{t.readTitle}</h2>
            <ul className="mt-5 space-y-3">
              {posts.map((p) => (
                <li key={p.link}>
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink-soft hover:text-pine"
                  >
                    {p.title}
                  </a>
                </li>
              ))}
            </ul>
            {blogUrl && (
              <a
                href={blogUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-sm text-pine hover:underline"
              >
                {t.readMore}
              </a>
            )}
          </div>
        )}
        {embed && (
          <div>
            <h2 className="text-xl font-semibold">{t.listenTitle}</h2>
            <iframe
              title="Podcast"
              src={embed}
              width="100%"
              height="232"
              loading="lazy"
              style={{ border: 0, borderRadius: 12, marginTop: 20 }}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            />
          </div>
        )}
      </div>
    </section>
  );
}
