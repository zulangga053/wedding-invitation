import Link from 'next/link';
import { AuthForm } from '@/components/auth/auth-form';

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-brand-secondary px-6">
      <div className="w-full max-w-sm rounded-2xl border border-foreground/5 bg-background p-8 shadow-sm">
        <Link href="/" className="font-display text-2xl font-semibold text-foreground">
          Momentia
        </Link>
        <h1 className="mt-6 text-2xl font-semibold text-foreground">Buat Akun</h1>
        <p className="mt-1 text-sm text-foreground/60">Mulai buat undangan digital Anda.</p>
        <div className="mt-6">
          <AuthForm mode="register" />
        </div>
      </div>
    </main>
  );
}