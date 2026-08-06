'use client';

import Link from 'next/link';
import type { Event, Tenant } from '@momentia/shared';
import { useApiQuery } from '@/lib/api/use-api';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api/client';

function EventCard({ tenantId, event }: { tenantId: string; event: Event }) {
  const link = `/admin/tenants/${tenantId}/events/${event.id}`;
  return (
    <Link
      href={link}
      className="group rounded-xl border border-foreground/10 bg-background p-5 transition-colors hover:border-brand-primary/40"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-foreground">{event.name}</h3>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
            event.status === 'published'
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-amber-50 text-amber-700'
          }`}
        >
          {event.status}
        </span>
      </div>
      <p className="mt-1 text-xs text-foreground/50">
        /invitation/{event.slug} · {new Date(event.mainDate).toLocaleDateString('id-ID')}
      </p>
    </Link>
  );
}

function TenantSection({ tenant }: { tenant: Tenant }) {
  const events = useApiQuery<Event[]>(`/tenants/${tenant.id}/events`);
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-medium text-foreground">{tenant.name}</h2>
        <span className="text-xs text-foreground/50">/{tenant.slug}</span>
      </div>
      {events.isLoading ? (
        <p className="text-sm text-foreground/50">Memuat undangan…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(events.data ?? []).map((event) => (
            <EventCard key={event.id} tenantId={tenant.id} event={event} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function AdminDashboardPage() {
  const tenants = useApiQuery<Tenant[]>('/tenants');

  if (tenants.isLoading) {
    return <div className="text-sm text-foreground/60">Memuat…</div>;
  }

  if (tenants.isError) {
    const message = tenants.error instanceof ApiError ? tenants.error.message : 'Gagal memuat data';
    return <div className="text-sm text-red-500">{message}</div>;
  }

  const list = tenants.data ?? [];

  if (list.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-foreground/15 py-24 text-center">
        <h2 className="font-display text-2xl font-semibold text-foreground">Selamat datang di Momentia</h2>
        <p className="mt-2 max-w-sm text-sm text-foreground/60">
          Buat tenant dan undangan pertama Anda untuk mulai mengelola tamu, RSVP, dan statistik.
        </p>
        <Link href="/admin/setup" className="mt-6">
          <Button>Buat Undangan</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold text-foreground">Dashboard</h1>
        <Link href="/admin/setup">
          <Button size="sm">+ Undangan Baru</Button>
        </Link>
      </div>

      {list.map((tenant) => (
        <TenantSection key={tenant.id} tenant={tenant} />
      ))}
    </div>
  );
}