import React, { useState } from 'react';
import { ScreenId } from '../types';
import { useAuth } from '../context/AuthContext';
import { AuthField, FormMessage, SubmitButton } from './ui/AuthField';

interface ResetPasswordScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ onNavigate }) => {
  const { resetPassword, resetSendsEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Firebase emails a reset link, so there is no password to collect here.
    if (!resetSendsEmail && newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setBusy(true);
    try {
      setDone(await resetPassword(email.trim(), newPassword));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reset your password');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-full px-6 pt-10 pb-12">
      <div className="mb-8">
        <div className="h-14 w-14 rounded-2xl bg-[#ffdbcc] text-[#9c3f00] flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-3xl">lock_reset</span>
        </div>
        <h1 className="text-2xl font-extrabold text-[#1c1b1b]">Reset your password</h1>
        <p className="text-sm text-[#584238] mt-1">
          {resetSendsEmail
            ? "Enter your email and we'll send you a reset link."
            : 'Enter your email and choose a new password.'}
        </p>
      </div>

      {done ? (
        <div className="space-y-5">
          <FormMessage tone="success">{done}</FormMessage>
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="w-full h-12 rounded-full bg-[#9c3f00] text-white font-bold text-sm active:scale-[0.98] transition-transform"
          >
            Back to sign in
          </button>
        </div>
      ) : (
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

          {!resetSendsEmail && (
            <AuthField
              label="New password"
              type="password"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              required
            />
          )}

          <SubmitButton busy={busy}>
            {busy
              ? resetSendsEmail
                ? 'Sending…'
                : 'Resetting…'
              : resetSendsEmail
                ? 'Send reset link'
                : 'Reset password'}
          </SubmitButton>

          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="w-full text-center text-sm font-bold text-[#9c3f00] py-2 active:opacity-60"
          >
            Back to sign in
          </button>
        </form>
      )}
    </div>
  );
};
