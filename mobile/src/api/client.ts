import { Platform } from 'react-native';

/** Thrown for any non-2xx response, carrying the server's error code. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code = 'error'
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isAuthError(): boolean {
    return this.status === 401;
  }
}

interface ErrorBody {
  error?: { code?: string; message?: string };
}

/**
 * Base URL for the API.
 *
 * A device or emulator cannot reach the host's "localhost", so the default
 * differs by platform: the Android emulator maps 10.0.2.2 to the host, while
 * the iOS simulator shares the host's loopback. Set EXPO_PUBLIC_API_URL to a
 * LAN address or deployed host when running on a physical device.
 */
function defaultBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  return Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';
}

const BASE_URL = defaultBaseUrl();

type TokenReader = () => string | null;
let readToken: TokenReader = () => null;

export function setTokenReader(reader: TokenReader): void {
  readToken = reader;
}

type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler = () => {};

export function setUnauthorizedHandler(handler: UnauthorizedHandler): void {
  onUnauthorized = handler;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | undefined | null>;
  anonymous?: boolean;
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
  const { method = 'GET', body, query, anonymous } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers['content-type'] = 'application/json';

  const token = anonymous ? null : readToken();
  if (token) headers.authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new ApiError(0, `Cannot reach the server at ${BASE_URL}`, 'network_error');
  }

  if (response.status === 204) return undefined as T;

  const isJson = (response.headers.get('content-type') ?? '').includes('application/json');

  let payload: unknown = null;
  if (isJson) {
    try {
      payload = await response.json();
    } catch {
      // Declared JSON but unparseable — treated as a missing body below.
    }
  }

  // A non-JSON response means the request never reached the API — usually a
  // wrong EXPO_PUBLIC_API_URL, or a host serving its web shell on /api paths.
  if (!isJson) {
    throw new ApiError(
      response.status,
      `The API did not respond at ${BASE_URL}/api. Check that the backend is running and reachable.`,
      'api_unreachable'
    );
  }

  if (!response.ok) {
    const error = (payload as ErrorBody | null)?.error;
    if (response.status === 401) onUnauthorized();

    throw new ApiError(
      response.status,
      error?.message ?? `Request failed with status ${response.status}`,
      error?.code ?? 'error'
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
