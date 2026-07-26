import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiError, setTokenReader, setUnauthorizedHandler } from './api/client';
import { authApi } from './api/endpoints';
import type { ApiUser } from './api/types';

const TOKEN_KEY = 'teedeux.token';

interface AuthState {
  user: ApiUser | null;
  /** True until the stored token has been checked against the server. */
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: ApiUser) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Read synchronously by the request layer, so it lives in a ref rather than
  // state — state would hand it a stale value between renders.
  const tokenRef = useRef<string | null>(null);

  const applyToken = useCallback(async (token: string | null) => {
    tokenRef.current = token;
    try {
      if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
      else await AsyncStorage.removeItem(TOKEN_KEY);
    } catch {
      // Storage failure only costs persistence; the session still works.
    }
  }, []);

  const logout = useCallback(async () => {
    await applyToken(null);
    setUserState(null);
  }, [applyToken]);

  // Wire the client before any request can be issued.
  useEffect(() => {
    setTokenReader(() => tokenRef.current);
    setUnauthorizedHandler(() => {
      tokenRef.current = null;
      void AsyncStorage.removeItem(TOKEN_KEY);
      setUserState(null);
    });
  }, []);

  // Restore and validate a stored token on boot.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const stored = await AsyncStorage.getItem(TOKEN_KEY);
        if (!stored) return;

        tokenRef.current = stored;
        const { user: me } = await authApi.me();
        if (!cancelled) setUserState(me);
      } catch (error) {
        // A rejected token is already cleared by the unauthorized handler;
        // anything else (server unreachable) shouldn't strand the splash.
        if (!(error instanceof ApiError && error.isAuthError)) {
          tokenRef.current = null;
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await authApi.login({ email, password });
      await applyToken(result.token);
      setUserState(result.user);
    },
    [applyToken]
  );

  const signup = useCallback(
    async (name: string, email: string, password: string, phone?: string) => {
      const result = await authApi.signup({ name, email, password, phone });
      await applyToken(result.token);
      setUserState(result.user);
    },
    [applyToken]
  );

  const value = useMemo<AuthState>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      login,
      signup,
      logout,
      setUser: setUserState,
    }),
    [user, isLoading, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an AuthProvider');
  return context;
}
