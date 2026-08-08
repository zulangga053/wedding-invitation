import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useApiMutation, useApiQuery } from '@/lib/api/use-api';

const { apiFetch } = vi.hoisted(() => ({ apiFetch: vi.fn() }));
const { useAuth } = vi.hoisted(() => ({ useAuth: vi.fn() }));

vi.mock('@/lib/api/client', () => ({ apiFetch }));
vi.mock('@/components/providers/auth-provider', () => ({ useAuth }));

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  vi.clearAllMocks();
  useAuth.mockReturnValue({
    authenticated: true,
    getToken: vi.fn().mockResolvedValue('token'),
  });
});

describe('useApiQuery', () => {
  it('fetches data with auth token when authenticated', async () => {
    apiFetch.mockResolvedValue({ items: [] });

    const { result } = renderHook(() => useApiQuery('/gifts'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiFetch).toHaveBeenCalledWith('/gifts', {
      getAuthToken: expect.any(Function),
    });
    expect(result.current.data).toEqual({ items: [] });
  });

  it('never fetches when not authenticated', async () => {
    useAuth.mockReturnValue({
      authenticated: false,
      getToken: vi.fn().mockResolvedValue(null),
    });

    const { result } = renderHook(() => useApiQuery('/gifts'), { wrapper });
    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'));

    expect(apiFetch).not.toHaveBeenCalled();
  });
});

describe('useApiMutation', () => {
  it('sends POST with variables as body', async () => {
    apiFetch.mockResolvedValue({ ok: true });

    const { result } = renderHook(() => useApiMutation({ method: 'POST', path: '/wishes' }), {
      wrapper,
    });
    result.current.mutate({ name: 'A' });

    await waitFor(() => expect(apiFetch).toHaveBeenCalledTimes(1));
    expect(apiFetch).toHaveBeenCalledWith('/wishes', {
      method: 'POST',
      getAuthToken: expect.any(Function),
      body: { name: 'A' },
    });
  });

  it('resolves dynamic path from variables for DELETE without body', async () => {
    apiFetch.mockResolvedValue({ ok: true });

    const { result } = renderHook(
      () =>
        useApiMutation({
          method: 'DELETE',
          path: (variables: { id: string }) => `/wishes/${variables.id}`,
        }),
      { wrapper }
    );
    result.current.mutate({ id: 'w1' });

    await waitFor(() => expect(apiFetch).toHaveBeenCalledTimes(1));
    expect(apiFetch).toHaveBeenCalledWith('/wishes/w1', {
      method: 'DELETE',
      getAuthToken: expect.any(Function),
    });
  });
});
