'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useAuth } from '@/components/providers/auth-provider';
import { apiFetch, ApiError } from '@/lib/api/client';

/** TanStack Query wrapper that attaches the Firebase ID token to API calls. */
export function useApiQuery<T>(path: string, enabled = true): UseQueryResult<T, Error> {
  const { getToken } = useAuth();
  return useQuery<T, Error>({
    queryKey: [path],
    enabled,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new ApiError('Not authenticated', 401);
      return apiFetch<T>(path, { token });
    },
  });
}