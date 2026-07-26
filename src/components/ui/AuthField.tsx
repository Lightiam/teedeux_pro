import React, { useId, useState } from 'react';

interface AuthFieldProps {
  label: string;
  type?: 'text' | 'email' | 'password' | 'tel';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  hint?: string;
}

/** Labelled input used across the auth screens, with a reveal toggle for passwords. */
export const AuthField: React.FC<AuthFieldProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  hint,
}) => {
  const id = useId();
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && revealed ? 'text' : type;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-bold text-[#584238]">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className={`w-full h-12 px-4 ${
            isPassword ? 'pr-12' : ''
          } bg-white rounded-2xl border border-stone-200 text-sm text-[#1c1b1b] outline-none focus:border-[#9c3f00] focus:ring-2 focus:ring-[#9c3f00]/15 transition-all placeholder:text-stone-400`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            aria-label={revealed ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full text-[#584238] flex items-center justify-center active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined text-lg">
              {revealed ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        )}
      </div>

      {hint && <p className="text-[11px] text-stone-500 px-1">{hint}</p>}
    </div>
  );
};

/** Inline form-level message. */
export const FormMessage: React.FC<{ tone: 'error' | 'success'; children: React.ReactNode }> = ({
  tone,
  children,
}) => (
  <div
    role={tone === 'error' ? 'alert' : 'status'}
    className={`flex items-start gap-2 rounded-2xl px-3 py-2.5 text-xs font-semibold ${
      tone === 'error'
        ? 'bg-[#ffdad6] text-[#93000a]'
        : 'bg-[#b9eeab]/40 text-[#23501e]'
    }`}
  >
    <span className="material-symbols-outlined text-base shrink-0">
      {tone === 'error' ? 'error' : 'check_circle'}
    </span>
    <span>{children}</span>
  </div>
);

/** Primary submit button with a busy state. */
export const SubmitButton: React.FC<{ busy: boolean; children: React.ReactNode }> = ({
  busy,
  children,
}) => (
  <button
    type="submit"
    disabled={busy}
    className="w-full h-12 rounded-full bg-[#9c3f00] text-white font-bold text-sm active:scale-[0.98] transition-transform disabled:opacity-60 disabled:active:scale-100 flex items-center justify-center gap-2"
  >
    {busy && (
      <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
    )}
    {children}
  </button>
);
