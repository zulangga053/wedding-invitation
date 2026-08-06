import { SuperAdminGate } from '@/components/admin/super-admin-gate';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return <SuperAdminGate>{children}</SuperAdminGate>;
}