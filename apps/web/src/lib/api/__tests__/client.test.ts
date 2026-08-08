import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { API_URL, ApiError, apiFetch } from '@/lib/api/client';

describe('apiFetch', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns parsed JSON for a successful GET', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => ({ id: 1 }) });

    await expect(apiFetch<{ id: number }>('/ping')).resolves.toEqual({ id: 1 });
    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/ping`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      body: undefined,
      cache: 'no-store',
    });
  });

  it('serializes body and sets Content-Type for non-GET', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });

    await apiFetch('/things', { method: 'POST', body: { name: 'x' } });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/things`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ name: 'x' }),
      })
    );
  });

  it('returns undefined for a 204 response', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 204, json: async () => undefined });

    await expect(apiFetch('/delete')).resolves.toBeUndefined();
  });

  it('attaches static token as Bearer header', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });

    await apiFetch('/private', { token: 'abc' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/private`,
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer abc' }),
      })
    );
  });

  it('attaches token resolved from getAuthToken', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });

    await apiFetch('/private', { getAuthToken: async () => 'fresh' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/private`,
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer fresh' }),
      })
    );
  });

  it('throws ApiError with payload fields on non-2xx', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Bad', issues: [{ path: 'x' }], code: 'ZOD_ERROR' }),
    });

    await expect(apiFetch('/bad')).rejects.toMatchObject({
      name: 'ApiError',
      status: 400,
      message: 'Bad',
      issues: [{ path: 'x' }],
      code: 'ZOD_ERROR',
    });
  });

  it('throws ApiError with fallback message on non-JSON error body', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('no body');
      },
    });

    const err = await apiFetch('/boom').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({
      status: 500,
      message: 'Request failed (500)',
    });
  });
});
