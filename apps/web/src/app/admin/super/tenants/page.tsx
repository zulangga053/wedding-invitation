'use client';

import type { Tenant } from '@momentia/shared';
import { useApiQuery } from '@/lib/api/use-api';
import { ApiError } from '@/lib/api/client';

function tenantStatusLabel(status: string) {
  return (
    {
      trial: 'Trial',
      active: 'Aktif',
      suspended: 'Dinonaktifkan',
    }[status] ?? status
  );
}

function tenantStatusBadge(status: string) {
  return (
    {
      trial: 'bg-blue-50 text-blue-700',
      active: 'bg-emerald-50 text-emerald-700',
      suspended: 'bg-red-50 text-red-600',
    }[status] ?? ''
  );
}

export default function SuperAdminTenantsPage() {
  const tenants = useApiQuery<Tenant[]>('/admin/tenants');

  if (tenants.isLoading) {
    return <div className="text-sm text-foreground/60">Memuat…</div>;
  }

  if (tenants.isError) {
    const message = tenants.error instanceof ApiError ? tenants.error.message : 'Gagal memuat data';
    return <div className="text-sm text-red-500">{message}</div>;
  }

  const list = tenants.data ?? [];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold text-foreground">Manajemen Tenant</h1>
      <div className="overflow-hidden rounded-2xl border border-foreground/5">
        <table className="w-full text-left text-sm">
          <thead className="bg-foreground/5 text-xs uppercase tracking-wider text-foreground/60">
            <tr>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Rencana</th>
              <th className="px-4 py-3">Dibuat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-foreground/5">
            {list.map((tenant) => (
              <tr key={tenant.id} className="bg-background">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{tenant.name}</p>
                  <p className="text-xs text-foreground/50">/{tenant.slug}</p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${tenantStatusBadge(
                      tenant.status
                    )}`}
                  >
                    {tenantStatusLabel(tenant.status)}
                  </span>
                </td>
                <td className="px-4 py-3 capitalize">{tenant.plan}</td>
                <td className="px-4 py-3">{new Date(tenant.createdAt).toLocaleDateString('id-ID')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}