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
import { authApi, firebaseAuthApi } from '../api/endpoints';
import type { ApiUser } from '../api/types';
import { describeAuthError, firebaseAuth, isFirebaseConfigured } from '../auth/firebase';

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
  /** True until the stored session has been checked. */
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  /**
   * Firebase sends a reset link by email and ignores `newPassword`. The Express
   * backend sets the password directly. `resetSendsEmail` says which.
   */
  resetPassword: (email: string, newPassword: string) => Promise<string>;
  readonly resetSendsEmail: boolean;
  logout: () => void;
  /** Replaces the cached user after a profile mutation. */
  setUser: (user: ApiUser) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return isFirebaseConfigured ? (
    <FirebaseAuthProvider>{children}</FirebaseAuthProvider>
  ) : (
    <ApiAuthProvider>{children}</ApiAuthProvider>
  );
};

/**
 * Firebase Auth session.
 *
 * The API client reads the bearer token synchronously on every request, but
 * Firebase ID tokens are async and rotate roughly hourly. Rather than await
 * getIdToken() per call, the latest token is cached from onIdTokenChanged —
 * which fires on sign-in, sign-out and every refresh — so the synchronous
 * reader always has a current one.
 */
const FirebaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const tokenRef = useRef<string | null>(null);
  /** Guards against re-fetching the profile on every hourly token refresh. */
  const loadedUidRef = useRef<string | null>(null);

  useEffect(() => {
    setTokenReader(() => tokenRef.current);

    // A 401 here means the profile document is missing or Firestore refused —
    // not that the Firebase session is invalid — so the session is left alone
    // and the app simply shows no user.
    setUnauthorizedHandler(() => setUserState(null));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const auth = firebaseAuth();

    // Dynamic import keeps the auth module out of the initial chunk.
    const unsubscribePromise = import('firebase/auth').then(({ onIdTokenChanged }) =>
      onIdTokenChanged(auth, async (firebaseUser) => {
        if (cancelled) return;

        if (!firebaseUser) {
          tokenRef.current = null;
          loadedUidRef.current = null;
          setUserState(null);
          setIsLoading(false);
          return;
        }

        tokenRef.current = await firebaseUser.getIdToken();

        // Only a token refresh — the profile is already loaded.
        if (loadedUidRef.current === firebaseUser.uid) {
          setIsLoading(false);
          return;
        }

        try {
          // ensureProfile rather than /auth/me: an account created outside this
          // API (console, or a future Google sign-in) has no profile document,
          // and this creates one rather than failing.
          const { user: profile } = await firebaseAuthApi.ensureProfile();
          if (!cancelled) {
            loadedUidRef.current = firebaseUser.uid;
            setUserState(profile);
          }
        } catch (error) {
          if (!cancelled) {
            console.error('Could not load your profile', error);
            setUserState(null);
          }
        } finally {
          if (!cancelled) setIsLoading(false);
        }
      })
    );

    return () => {
      cancelled = true;
      void unsubscribePromise.then((unsubscribe) => unsubscribe());
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    try {
      await signInWithEmailAndPassword(firebaseAuth(), email, password);
      // onIdTokenChanged takes it from here.
    } catch (error) {
      throw new Error(describeAuthError(error));
    }
  }, []);

  const signup = useCallback(
    async (name: string, email: string, password: string, phone?: string) => {
      // Server-side so the Auth record and the profile document are created
      // together; a client-only createUser would leave a user with no profile.
      await firebaseAuthApi.signup({ name, email, password, phone });

      const { signInWithEmailAndPassword } = await import('firebase/auth');
      try {
        await signInWithEmailAndPassword(firebaseAuth(), email, password);
      } catch (error) {
        throw new Error(describeAuthError(error));
      }
    },
    []
  );

  const resetPassword = useCallback(async (email: string) => {
    const { sendPasswordResetEmail } = await import('firebase/auth');
    try {
      await sendPasswordResetEmail(firebaseAuth(), email);
    } catch (error) {
      throw new Error(describeAuthError(error));
    }
    // Worded so it cannot confirm whether the address has an account.
    return 'If that account exists, a reset link is on its way';
  }, []);

  const logout = useCallback(() => {
    void import('firebase/auth').then(({ signOut }) => signOut(firebaseAuth()));
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      login,
      signup,
      resetPassword,
      resetSendsEmail: true,
      logout,
      setUser: setUserState,
    }),
    [user, isLoading, login, signup, resetPassword, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/** Session against the Express backend, which mints its own JWTs. */
const ApiAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
      resetSendsEmail: false,
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
