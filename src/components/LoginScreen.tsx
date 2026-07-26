import React, { useState } from 'react';
import { ScreenId } from '../types';
import { useAuth } from '../context/AuthContext';
import { AuthField, FormMessage, SubmitButton } from './ui/AuthField';

interface LoginScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);

    try {
      await login(email.trim(), password);
      // No navigation needed — the shop mounts as soon as auth state flips.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign you in');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-full px-6 pt-10 pb-12 flex flex-col">
      <div className="mb-8">
        <div className="h-14 w-14 rounded-2xl bg-[#9c3f00] text-white flex items-center justify-center font-extrabold text-2xl mb-4">
          T
        </div>
        <h1 className="text-2xl font-extrabold text-[#1c1b1b]">Welcome back</h1>
        <p className="text-sm text-[#584238] mt-1">Sign in to pick up where you left off.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <FormMessage tone="error">{error}</FormMessage>}

        <AuthField
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />

        <AuthField
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Your password"
          autoComplete="current-password"
          required
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onNavigate('reset-password')}
            className="text-xs font-bold text-[#9c3f00] active:opacity-60"
          >
            Forgot password?
          </button>
        </div>

        <SubmitButton busy={busy}>{busy ? 'Signing in…' : 'Sign in'}</SubmitButton>
      </form>

      <p className="text-center text-sm text-[#584238] mt-6">
        New to Teedeux Mart?{' '}
        <button
          type="button"
          onClick={() => onNavigate('signup')}
          className="font-bold text-[#9c3f00] active:opacity-60"
        >
          Create an account
        </button>
      </p>

      <div className="mt-auto pt-8">
        <div className="rounded-2xl bg-[#f6f3f2] px-4 py-3">
          <p className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[#584238] font-bold">
            Demo account
          </p>
          <p className="font-['JetBrains_Mono'] text-xs text-[#1c1b1b] mt-1 break-all">
            marcus.vance@example.com / teedeux1234
          </p>
        </div>
      </div>
    </div>
  );
};
