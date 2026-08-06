import Link from 'next/link';

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-3xl font-semibold text-foreground">Masuk ke Momentia</h1>
      <p className="mt-4 text-foreground/60">Halaman autentikasi sedang dibangun (Firebase Auth).</p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-brand-primary px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Kembali ke Beranda
      </Link>
    </main>
  );
}
