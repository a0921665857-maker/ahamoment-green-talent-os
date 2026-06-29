/**
 * Founder headshot rendered as a CSS background-image so it degrades gracefully:
 * if /founder.jpg is missing, the element shows an empty avatar circle instead of
 * a broken-image icon (SSR-safe, no JS, no hydration flash). Drop
 * public/founder.jpg into the repo and it fills in on the next deploy.
 */
export function FounderAvatar({ className }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label="Michael"
      className={className}
      style={{
        backgroundImage: 'url(/founder.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />
  );
}
