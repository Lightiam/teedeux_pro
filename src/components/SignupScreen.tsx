import React, { useState } from 'react';
import { ScreenId } from '../types';
import { useAuth } from '../context/AuthContext';
import { AuthField, FormMessage, SubmitButton } from './ui/AuthField';

interface SignupScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({ onNavigate }) => {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Checked here as well as server-side so the field can fail fast.
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setBusy(true);
    try {
      await signup(name.trim(), email.trim(), password, phone.trim() || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create your account');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-full px-6 pt-10 pb-12">
      <div className="mb-8">
        <div className="h-14 w-14 rounded-2xl bg-[#9c3f00] text-white flex items-center justify-center font-extrabold text-2xl mb-4">
          T
        </div>
        <h1 className="text-2xl font-extrabold text-[#1c1b1b]">Create your account</h1>
        <p className="text-sm text-[#584238] mt-1">
          Authentic African groceries, delivered nationwide.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <FormMessage tone="error">{error}</FormMessage>}

        <AuthField
          label="Full name"
          value={name}
          onChange={setName}
          placeholder="Your name"
          autoComplete="name"
          required
        />

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
          label="Phone"
          type="tel"
          value={phone}
          onChange={setPhone}
          placeholder="Optional"
          autoComplete="tel"
        />

        <AuthField
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="At least 8 characters"
          autoComplete="new-password"
          required
          hint="Use 8 characters or more."
        />

        <SubmitButton busy={busy}>{busy ? 'Creating account…' : 'Create account'}</SubmitButton>
      </form>

      <p className="text-center text-sm text-[#584238] mt-6">
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => onNavigate('login')}
          className="font-bold text-[#9c3f00] active:opacity-60"
        >
          Sign in
        </button>
      </p>
    </div>
  );
};
