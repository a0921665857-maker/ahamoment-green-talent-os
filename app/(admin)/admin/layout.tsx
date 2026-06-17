import '@/app/globals.css';

/** Admin is an internal English-only tool (BILINGUAL_CONTENT_SYSTEM.md: admin scans in one language). */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-paper text-ink antialiased">{children}</body>
    </html>
  );
}
