'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';

/** Client-side gate: requires superAdmin custom claim. */
export function SuperAdminGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const isSuper = user?.superAdmin === true;

  useEffect(() => {
    if (!loading && !isSuper) {
      router.replace('/admin');
    }
  }, [loading, isSuper, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
      </div>
    );
  }

  if (!isSuper) return null;
  return <>{children}</>;
}