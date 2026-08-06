import Link from 'next/link';

export default function AdminPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-4xl font-semibold text-foreground">Dashboard Admin</h1>
      <p className="mt-4 text-foreground/60">
        Dashboard Momentia sedang dibangun. Rute ini akan menyajikan manajemen tenant, event, dan
        undangan.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-brand-primary px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Kembali ke Beranda
      </Link>
    </main>
  );
}