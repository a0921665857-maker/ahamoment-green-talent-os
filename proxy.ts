import { NextResponse, type NextRequest } from 'next/server';
import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/lib/constants';
import { ADMIN_COOKIE_NAME, verifyAdminCookie } from '@/lib/adminAuth';

const LOCALE_COOKIE = 'gtos_locale';

function pickLocale(req: NextRequest): Locale {
  const cookie = req.cookies.get(LOCALE_COOKIE)?.value;
  if (cookie && (LOCALES as readonly string[]).includes(cookie)) return cookie as Locale;
  const accept = req.headers.get('accept-language') ?? '';
  // zh-TW / zh-Hant variants → zh-TW; everything else → en
  if (/zh-?(tw|hant)/i.test(accept)) return 'zh-TW';
  if (/^zh\b/i.test(accept.split(',')[0] ?? '')) return 'zh-TW';
  return DEFAULT_LOCALE;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Admin area: gate everything except the login page and the login API on a
  // valid signed cookie (HMAC verified via Web Crypto — edge-safe).
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return NextResponse.next();
    const secret = process.env.ADMIN_SESSION_SECRET;
    const ok = secret
      ? await verifyAdminCookie(req.cookies.get(ADMIN_COOKIE_NAME)?.value, secret)
      : false;
    if (!ok) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/og') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const first = pathname.split('/')[1];
  if ((LOCALES as readonly string[]).includes(first)) {
    // Persist explicit choice so the next bare visit honors it
    const res = NextResponse.next();
    res.cookies.set(LOCALE_COOKIE, first, { path: '/', maxAge: 60 * 60 * 24 * 365 });
    return res;
  }

  const locale = pickLocale(req);
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
