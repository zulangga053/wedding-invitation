'use client';

import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-foreground/5 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6">
          <Link href="/admin" className="font-display text-xl font-semibold text-foreground">
            Momentia
          </Link>
          <div className="flex items-center gap-4">
            {user?.email ? (
              <span className="max-w-[180px] truncate text-xs text-foreground/60">
                {user.email}
              </span>
            ) : null}
            <Button variant="ghost" size="sm" onClick={() => void logout()}>
              Keluar
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}