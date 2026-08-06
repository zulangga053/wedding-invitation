'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Event } from '@momentia/shared';
import { useAuth } from '@/components/providers/auth-provider';
import { apiFetch, ApiError } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const tenantSchema = z.object({
  name: z.string().min(2, 'Minimal 2 karakter'),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/, 'Gunakan huruf kecil, angka, dan tanda hubung'),
});

const eventSchema = z.object({
  name: z.string().min(2, 'Minimal 2 karakter'),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/, 'Gunakan huruf kecil, angka, dan tanda hubung'),
  mainDate: z.string().min(1, 'Pilih tanggal acara'),
  themeId: z.enum(['luxury', 'minimalist']),
});

const HERO_PLACEHOLDER =
  'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1920&auto=format&fit=crop';

type TenantValues = z.infer<typeof tenantSchema>;
type EventValues = z.infer<typeof eventSchema>;

export default function SetupPage() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<'tenant' | 'event'>('tenant');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const tenantForm = useForm<TenantValues>({ resolver: zodResolver(tenantSchema) });
  const eventForm = useForm<EventValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: { themeId: 'luxury', slug: 'zul-angga' },
  });
  const slugPreview = useWatch({ control: eventForm.control, name: 'slug' });

  async function submitTenant(values: TenantValues) {
    setError(null);
    try {
      const token = await getToken();
      const tenant = await apiFetch<{ id: string }>('/tenants', { method: 'POST', body: values, token });
      // Prefill event slug from tenant slug for convenience.
      eventForm.setValue('slug', tenantForm.getValues('slug'));
      setStep('event');
      sessionStorage.setItem('momentia_tenant_id', tenant.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal membuat tenant');
    }
  }

  async function submitEvent(values: EventValues) {
    const tenantId = sessionStorage.getItem('momentia_tenant_id');
    if (!tenantId) {
      router.replace('/admin');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const token = await getToken();
      const payload = {
        type: 'wedding' as const,
        slug: values.slug,
        name: values.name,
        mainDate: new Date(values.mainDate).toISOString(),
        language: 'id' as const,
        themeId: values.themeId,
        hosts: [],
        music: null,
        stream: null,
        hero: {
          mediaType: 'image' as const,
          mediaUrl: HERO_PLACEHOLDER,
          overlay: 0.45,
          ctaLabel: 'Kirim Ucapan',
        },
        seo: { title: `Undangan ${values.name}`, description: `Undangan digital ${values.name}` },
      };
      const event = await apiFetch<Event>(`/tenants/${tenantId}/events`, {
        method: 'POST',
        body: payload,
        token,
      });
      router.push(`/admin/tenants/${tenantId}/events/${event.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal membuat undangan');
    } finally {
      setSubmitting(false);
    }
  }

  const errorText = error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p> : null;

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display text-3xl font-semibold text-foreground">Buat Undangan</h1>
      <p className="mt-2 text-sm text-foreground/60">
        {step === 'tenant'
          ? 'Langkah 1 dari 2 — buat organisasi/tenant Anda.'
          : 'Langkah 2 dari 2 — atur undangan pertama.'}
      </p>

      <div className="mt-8 space-y-5 rounded-2xl border border-foreground/5 bg-background p-6 shadow-sm">
        {step === 'tenant' ? (
          <form onSubmit={tenantForm.handleSubmit(submitTenant)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="tenant-name">Nama Tenant</Label>
              <Input id="tenant-name" placeholder="Zul & Angga" {...tenantForm.register('name')} />
              {tenantForm.formState.errors.name ? (
                <p className="text-xs text-red-500">{tenantForm.formState.errors.name.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenant-slug">Slug</Label>
              <Input id="tenant-slug" placeholder="zul-angga" {...tenantForm.register('slug')} />
              <p className="text-xs text-foreground/50">Digunakan untuk URL unik Anda.</p>
              {tenantForm.formState.errors.slug ? (
                <p className="text-xs text-red-500">{tenantForm.formState.errors.slug.message}</p>
              ) : null}
            </div>
            {errorText}
            <Button type="submit" className="w-full">
              Lanjut
            </Button>
          </form>
        ) : (
          <form onSubmit={eventForm.handleSubmit(submitEvent)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="event-name">Nama Undangan</Label>
              <Input id="event-name" placeholder="Pernikahan Zul & Angga" {...eventForm.register('name')} />
              {eventForm.formState.errors.name ? (
                <p className="text-xs text-red-500">{eventForm.formState.errors.name.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-slug">Slug Undangan</Label>
              <Input id="event-slug" placeholder="zul-angga" {...eventForm.register('slug')} />
              <p className="text-xs text-foreground/50">URL publik: /invitation/{slugPreview}</p>
              {eventForm.formState.errors.slug ? (
                <p className="text-xs text-red-500">{eventForm.formState.errors.slug.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-date">Tanggal Acara</Label>
              <Input id="event-date" type="date" {...eventForm.register('mainDate')} />
              {eventForm.formState.errors.mainDate ? (
                <p className="text-xs text-red-500">{eventForm.formState.errors.mainDate.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-theme">Tema</Label>
              <select
                id="event-theme"
                className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-4 text-sm"
                {...eventForm.register('themeId')}
              >
                <option value="luxury">Luxury</option>
                <option value="minimalist">Minimalist</option>
              </select>
            </div>
            {errorText}
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setStep('tenant')}>
                Kembali
              </Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? 'Membuat…' : 'Buat Undangan'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}