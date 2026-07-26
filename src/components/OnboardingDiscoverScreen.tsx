import React from 'react';
import { ScreenId } from '../types';

interface OnboardingDiscoverScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const OnboardingDiscoverScreen: React.FC<OnboardingDiscoverScreenProps> = ({ onNavigate }) => {
  return (
    <div className="bg-[#fcf9f8] text-[#1c1b1b] min-h-screen flex flex-col font-['Hanken_Grotesk'] overflow-x-hidden relative selection:bg-[#9c3f00] selection:text-white">
      {/* Top Header */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#9c3f00] fill-1 text-3xl">shopping_basket</span>
          <span className="font-extrabold text-xl text-[#9c3f00] tracking-tight">Teedeux Mart</span>
        </div>
        <button
          id="discover-skip-btn"
          onClick={() => onNavigate('stores')}
          className="text-[#584238] font-['JetBrains_Mono'] text-sm hover:text-[#9c3f00] transition-colors active:scale-95 py-2 px-4 rounded-full hover:bg-stone-200/50"
        >
          Skip
        </button>
      </header>

      <main className="flex-grow flex flex-col relative pt-16">
        {/* Hero Section */}
        <div className="relative w-full h-[460px] sm:h-[540px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDG1xZT0neT4GuEQdRW4KmOoVq4vcOzxdayO7NQdzdxVBHyItU0tZqiXOFr6_l4JdlKWTxx3tWP_vMgcfKXkAGOr57V1eB0RrtKhTPI2Z5B3tX8tQSZDo9ZDYLSFS7llSv-AWVLEvS_U5UiKActJN1psXNoM5eei_qJ4kskCyxss3TNbbQmWZFkY11WowU6u4_oN5DxjXYz6KpbrYGE1PZKf2oKtdsGm1XoklnVngmxfuNI7YRMlQnCiA"
              alt="Fresh African produce plantains yams chili peppers"
            />
            {/* Soft gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#fcf9f8]/0 via-[#fcf9f8]/40 to-[#fcf9f8]"></div>
          </div>

          {/* Floating Eco Leaf badge */}
          <div className="z-10 floating-produce flex items-center justify-center p-3.5 bg-white rounded-full shadow-2xl border border-stone-200/60 mt-12">
            <span className="material-symbols-outlined text-[#9c3f00] text-3xl">eco</span>
          </div>
        </div>

        {/* Content Card Section */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 -mt-16 sm:-mt-24 max-w-xl mx-auto w-full">
          <div className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-xl border border-stone-200/40 w-full">
            <p className="font-['JetBrains_Mono'] text-xs font-semibold uppercase tracking-widest text-[#9c3f00] mb-3">
              US Nationwide Delivery • HQ in Houston, TX
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1c1b1b] leading-tight">
              Authentic Foods <span className="text-[#9c3f00]">Delivered Nationwide</span>
            </h1>
            <p className="text-[#584238] text-base sm:text-lg mt-3 leading-relaxed">
              Explore authentic specialty groceries and fresh produce delivered straight to your door across all 50 US States from our Houston headquarters.
            </p>
          </div>

          {/* Progress Indicator & CTA */}
          <div className="mt-8 w-full flex flex-col items-center gap-6 pb-12">
            {/* Dots */}
            <div className="flex gap-2">
              <div className="h-2.5 w-8 rounded-full bg-[#9c3f00] transition-all"></div>
              <div
                onClick={() => onNavigate('onboarding-schedule')}
                className="h-2.5 w-2.5 rounded-full bg-stone-300 hover:bg-[#9c3f00]/60 cursor-pointer transition-colors"
              ></div>
              <div
                onClick={() => onNavigate('location')}
                className="h-2.5 w-2.5 rounded-full bg-stone-300 hover:bg-[#9c3f00]/60 cursor-pointer transition-colors"
              ></div>
            </div>

            {/* Next Button */}
            <button
              id="discover-next-btn"
              onClick={() => onNavigate('onboarding-schedule')}
              className="w-full max-w-md bg-[#9c3f00] text-white py-4 px-8 rounded-xl font-extrabold text-lg shadow-xl shadow-[#9c3f00]/20 hover:bg-[#c45100] active:scale-95 transition-all flex justify-center items-center gap-2 group"
            >
              <span>Next</span>
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
