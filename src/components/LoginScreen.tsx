import React, { useState } from 'react';
import { ScreenId } from '../types';

interface LoginScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onLoginSuccess?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate, onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('hello@example.com');
  const [password, setPassword] = useState('••••••••');
  const [fullName, setFullName] = useState('Adebayo Mensah');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (onLoginSuccess) onLoginSuccess();
      onNavigate('stores');
    }, 800);
  };

  return (
    <div className="bg-[#fcf9f8] text-[#1c1b1b] min-h-screen flex flex-col items-center justify-center relative overflow-hidden font-['Hanken_Grotesk']">
      {/* Ambient background glows */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-[#9c3f00] rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[500px] h-[500px] bg-[#3b6934] rounded-full blur-[120px]"></div>
      </div>

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-7xl px-4 sm:px-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center min-h-screen py-10">
        {/* Left Visual Column (Desktop Only) */}
        <div className="hidden md:flex md:col-span-6 flex-col justify-center gap-6 pr-8">
          <div className="relative w-full aspect-square max-w-[480px] mx-auto rounded-3xl overflow-hidden shadow-2xl group">
            <img
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC24FJA3F1AylxDu1rlTy0oy43CogTKdxEBNAQNfVqp0pbiiEzwIZGQMbeyZsptzKjhOo4V38CGVApZCgAyogsjtrSUl5_3BmSbLF3cE43_D-c3ysw3knVvojnKvO8rXI2bYriT-5Qka76PboerVmVWjPZtXZwOs6hDewLdCESiYcyL46pV1048dlM26Fuwoe--GNLMHL4KMT0r4BFMnoYMK6ruNDT_g5B2dXPIv7PGFE_mAdnMTg1UdQ"
              alt="Fresh African produce editorial"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <h2 className="text-3xl font-extrabold mb-2 leading-snug">
                Authentic Flavors, Modern Ease.
              </h2>
              <p className="text-white/90 text-base leading-relaxed">
                Join the community of food lovers sourcing the freshest ingredients from across the continent.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center">
            <div className="flex -space-x-3">
              <img
                className="w-10 h-10 rounded-full border-2 border-white object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtzhubgdpHRju3ed5lQXfrBUG7NeiieV2jlfRSKuRlqSVUKhlqZJQBEj4FWoIcYF-UNM6hbX1MrK6LTz-ZIM2n9YBHGFXjtlkcSbXDaKITAkzdeJLA2Ia3A6UFTKbTHF5oqn_0Iu_tcHFH-Aj6v3EnSSboocauL-neo0blnlmQp_UOM55GHuuyYKnL90gD0Of8lh1FOigr1Pwc8PjqZ1Qf_69Jofi_Zibhq7AVBo4jVf8S8emY3_JsXg"
                alt="Satisfied user"
              />
              <img
                className="w-10 h-10 rounded-full border-2 border-white object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGGIlnUs7TM4C7HPj7ISS3Ws-7hsSTGNRJdkLejot52xMAhxSCa1KMF4cpO141BH7geMjHWc3nPL68ltDkjtkQEG_-kFluuHks9LUEo2BWYitZ0j7s8ghDzY36reA6p5bV22Tx0Zf2ehuABdwwcraUp2YvdQRwdIFQGrcT-2gQViA6qzHziR4QAHF1zkJq6MmgxH384jHdUjUr96c4reGXTQWmYEj1cCjPxeZq_Fbn8SM66UOV7UAPoA"
                alt="Chef user"
              />
              <div className="w-10 h-10 rounded-full border-2 border-white bg-[#3b6934] flex items-center justify-center text-white text-xs font-bold">
                +10k
              </div>
            </div>
            <p className="text-[#584238] font-['JetBrains_Mono'] text-xs font-medium">
              Join over 10,000+ satisfied foodies
            </p>
          </div>
        </div>

        {/* Right Content Column (Auth Card) */}
        <div className="md:col-span-6 lg:col-span-5 lg:col-start-8 flex flex-col w-full max-w-md mx-auto">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-2">
            <div
              className="flex items-center gap-2 mb-1 cursor-pointer"
              onClick={() => onNavigate('stores')}
            >
              <span className="material-symbols-outlined text-[#9c3f00] text-3xl fill-1">local_mall</span>
              <h1 className="text-2xl font-extrabold text-[#9c3f00] tracking-tight">Teedeux Mart</h1>
            </div>
            <h2 className="text-3xl font-extrabold text-[#1c1b1b] leading-tight">
              {activeTab === 'login' ? 'Welcome back' : 'Join Teedeux'}
            </h2>
            <p className="text-[#584238] text-base">
              {activeTab === 'login'
                ? 'Access your pantry and track your fresh deliveries.'
                : 'Start your journey to better, fresher living today.'}
            </p>
          </div>

          {/* Card Form */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-stone-200/50">
            {/* Toggle Switch */}
            <div className="bg-stone-100 p-1.5 rounded-xl flex mb-6">
              <button
                id="tab-login-btn"
                type="button"
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all duration-300 ${
                  activeTab === 'login'
                    ? 'bg-white shadow-md text-[#9c3f00]'
                    : 'text-[#584238] hover:text-[#1c1b1b]'
                }`}
              >
                Login
              </button>
              <button
                id="tab-signup-btn"
                type="button"
                onClick={() => setActiveTab('signup')}
                className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all duration-300 ${
                  activeTab === 'signup'
                    ? 'bg-white shadow-md text-[#9c3f00]'
                    : 'text-[#584238] hover:text-[#1c1b1b]'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {activeTab === 'signup' && (
                <div className="flex flex-col gap-1.5">
                  <label className="font-['JetBrains_Mono'] text-xs font-semibold text-[#584238] pl-1">
                    Full Name
                  </label>
                  <div className="bg-stone-100 p-3.5 rounded-xl flex items-center gap-3 focus-within:ring-2 focus-within:ring-[#9c3f00] border border-transparent transition-all">
                    <span className="material-symbols-outlined text-[#8c7166]">person</span>
                    <input
                      id="login-fullname-input"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Adebayo Mensah"
                      className="bg-transparent w-full outline-none text-[#1c1b1b] placeholder:text-stone-400 text-sm font-medium"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="font-['JetBrains_Mono'] text-xs font-semibold text-[#584238] pl-1">
                  Email Address
                </label>
                <div className="bg-stone-100 p-3.5 rounded-xl flex items-center gap-3 focus-within:ring-2 focus-within:ring-[#9c3f00] border border-transparent transition-all">
                  <span className="material-symbols-outlined text-[#8c7166]">mail</span>
                  <input
                    id="login-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hello@example.com"
                    className="bg-transparent w-full outline-none text-[#1c1b1b] placeholder:text-stone-400 text-sm font-medium"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-['JetBrains_Mono'] text-xs font-semibold text-[#584238] pl-1">
                    Password
                  </label>
                  {activeTab === 'login' && (
                    <button
                      id="forgot-password-link"
                      type="button"
                      onClick={() => onNavigate('reset-password')}
                      className="font-['JetBrains_Mono'] text-xs text-[#9c3f00] hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="bg-stone-100 p-3.5 rounded-xl flex items-center gap-3 focus-within:ring-2 focus-within:ring-[#9c3f00] border border-transparent transition-all">
                  <span className="material-symbols-outlined text-[#8c7166]">lock</span>
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-transparent w-full outline-none text-[#1c1b1b] placeholder:text-stone-400 text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="material-symbols-outlined text-[#8c7166] hover:text-[#9c3f00] transition-colors"
                  >
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                id="login-submit-btn"
                type="submit"
                disabled={isLoading}
                className="bg-[#9c3f00] text-white font-extrabold text-base py-4 rounded-xl shadow-xl hover:bg-[#c45100] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>{activeTab === 'login' ? 'Sign In' : 'Create Account'}</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-2">
                <div className="h-px bg-stone-200 flex-1"></div>
                <span className="font-['JetBrains_Mono'] text-[11px] text-[#8c7166] uppercase tracking-widest">
                  Or continue with
                </span>
                <div className="h-px bg-stone-200 flex-1"></div>
              </div>

              {/* Social Logins */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  id="google-login-btn"
                  type="button"
                  onClick={handleSubmit}
                  className="flex items-center justify-center gap-2 py-3 px-4 border border-stone-200 rounded-xl hover:bg-stone-50 active:scale-95 transition-all"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                  </svg>
                  <span className="font-['JetBrains_Mono'] text-xs font-semibold text-[#1c1b1b]">Google</span>
                </button>

                <button
                  id="apple-login-btn"
                  type="button"
                  onClick={handleSubmit}
                  className="flex items-center justify-center gap-2 py-3 px-4 border border-stone-200 rounded-xl hover:bg-stone-50 active:scale-95 transition-all"
                >
                  <svg className="w-5 h-5 fill-current text-[#1c1b1b]" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.96.95-2.18 1.78-3.46 1.78-.96 0-1.87-.33-2.67-.33-.8 0-1.74.33-2.6.33-1.43 0-2.82-.93-3.93-2.03-2.3-2.28-3.32-6.52-1.76-9.15.77-1.32 2.14-2.13 3.44-2.13 1.08 0 2.02.43 2.7.43.68 0 1.75-.43 2.87-.43 1.16 0 2.5.5 3.36 1.5-2.45 1.04-2.03 4.67.43 5.75-.4 1.12-1.12 2.5-1.88 3.28M12.03 7.25c-.24-2.24 1.84-4.22 4.08-4.25.3 2.45-2.04 4.54-4.08 4.25"></path>
                  </svg>
                  <span className="font-['JetBrains_Mono'] text-xs font-semibold text-[#1c1b1b]">Apple</span>
                </button>
              </div>
            </form>

            <p className="text-center text-[11px] text-[#584238] mt-4 leading-relaxed">
              By continuing, you agree to Teedeux's{' '}
              <a href="#" className="text-[#9c3f00] hover:underline font-semibold">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-[#9c3f00] hover:underline font-semibold">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </main>

      {/* Floating Toast Mock */}
      <div
        id="delivery-toast"
        className="fixed bottom-6 right-6 hidden sm:flex items-center gap-3 bg-[#3b6934] text-white p-4 rounded-2xl shadow-2xl z-50 transform hover:scale-105 transition-all"
      >
        <span className="material-symbols-outlined text-2xl">local_shipping</span>
        <div className="flex flex-col">
          <span className="font-['JetBrains_Mono'] text-xs font-bold">Houston HQ Delivery Hub</span>
          <span className="font-['JetBrains_Mono'] text-[11px] text-white/80">Houston Local: 30-45 mins • US Nationwide 2-Day</span>
        </div>
      </div>
    </div>
  );
};
