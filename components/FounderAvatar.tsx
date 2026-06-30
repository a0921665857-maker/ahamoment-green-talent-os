/**
 * Founder headshot rendered as a CSS background-image so it degrades gracefully:
 * if /founder.png is missing, the element shows an empty avatar circle instead of
 * a broken-image icon (SSR-safe, no JS, no hydration flash). Drop
 * public/founder.png into the repo and it fills in on the next deploy.
 */
export function FounderAvatar({ className }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label="Michael"
      className={className}
      style={{
        backgroundImage: 'url(/founder.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />
  );
}
