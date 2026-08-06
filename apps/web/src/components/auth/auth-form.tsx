'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z.object({
  email: z.string().email('Masukkan email yang valid'),
  password: z.string().min(8, 'Kata sandi minimal 8 karakter'),
});
type FormValues = z.infer<typeof schema>;

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const { signInEmail, signUpEmail, signInGoogle } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    setError(null);
    try {
      if (mode === 'login') {
        await signInEmail(values.email, values.password);
      } else {
        await signUpEmail(values.email, values.password);
      }
      router.replace('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal masuk. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  }

  async function onGoogle() {
    setError(null);
    try {
      await signInGoogle();
      router.replace('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal masuk dengan Google.');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" placeholder="nama@email.com" {...register('email')} />
        {errors.email ? <p className="text-xs text-red-500">{errors.email.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Kata Sandi</Label>
        <Input
          id="password"
          type="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          placeholder="••••••••"
          {...register('password')}
        />
        {errors.password ? <p className="text-xs text-red-500">{errors.password.message}</p> : null}
      </div>

      {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p> : null}

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? 'Memproses…' : mode === 'login' ? 'Masuk' : 'Daftar'}
      </Button>

      <div className="flex items-center gap-3 py-1">
        <span className="h-px flex-1 bg-foreground/10" />
        <span className="text-xs text-foreground/50">atau</span>
        <span className="h-px flex-1 bg-foreground/10" />
      </div>

      <Button type="button" variant="outline" className="w-full" onClick={() => void onGoogle()}>
        Masuk dengan Google
      </Button>

      <p className="text-center text-xs text-foreground/60">
        {mode === 'login' ? (
          <>
            Belum punya akun?{' '}
            <Link href="/register" className="font-medium text-brand-primary hover:underline">
              Daftar
            </Link>
          </>
        ) : (
          <>
            Sudah punya akun?{' '}
            <Link href="/login" className="font-medium text-brand-primary hover:underline">
              Masuk
            </Link>
          </>
        )}
      </p>
    </form>
  );
}