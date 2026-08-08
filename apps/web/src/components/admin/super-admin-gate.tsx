'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';

/** Client-side gate: requires the superAdmin custom claim. */
export function SuperAdminGate({ children }: { children: React.ReactNode }) {
  const { loading, superAdmin } = useAuth();
  const router = useRouter();
  const isSuper = superAdmin === true;

  useEffect(() => {
    if (!loading && !isSuper) {
      router.replace('/admin');
    }
  }, [loading, isSuper, router]);

  if (loading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="border-brand-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  if (!isSuper) return null;
  return <>{children}</>;
}
