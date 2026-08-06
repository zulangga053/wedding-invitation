'use client';

import { use, useState } from 'react';
import Image from 'next/image';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { GalleryPhoto } from '@momentia/shared';
import { useApiQuery } from '@/lib/api/use-api';
import { apiFetch } from '@/lib/api/client';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function EventGalleryPage({
  params,
}: {
  params: Promise<{ tenantId: string; eventId: string }>;
}) {
  const { tenantId, eventId } = use(params);
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [error, setError] = useState<string | null>(null);

  const photos = useApiQuery<GalleryPhoto[]>(`/tenants/${tenantId}/events/${eventId}/gallery`);

  const invalidate = () => void queryClient.invalidateQueries();

  const add = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return apiFetch(`/tenants/${tenantId}/events/${eventId}/gallery`, {
        method: 'POST',
        token,
        body: { imageUrl: url, caption: caption || undefined },
      });
    },
    onSuccess: () => {
      setUrl('');
      setCaption('');
      invalidate();
    },
    onError: () => setError('Gagal menambahkan foto'),
  });

  const remove = useMutation({
    mutationFn: async (photoId: string) => {
      const token = await getToken();
      return apiFetch(`/tenants/${tenantId}/events/${eventId}/gallery/${photoId}`, {
        method: 'DELETE',
        token,
      });
    },
    onSuccess: invalidate,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-foreground">Galeri</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Tambahkan foto ke galeri undangan. URL gambar (Google Drive, Unsplash, dll).
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-foreground/5 bg-background p-6">
        <div className="space-y-2">
          <Label htmlFor="img-url">URL Gambar</Label>
          <Input
            id="img-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="img-caption">Keterangan (opsional)</Label>
          <Input
            id="img-caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Momen bahagia bersama keluarga"
          />
        </div>
        {error ? <p className="text-xs text-red-500">{error}</p> : null}
        <Button onClick={() => void add.mutate()} disabled={!url.trim()}>
          Tambah Foto
        </Button>
      </div>

      {photos.isLoading ? (
        <p className="text-sm text-foreground/50">Memuat…</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {(photos.data ?? []).map((photo) => (
            <div key={photo.id} className="group relative overflow-hidden rounded-2xl border border-foreground/5">
              <Image
                src={photo.imageUrl}
                alt={photo.caption ?? 'Foto galeri'}
                width={400}
                height={500}
                className="aspect-[4/5] w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent p-3">
                <span className="truncate text-xs text-white">{photo.caption ?? 'Tanpa keterangan'}</span>
                <button
                  type="button"
                  onClick={() => void remove.mutate(photo.id)}
                  className="rounded-md bg-red-500/80 px-2 py-1 text-xs text-white"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}