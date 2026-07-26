import React, { useState } from 'react';
import { ScreenId } from '../types';

interface SignupScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onSignupSuccess?: () => void;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({ onNavigate, onSignupSuccess }) => {
  const [fullName, setFullName] = useState('Marcus Vance');
  const [email, setEmail] = useState('marcus.vance@example.com');
  const [phone, setPhone] = useState('+1 (713) 555-0199');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (onSignupSuccess) onSignupSuccess();
      onNavigate('stores');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-['Hanken_Grotesk'] text-[#1c1b1b] bg-[#fcf9f8] overflow-x-hidden">
      <main className="w-full max-w-7xl mx-auto flex flex-col md:flex-row min-h-screen">
        {/* Left Side: Visual Narrative (Desktop) */}
        <section className="hidden md:flex md:w-1/2 bg-[#F9F4E8] relative overflow-hidden items-center justify-center p-12">
          <div className="relative z-10 space-y-6 max-w-md">
            <header className="mb-8 cursor-pointer" onClick={() => onNavigate('stores')}>
              <h1 className="text-4xl font-extrabold text-[#9c3f00]">Teedeux Mart</h1>
            </header>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl overflow-hidden aspect-square shadow-xl transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                <img
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnR1uTzAj7b9tAiAZOuTm19XAhh_7J0Cnq9O1El4ls5paCd_aFZBZYQEiZ8wd9dKuKYtErTwcwNUMvBpvMsZitffqjKMRrwDTZ8kV6IvcmWox110890p9zpmSftc_6QhUpGJB30cdutx1nKI7m5be8MdAtlG3hLOsuY3MqwnIXH2a8cqusjt6Ufvgoyb6RzNxq9fOTexJ5LvyPRpcW6wkX_i8EcLlQE3mHFEryLDAQOyDIQDP69tXeTw"
                  alt="African produce"
                />
              </div>
              <div className="rounded-2xl overflow-hidden aspect-square shadow-xl transform rotate-3 mt-6 hover:rotate-0 transition-transform duration-500">
                <img
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDa832JfdPCQkXcejjvEMTPTt8FFcQf46DEHb0xXKfBXq8zyVjadmqIxdo_rpwcxY9xBO_tM8C6kXEz3oQ2JjzgkZFKP7DjKPD7vp5qhhD5z2tpvrf7Fv92pFGpgtQHOPSKz3OqXYUgBlcHZAShUYm8dcsxYX3IoVMRMN8m87OfMXb_G7_kJkJqJk_EAqmzPcsqmaEzC-yZ06onZLhH6aWO-XTUGCdsFIepemhQOAIBqTwCJZ3HtPyDA"
                  alt="Grains and spices"
                />
              </div>
            </div>

            <div className="pt-4">
              <h2 className="text-3xl font-extrabold text-[#1c1b1b]">
                Freshness from the soil to your table.
              </h2>
              <p className="text-[#584238] text-base mt-2 leading-relaxed">
                Join the community of urban professionals enjoying authentic ingredients with surgical delivery reliability.
              </p>
            </div>
          </div>

          {/* Floating Badges */}
          <div className="absolute bottom-8 right-8 flex flex-col gap-2 items-end">
            <div className="bg-[#1E3F1B]/10 backdrop-blur-md border border-[#1E3F1B]/20 px-4 py-2 rounded-full flex items-center gap-2 text-[#1E3F1B]">
              <span className="material-symbols-outlined text-lg fill-1">eco</span>
              <span className="font-['JetBrains_Mono'] text-xs font-bold">100% Organic Sourcing</span>
            </div>
            <div className="bg-[#9c3f00]/10 backdrop-blur-md border border-[#9c3f00]/20 px-4 py-2 rounded-full flex items-center gap-2 text-[#9c3f00]">
              <span className="material-symbols-outlined text-lg fill-1">speed</span>
              <span className="font-['JetBrains_Mono'] text-xs font-bold">Express Delivery</span>
            </div>
          </div>
        </section>

        {/* Right Side: Signup Form */}
        <section className="w-full md:w-1/2 bg-[#fcf9f8] flex flex-col justify-center px-6 sm:px-12 py-10">
          {/* Mobile Header */}
          <header className="md:hidden flex items-center gap-2 mb-6 cursor-pointer" onClick={() => onNavigate('stores')}>
            <span className="material-symbols-outlined text-[#9c3f00] text-3xl fill-1">shopping_basket</span>
            <h1 className="text-2xl font-extrabold text-[#9c3f00]">Teedeux Mart</h1>
          </header>

          <div className="max-w-md w-full mx-auto space-y-6">
            <div>
              <h2 className="text-3xl font-extrabold text-[#1c1b1b]">Create an Account</h2>
              <p className="text-[#584238] text-sm mt-1">Start your fresh food journey today.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="font-['JetBrains_Mono'] text-xs font-medium text-[#584238]">
                  Full Name
                </label>
                <input
                  id="signup-fullname-input"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Kofi Mensah"
                  className="w-full py-3 px-3 bg-[#F9F4E8] border-b-2 border-[#e0c0b2] focus:border-[#9c3f00] outline-none transition-all font-medium text-sm rounded-t-lg"
                />
              </div>

              <div className="space-y-1">
                <label className="font-['JetBrains_Mono'] text-xs font-medium text-[#584238]">
                  Email Address
                </label>
                <input
                  id="signup-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kofi.m@example.com"
                  className="w-full py-3 px-3 bg-[#F9F4E8] border-b-2 border-[#e0c0b2] focus:border-[#9c3f00] outline-none transition-all font-medium text-sm rounded-t-lg"
                />
              </div>

              <div className="space-y-1">
                <label className="font-['JetBrains_Mono'] text-xs font-medium text-[#584238]">
                  Phone Number
                </label>
                <input
                  id="signup-phone-input"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+233 00 000 0000"
                  className="w-full py-3 px-3 bg-[#F9F4E8] border-b-2 border-[#e0c0b2] focus:border-[#9c3f00] outline-none transition-all font-medium text-sm rounded-t-lg"
                />
              </div>

              <div className="space-y-1">
                <label className="font-['JetBrains_Mono'] text-xs font-medium text-[#584238]">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="signup-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full py-3 px-3 pr-10 bg-[#F9F4E8] border-b-2 border-[#e0c0b2] focus:border-[#9c3f00] outline-none transition-all font-medium text-sm rounded-t-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#584238] hover:text-[#9c3f00]"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <button
                id="signup-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#9c3f00] text-white py-4 rounded-xl font-bold text-base hover:bg-[#c45100] active:scale-95 transition-all shadow-xl shadow-[#9c3f00]/20 flex justify-center items-center gap-2 mt-4"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-stone-200"></div>
              <span className="flex-shrink mx-4 font-['JetBrains_Mono'] text-[11px] text-[#584238] uppercase tracking-wider">
                Or sign up with
              </span>
              <div className="flex-grow border-t border-stone-200"></div>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleSubmit}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 transition-colors active:scale-95"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                <span className="font-['JetBrains_Mono'] text-xs font-semibold">Google</span>
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 transition-colors active:scale-95"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.96 0-2.04-.6-3.23-.6-1.2 0-2.32.61-3.22.61-1.47 0-3.32-1.85-4.24-3.52-1.86-3.36-1.41-6.85.12-8.58 1.13-1.29 2.58-2.05 4.02-2.05 1.2 0 2.22.67 3.23.67 1.01 0 2.05-.67 3.25-.67 1.11 0 2.37.5 3.35 1.76-2.62 1.4-2.18 4.74.45 5.92-.88 2.02-2.13 4.46-3.73 4.46zm-2.85-16.14c1.11-1.33 1.07-2.92.97-3.64-.13.04-1.84.44-2.96 1.77-1.12 1.33-1.07 2.92-.97 3.64.13-.04 1.84-.44 2.96-1.77z"></path>
                </svg>
                <span className="font-['JetBrains_Mono'] text-xs font-semibold">Apple</span>
              </button>
            </div>

            {/* Already have account */}
            <p className="text-center text-sm text-[#584238]">
              Already have an account?{' '}
              <button
                id="signup-to-login-btn"
                type="button"
                onClick={() => onNavigate('login')}
                className="text-[#9c3f00] font-bold hover:underline"
              >
                Login
              </button>
            </p>

            {/* Footer security */}
            <footer className="pt-6 flex justify-center gap-6 border-t border-stone-200 text-xs text-[#584238]/70 font-['JetBrains_Mono']">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">verified_user</span>
                <span>Secure Checkout</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">lock</span>
                <span>Data Encrypted</span>
              </div>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
};
