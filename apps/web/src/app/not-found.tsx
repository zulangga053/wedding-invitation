import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-medium uppercase tracking-[0.3em] text-brand-primary">404</p>
      <h1 className="mt-4 font-display text-4xl font-semibold text-foreground">Halaman Tidak Ditemukan</h1>
      <p className="mt-2 text-foreground/60">
        Halaman yang Anda cari tidak ada atau telah dipindahkan.
      </p>
      <Link href="/" className="mt-8">
        <Button>Kembali ke Beranda</Button>
      </Link>
    </main>
  );
}