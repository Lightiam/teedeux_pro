import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ApiError, setTokenReader, setUnauthorizedHandler } from '../api/client';
import { authApi } from '../api/endpoints';
import type { ApiUser } from '../api/types';

const TOKEN_KEY = 'teedeux.token';

function readStoredToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    // Private browsing or blocked storage — the session just won't persist.
    return null;
  }
}

function writeStoredToken(token: string | null): void {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Non-fatal; the in-memory token still works for this tab.
  }
}

interface AuthState {
  user: ApiUser | null;
  /** True until the stored token has been checked against the server. */
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  resetPassword: (email: string, newPassword: string) => Promise<string>;
  logout: () => void;
  /** Replaces the cached user after a profile mutation. */
  setUser: (user: ApiUser) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // The client reads the token synchronously on every request, so it lives in a
  // ref rather than state to avoid a stale value between renders.
  const tokenRef = useRef<string | null>(readStoredToken());

  const applyToken = useCallback((token: string | null) => {
    tokenRef.current = token;
    writeStoredToken(token);
  }, []);

  const logout = useCallback(() => {
    applyToken(null);
    setUserState(null);
  }, [applyToken]);

  // Wire the client once, before any request can be issued.
  useEffect(() => {
    setTokenReader(() => tokenRef.current);
    setUnauthorizedHandler(() => {
      applyToken(null);
      setUserState(null);
    });
  }, [applyToken]);

  // Validate a stored token on boot so a stale one doesn't look signed in.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!tokenRef.current) {
        setIsLoading(false);
        return;
      }

      try {
        const { user: me } = await authApi.me();
        if (!cancelled) setUserState(me);
      } catch (error) {
        // A rejected token is already cleared by the unauthorized handler;
        // anything else (server down) shouldn't strand the user on a spinner.
        if (!cancelled && !(error instanceof ApiError && error.isAuthError)) {
          applyToken(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [applyToken]);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await authApi.login({ email, password });
      applyToken(result.token);
      setUserState(result.user);
    },
    [applyToken]
  );

  const signup = useCallback(
    async (name: string, email: string, password: string, phone?: string) => {
      const result = await authApi.signup({ name, email, password, phone });
      applyToken(result.token);
      setUserState(result.user);
    },
    [applyToken]
  );

  const resetPassword = useCallback(async (email: string, newPassword: string) => {
    const result = await authApi.resetPassword({ email, newPassword });
    return result.message;
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      login,
      signup,
      resetPassword,
      logout,
      setUser: setUserState,
    }),
    [user, isLoading, login, signup, resetPassword, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
}
