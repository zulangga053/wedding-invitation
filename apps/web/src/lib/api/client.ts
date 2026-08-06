export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/v1';

export class ApiError extends Error {
  readonly status: number;
  readonly issues?: unknown;
  readonly code?: string;

  constructor(message: string, status: number, issues?: unknown, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.issues = issues;
    this.code = code;
  }
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /**
   * Static token string. Prefer `getAuthToken` for fresh tokens.
   * @deprecated Use `getAuthToken` instead.
   */
  token?: string | null;
  /**
   * Function that returns a Firebase ID token.
   * If provided, it will be added to the Authorization header.
   */
  getAuthToken?: () => Promise<string | null>;
  headers?: Record<string, string>;
}

/** Typed fetch wrapper for the Momentia REST API (v1). */
export async function apiFetch<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token, getAuthToken, headers } = options;

  const finalHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  };
  if (body !== undefined) finalHeaders['Content-Type'] = 'application/json';

  let resolvedToken: string | null | undefined = token;
  if (getAuthToken) {
    resolvedToken = await getAuthToken();
  }
  if (resolvedToken) {
    finalHeaders['Authorization'] = `Bearer ${resolvedToken}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    let issues: unknown;
    let code: string | undefined;
    try {
      const payload = (await response.json()) as {
        message?: string;
        issues?: unknown;
        code?: string;
      };
      if (payload.message) message = payload.message;
      issues = payload.issues;
      code = payload.code;
    } catch {
      // non-JSON error body
    }
    throw new ApiError(message, response.status, issues, code);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
