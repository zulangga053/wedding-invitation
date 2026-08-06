import {
  useQuery,
  useMutation,
  type UseQueryResult,
  type UseMutationResult,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { useAuth } from '@/components/providers/auth-provider';
import { apiFetch, type ApiRequestOptions } from '@/lib/api/client';

/** TanStack Query wrapper that attaches the Firebase ID token to GET API calls. */
export function useApiQuery<T>(path: string, enabled = true): UseQueryResult<T, Error> {
  const { getToken, authenticated } = useAuth();
  return useQuery<T, Error>({
    queryKey: [path],
    // Only run query if the user is authenticated (or we think they are)
    enabled: enabled && authenticated,
    queryFn: async () => {
      // The `enabled` flag should prevent this from running if not authenticated,
      // but as a safeguard, we still check.
      return apiFetch<T>(path, { getAuthToken: getToken });
    },
  });
}

/**
 * TanStack Mutation wrapper that attaches the Firebase ID token to mutating API calls.
 * @example
 * const updateUser = useApiMutation<User, { name: string }>({
 *   method: 'PATCH',
 *   path: `/users/${userId}`,
 *   onSuccess: () => queryClient.invalidateQueries(['users', userId]),
 * });
 *
 * updateUser.mutate({ name: 'New Name' });
 */
export function useApiMutation<TData = unknown, TVariables = void>({
  path,
  method,
  ...options
}: Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'> & {
  path: string | ((variables: TVariables) => string);
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
}): UseMutationResult<TData, Error, TVariables> {
  const { getToken } = useAuth();

  return useMutation<TData, Error, TVariables>({
    ...options,
    mutationFn: (variables: TVariables) => {
      const finalPath = typeof path === 'function' ? path(variables) : path;
      const apiOptions: ApiRequestOptions = {
        method,
        getAuthToken: getToken,
      };

      // For PUT/POST/PATCH, the variables are the body. For DELETE, they might be part of the path.
      if (method !== 'DELETE') {
        apiOptions.body = variables;
      }

      return apiFetch<TData>(finalPath, apiOptions);
    },
  });
}
