import React, { useState } from 'react';
import { ScreenId } from '../types';

interface ResetPasswordScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
    }, 1200);
  };

  return (
    <div className="bg-[#fcf9f8] text-[#1c1b1b] min-h-screen flex flex-col font-['Hanken_Grotesk'] animate-pulse-subtle">
      {/* Top Header */}
      <header className="w-full top-0 sticky z-30 bg-[#fcf9f8]/80 backdrop-blur-md border-b border-stone-200/50">
        <div className="flex justify-between items-center px-6 py-4 w-full max-w-7xl mx-auto">
          <button
            id="reset-back-btn"
            onClick={() => onNavigate('login')}
            className="flex items-center gap-2 text-[#9c3f00] hover:opacity-80 transition-opacity active:scale-95"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider hidden sm:inline">
              Back
            </span>
          </button>
          <div
            className="font-extrabold text-xl text-[#9c3f00] tracking-tight cursor-pointer"
            onClick={() => onNavigate('stores')}
          >
            Teedeux Mart
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md flex flex-col gap-6">
          {/* Icon Badge */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-[#ffdbcc] flex items-center justify-center text-[#c45100] shadow-md border border-[#e0c0b2]/40">
              <span className="material-symbols-outlined text-4xl">lock_reset</span>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center flex flex-col gap-2">
            <h1 className="text-3xl font-extrabold text-[#1c1b1b]">Reset Password</h1>
            <p className="text-sm text-[#584238] max-w-xs mx-auto leading-relaxed">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-stone-200/60 flex flex-col gap-6">
            {isSent ? (
              <div className="p-6 bg-[#b9eeab]/40 border border-[#3b6934]/30 rounded-2xl text-center space-y-3">
                <div className="w-12 h-12 bg-[#3b6934] text-white rounded-full mx-auto flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">check_circle</span>
                </div>
                <h3 className="font-bold text-lg text-[#1E3F1B]">Reset Link Sent!</h3>
                <p className="text-xs text-[#584238]">
                  We've sent password reset instructions to <strong className="text-[#1c1b1b]">{email}</strong>.
                </p>
                <button
                  id="reset-back-to-login-btn"
                  onClick={() => onNavigate('login')}
                  className="mt-2 w-full py-3 bg-[#9c3f00] text-white font-bold text-sm rounded-xl hover:bg-[#c45100]"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="font-['JetBrains_Mono'] text-xs font-semibold text-[#584238] px-1">
                    Email Address
                  </label>
                  <div className="relative bg-[#F9F4E8]/60 rounded-xl transition-all focus-within:ring-2 focus-within:ring-[#9c3f00]">
                    <div className="flex items-center px-4 py-3.5 border-b-2 border-[#8c7166]/20">
                      <span className="material-symbols-outlined text-[#584238] mr-3">mail</span>
                      <input
                        id="reset-email-input"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="bg-transparent border-none outline-none focus:ring-0 w-full text-sm text-[#1c1b1b] placeholder:text-[#8c7166]"
                      />
                    </div>
                  </div>
                </div>

                <button
                  id="send-reset-link-btn"
                  type="submit"
                  disabled={isSending}
                  className="w-full bg-[#9c3f00] py-4 px-6 rounded-xl text-white font-extrabold text-base hover:bg-[#c45100] active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {isSending ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                      <span>Sending Link...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <span className="material-symbols-outlined text-lg">send</span>
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <p className="text-sm text-[#584238]">
                    Remember your password?{' '}
                    <button
                      type="button"
                      onClick={() => onNavigate('login')}
                      className="text-[#9c3f00] font-bold hover:underline"
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              </form>
            )}
          </div>

          {/* Contact Support */}
          <div className="flex flex-col items-center gap-2">
            <div className="h-px w-12 bg-stone-300"></div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert('Support channel opened. Email support@teedeuxmart.com or call +233 20 000 0000');
              }}
              className="flex items-center gap-2 text-[#584238] hover:text-[#9c3f00] transition-colors font-['JetBrains_Mono'] text-xs font-medium"
            >
              <span className="material-symbols-outlined text-base">help_center</span>
              <span>Contact Support</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};
