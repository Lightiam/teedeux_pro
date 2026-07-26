/** Thrown for any non-2xx response, carrying the server's error code. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code = 'error',
    readonly details?: Array<{ path: string; message: string }>
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** True when the session is missing or expired and the user must sign in. */
  get isAuthError(): boolean {
    return this.status === 401;
  }
}

interface ErrorBody {
  error?: {
    code?: string;
    message?: string;
    details?: Array<{ path: string; message: string }>;
  };
}

/**
 * Base URL for the API. In development Vite proxies /api to the server, so the
 * relative default works without CORS. Set VITE_API_URL to point elsewhere.
 */
const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';

type TokenReader = () => string | null;

/** Set by the auth layer so every request can attach the current token. */
let readToken: TokenReader = () => null;

export function setTokenReader(reader: TokenReader): void {
  readToken = reader;
}

/** Called when the server rejects a token, so the app can drop the session. */
type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler = () => {};

export function setUnauthorizedHandler(handler: UnauthorizedHandler): void {
  onUnauthorized = handler;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | undefined | null>;
  /** Skip attaching the bearer token even when one is available. */
  anonymous?: boolean;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = `${BASE_URL}/api${path}`;
  if (!query) return url;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  }

  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, anonymous, signal } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers['content-type'] = 'application/json';

  const token = anonymous ? null : readToken();
  if (token) headers.authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      signal,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    // Abort is the caller unmounting, not a failure worth reporting.
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError(0, 'Cannot reach the server. Is it running?', 'network_error');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    // Some error responses have no body; fall through to the status-based message.
  }

  if (!response.ok) {
    const error = (payload as ErrorBody | null)?.error;

    if (response.status === 401) {
      onUnauthorized();
    }

    throw new ApiError(
      response.status,
      error?.message ?? `Request failed with status ${response.status}`,
      error?.code ?? 'error',
      error?.details
    );
  }

  return payload as T;
}

export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'POST', body }),

  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'PATCH', body }),

  delete: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
