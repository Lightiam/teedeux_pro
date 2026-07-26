import React from 'react';
import { ScreenId } from '../types';

interface OnboardingScheduleScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const OnboardingScheduleScreen: React.FC<OnboardingScheduleScreenProps> = ({ onNavigate }) => {
  return (
    <div className="bg-[#fcf9f8] text-[#1c1b1b] min-h-screen flex flex-col font-['Hanken_Grotesk'] overflow-x-hidden relative selection:bg-[#9c3f00] selection:text-white">
      {/* Top Header */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('stores')}>
          <span className="material-symbols-outlined text-[#9c3f00] fill-1 text-3xl">location_on</span>
          <span className="font-extrabold text-xl text-[#9c3f00] tracking-tight">Teedeux Mart</span>
        </div>
        <button
          id="schedule-skip-btn"
          onClick={() => onNavigate('location')}
          className="text-[#584238] font-['JetBrains_Mono'] text-sm hover:text-[#9c3f00] transition-colors active:scale-95 py-2 px-4 rounded-full hover:bg-stone-200/50"
        >
          Skip
        </button>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-6 py-12 max-w-lg mx-auto w-full relative pt-20">
        {/* Hero Image Section */}
        <div className="w-full relative mb-10">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#ffdbcc] opacity-40 rounded-full blur-3xl"></div>

          <div className="relative z-10 w-full aspect-square sm:aspect-video rounded-3xl overflow-hidden shadow-2xl border border-stone-200/40 floating-produce bg-[#F9F4E8]">
            <img
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7mktRaB2FMJErgQH0GwwHGXguXl-VTxWG20UxTPr_8e6RjRl6R0kmH-E7NwsolKcmSJxXlMIbF48CmG1zukC7sgs9xXviYF8byNRSZiDDca3ThcNGI3v53FHcIdzK7sTdbyrGDAmOLrL1vh3MdrDwf6wktU1Geng6eAPABu2T-Kwhnmti3tSS9hH1bHZg80y76Zw86vk6waE6U74hu6QjCIC0OfIEFp-YHyRA5YUFWXK2FXkDwM6SEQ"
              alt="Electric delivery driver with fresh produce"
            />

            {/* Overlay Card */}
            <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-white/60 flex items-center gap-4 shadow-xl">
              <div className="w-12 h-12 bg-[#b9eeab] rounded-full flex items-center justify-center text-[#3f6d38] shrink-0">
                <span className="material-symbols-outlined text-2xl">schedule</span>
              </div>
              <div>
                <p className="font-['JetBrains_Mono'] text-[11px] font-semibold text-[#584238] uppercase tracking-wider">
                  EARLIEST SLOT
                </p>
                <p className="font-['Hanken_Grotesk'] text-xl font-extrabold text-[#1E3F1B]">
                  Today, 2:00 PM
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="text-center w-full space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1c1b1b]">
            Convenience on Your Schedule
          </h1>
          <p className="text-[#584238] text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            Choose delivery windows that work for you, 7 days a week. From dawn till dusk, we're here for you.
          </p>
        </div>

        {/* Action & Indicators */}
        <div className="mt-10 w-full space-y-6">
          {/* Progress Dots */}
          <div className="flex justify-center gap-2">
            <div
              onClick={() => onNavigate('onboarding-discover')}
              className="w-2.5 h-2.5 rounded-full bg-stone-300 hover:bg-[#9c3f00] cursor-pointer"
            ></div>
            <div className="w-8 h-2.5 rounded-full bg-[#9c3f00]"></div>
            <div
              onClick={() => onNavigate('location')}
              className="w-2.5 h-2.5 rounded-full bg-stone-300 hover:bg-[#9c3f00] cursor-pointer"
            ></div>
          </div>

          {/* Main Button */}
          <div className="flex flex-col gap-3">
            <button
              id="schedule-get-started-btn"
              onClick={() => onNavigate('location')}
              className="w-full py-4 bg-[#9c3f00] text-white font-extrabold text-lg rounded-xl shadow-xl shadow-[#9c3f00]/20 hover:bg-[#c45100] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
            >
              <span>Get Started</span>
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>

            <p className="text-center font-['JetBrains_Mono'] text-xs text-[#584238] font-medium">
              Reliable delivery to <span className="text-[#9c3f00] font-bold">All 50 US States</span> • Same-Day in Greater Houston, TX
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
