import React, { useEffect, useState } from 'react';
import { ScreenId } from '../types';

interface SplashScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onNavigate }) => {
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 25;
      });
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#e36414] overflow-hidden h-screen w-screen flex items-center justify-center relative select-none">
      {/* Background Atmospheric Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.18)_0%,_transparent_70%)]"></div>
        <div
          className="absolute bottom-0 right-0 w-1/2 h-1/2 opacity-25 bg-cover bg-bottom mix-blend-screen pointer-events-none"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB3xqet144XxHqrbon4pB04pdlf4syFALQkX52f9vZum0Cd82TvgTq0pLJBA7MN70YDQ_kEZG2lv_xhl338XQPMZpSL2crAX6ADXRFNg06VhG_7_q2KLRYaZtuC3X4iIXjyParFrpAywjxQ2Hbz12u7AGufIq_lIm2QIGzbxk3BJUiWUUnsaZnPFbCNbWfLCsrfF3dnmYMYoSM936OfQlqueTNq1EPUaXMBLLMVbR3LnmhC5UXGE06JmA')",
          }}
        ></div>
      </div>

      {/* Main Content Container */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 text-center max-w-md">
        <div className="animate-reveal flex flex-col items-center gap-6">
          {/* Logo Mark */}
          <div className="mb-2">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl shadow-black/10 transform hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[48px] text-[#e36414] fill-1">
                shopping_basket
              </span>
            </div>
          </div>

          {/* Wordmark */}
          <h1 className="font-['Hanken_Grotesk'] text-4xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-md">
            Teedeux Mart
          </h1>

          {/* Tagline */}
          <p className="font-['Hanken_Grotesk'] text-lg text-white/95 max-w-xs animate-pulse-slow leading-relaxed">
            Freshness delivered nationwide across the USA. HQ in Houston, TX.
          </p>
        </div>

        {/* Action Button & Progress */}
        <div className="mt-12 w-full flex flex-col items-center gap-4">
          <div className="w-48 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="font-['JetBrains_Mono'] text-xs text-white/80 uppercase tracking-widest font-semibold">
            {progress < 100 ? 'Initializing...' : 'Ready'}
          </span>

          <button
            id="splash-enter-btn"
            onClick={() => onNavigate('onboarding-discover')}
            className="mt-4 px-8 py-3.5 bg-white text-[#9c3f00] font-['Hanken_Grotesk'] text-lg font-bold rounded-full shadow-xl hover:bg-amber-50 active:scale-95 transition-all flex items-center gap-2 group"
          >
            <span>Enter Teedeux Mart</span>
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </button>
        </div>
      </main>

      {/* Decorative Blobs */}
      <div className="absolute -top-12 -right-12 w-64 h-64 opacity-20 rotate-12 pointer-events-none">
        <div className="w-full h-full bg-white rounded-full blur-3xl"></div>
      </div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 opacity-15 pointer-events-none">
        <div className="w-full h-full bg-[#1E3F1B] rounded-full blur-[100px]"></div>
      </div>
    </div>
  );
};
