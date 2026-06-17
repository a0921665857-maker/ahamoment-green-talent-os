import { AdminLogin } from '@/components/admin/AdminLogin';

export const metadata = { title: 'Admin', robots: { index: false } };

export default function AdminLoginPage() {
  return (
    <main className="mx-auto max-w-sm px-6 py-24">
      <h1 className="text-xl font-semibold">Admin access</h1>
      <p className="mt-2 text-sm text-ink-soft">Enter the admin password to continue.</p>
      <AdminLogin />
    </main>
  );
}
