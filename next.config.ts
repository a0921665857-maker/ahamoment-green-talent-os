import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * /book — the one stable booking URL for bios and printed links
   * (IG/Threads point here; switching booking vendors = change the env +
   * redeploy, no bio edits). Deliberately a temporary redirect: a permanent
   * 308 would let browsers cache the Calendly target and defeat the whole
   * point of the indirection. BOOKING_REDIRECT_URL wins so the target can
   * diverge from the on-page CTA links during the Cal.com dual-run.
   * Evaluated before proxy.ts middleware, so no locale-exclusion changes.
   */
  async redirects() {
    const target = process.env.BOOKING_REDIRECT_URL ?? process.env.NEXT_PUBLIC_CALENDLY_URL;
    const rules = [
      /**
       * /judgment.html was live for about an hour as a standalone file carrying its
       * own palette, before the module became a real page inside the design system.
       * Temporary, not permanent: a 308 would be cached by browsers and would
       * outlive the reason for it.
       */
      { source: "/judgment.html", destination: "/zh-TW/judgment", permanent: false },
    ];
    if (target) rules.unshift({ source: "/book", destination: target, permanent: false });
    return rules;
  },
};

export default nextConfig;
