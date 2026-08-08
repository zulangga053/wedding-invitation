'use client';

import { useState } from 'react';
import { type Tenant } from '@momentia/shared';
import { useApiQuery, useApiMutation } from '@/lib/api/use-api';

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
      active: 'bg-green-50 text-green-700',
      suspended: 'bg-red-50 text-red-700',
    }[status] ?? 'bg-gray-50 text-gray-700'
  );
}

interface AuditLog {
  actorUid: string;
  action: string;
  targetId: string | null;
  tenantId: string | null;
  timestamp: string;
  meta?: Record<string, unknown>;
}

export default function SuperAdminTenantsPage() {
  const { data: tenants, isLoading, refetch } = useApiQuery<Tenant[]>('/admin/tenants');
  const [auditLimit, setAuditLimit] = useState(50);
  const { data: auditLogs, isLoading: auditLoading } = useApiQuery<AuditLog[]>(
    `/admin/audit-logs?limit=${auditLimit}`,
    !!tenants?.length
  );

  const { mutate: setStatus, isPending: statusPending } = useApiMutation<
    { status: string },
    { tenantId: string; status: string }
  >({
    method: 'PATCH',
    path: (vars) => `/admin/tenants/${vars.tenantId}/status`,
    onSuccess: () => {
      refetch();
    },
  });

  const handleStatusChange = (tenantId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    if (
      window.confirm(
        `Apakah yakin ingin ${nextStatus === 'active' ? 'mengaktifkan' : 'menonaktifkan'} tenant ini?`
      )
    ) {
      setStatus({ tenantId, status: nextStatus });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="border-brand-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-foreground text-2xl font-bold">Kelola Tenant</h1>
      </div>

      <div className="bg-card rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Tenant
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Slug
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Owner UID
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Status
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Dibuat
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {tenants?.map((tenant) => (
              <tr key={tenant.id} className="border-b last:border-b-0">
                <td className="px-4 py-3">
                  <p className="text-foreground font-medium">{tenant.name}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-foreground/50 text-xs">/{tenant.slug}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-foreground text-sm">{tenant.ownerUid}</p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tenantStatusBadge(
                      tenant.status
                    )}`}
                  >
                    {tenantStatusLabel(tenant.status)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="text-muted-foreground text-sm">
                    {new Date(tenant.createdAt).toLocaleDateString('id-ID')}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleStatusChange(tenant.id, tenant.status)}
                    disabled={statusPending}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {tenant.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!tenants || tenants.length === 0) && (
          <div className="text-muted-foreground px-4 py-8 text-center">Belum ada tenant.</div>
        )}
      </div>

      <div className="bg-card rounded-lg border">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-foreground text-lg font-semibold">Audit Log Terbaru</h2>
          <select
            value={auditLimit}
            onChange={(e) => setAuditLimit(Number(e.target.value))}
            className="rounded-md border px-2 py-1 text-sm"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        {auditLoading ? (
          <div className="text-muted-foreground px-4 py-8 text-center">Memuat audit log...</div>
        ) : auditLogs && auditLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Waktu
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Aktor
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Aksi
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Target
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Tenant
                  </th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={`${log.timestamp}-${log.action}`} className="border-b last:border-b-0">
                    <td className="px-4 py-3">
                      <p className="text-foreground text-sm">
                        {new Date(log.timestamp).toLocaleString('id-ID')}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-foreground font-mono text-sm text-xs">{log.actorUid}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-primary/10 text-primary inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-muted-foreground font-mono text-sm text-xs">
                        {log.targetId ?? '-'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-muted-foreground font-mono text-sm text-xs">
                        {log.tenantId ?? '-'}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-muted-foreground px-4 py-8 text-center">Tidak ada audit log.</div>
        )}
      </div>
    </div>
  );
}
