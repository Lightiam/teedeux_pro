import React, { useState } from 'react';
import { ScreenId } from '../types';

interface LocationSelectorScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onSelectAddress: (address: string) => void;
  currentAddress: string;
}

export const LocationSelectorScreen: React.FC<LocationSelectorScreenProps> = ({
  onNavigate,
  onSelectAddress,
  currentAddress,
}) => {
  const [addressInput, setAddressInput] = useState(currentAddress || '');
  const [isLocating, setIsLocating] = useState(false);

  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    setTimeout(() => {
      setIsLocating(false);
      const located = '1234 Westheimer Rd, Houston, TX 77006 (Current)';
      setAddressInput(located);
      onSelectAddress(located);
      onNavigate('stores');
    }, 1000);
  };

  const handleQuickSelect = (addr: string) => {
    onSelectAddress(addr);
    onNavigate('stores');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (addressInput.trim()) {
      onSelectAddress(addressInput);
      onNavigate('stores');
    }
  };

  return (
    <div className="bg-[#fcf9f8] text-[#1c1b1b] min-h-screen flex flex-col font-['Hanken_Grotesk'] overflow-x-hidden relative">
      {/* Animated Stylized Map Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-40 scale-105 transition-transform duration-1000 ease-out bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCuTl7nxBMbTAZCqr84C_j8-GriBKTKEavwJmaIwEJH9fGDe7nFDKbruTq4UBpXRD5oDNmyHCvMXh1zw2T_aAOKKGdV0ChXeuu7suxRYBp1y52MaSkUao7QdHcEavCFzHpD7zLUHRvPDPXCSVmHFxoABDqhNyHWRfjQ9gubzNe7JHng-O-tUSmKpO9q83wd9aVowiAP_QBVaCXSmpXuUdzApn97PCk9xuXx8UtpRCWVKSBX0RKQyXMGKA')",
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#fcf9f8]/40 via-[#fcf9f8]/80 to-[#fcf9f8]"></div>

        {/* Location Ping Pulse */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-32 h-32 bg-[#9c3f00]/20 rounded-full pulse-animation"></div>
            <div className="absolute w-16 h-16 bg-[#9c3f00]/30 rounded-full pulse-animation" style={{ animationDelay: '0.5s' }}></div>
            <div className="w-8 h-8 bg-[#9c3f00] rounded-full shadow-2xl border-2 border-white flex items-center justify-center text-white z-10">
              <span className="material-symbols-outlined text-lg fill-1">location_on</span>
            </div>
          </div>
        </div>
      </div>

      {/* Foreground Content */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center pt-8 px-6 max-w-lg mx-auto w-full">
        {/* Brand Icon & Heading */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-[#c45100] text-white rounded-2xl flex items-center justify-center mb-4 shadow-xl transform rotate-3 hover:rotate-0 transition-transform">
            <span className="material-symbols-outlined text-4xl fill-1">location_on</span>
          </div>
          <h2 className="text-3xl font-extrabold text-[#9c3f00] tracking-tight">
            Where should we deliver?
          </h2>
          <p className="text-sm text-[#584238] max-w-[290px] mt-1.5 leading-relaxed">
            Enter your address to see fresh groceries available in your area.
          </p>
        </div>

        {/* Interaction Form & Quick Options */}
        <div className="w-full space-y-4">
          <form onSubmit={handleSubmit} className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-[#8c7166]">search</span>
            </div>
            <input
              id="location-address-input"
              type="text"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder="Enter delivery address"
              className="w-full pl-12 pr-12 py-4 bg-white border border-stone-200/80 focus:border-[#9c3f00] focus:ring-2 focus:ring-[#9c3f00]/20 transition-all text-base rounded-2xl shadow-lg placeholder:text-stone-400 font-medium outline-none"
            />
            {addressInput && (
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-[#9c3f00] text-white hover:bg-[#c45100]"
              >
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            )}
          </form>

          {/* Current Location Button */}
          <button
            id="use-current-location-btn"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-[#9c3f00] text-white font-extrabold text-base rounded-2xl shadow-xl shadow-[#9c3f00]/20 hover:bg-[#c45100] active:scale-[0.98] transition-all"
          >
            {isLocating ? (
              <>
                <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                <span>Locating GPS...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-xl">my_location</span>
                <span>Use current location</span>
              </>
            )}
          </button>

          {/* Saved Locations */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              id="location-home-btn"
              onClick={() => handleQuickSelect('1234 Westheimer Rd, Houston, TX')}
              className="flex flex-col items-start p-4 bg-white/90 border border-stone-200/60 rounded-2xl hover:bg-stone-50 transition-all text-left shadow-sm group hover:border-[#9c3f00]"
            >
              <span className="material-symbols-outlined text-[#9c3f00] mb-1 group-hover:scale-110 transition-transform">
                home
              </span>
              <span className="font-extrabold text-sm text-[#1c1b1b]">Home</span>
              <span className="font-['JetBrains_Mono'] text-xs text-[#584238] truncate w-full mt-0.5">
                1234 Westheimer Rd...
              </span>
            </button>

            <button
              id="location-work-btn"
              onClick={() => handleQuickSelect('500 Main St, Suite 400, Houston, TX')}
              className="flex flex-col items-start p-4 bg-white/90 border border-stone-200/60 rounded-2xl hover:bg-stone-50 transition-all text-left shadow-sm group hover:border-[#3b6934]"
            >
              <span className="material-symbols-outlined text-[#3b6934] mb-1 group-hover:scale-110 transition-transform">
                work
              </span>
              <span className="font-extrabold text-sm text-[#1c1b1b]">Work (HQ)</span>
              <span className="font-['JetBrains_Mono'] text-xs text-[#584238] truncate w-full mt-0.5">
                500 Main St, Houston
              </span>
            </button>
          </div>
        </div>

        {/* Secondary option */}
        <button
          id="location-browse-areas-btn"
          onClick={() => onNavigate('stores')}
          className="mt-6 text-[#584238] font-['JetBrains_Mono'] text-xs font-semibold flex items-center gap-1.5 hover:text-[#9c3f00] transition-colors py-2 px-4"
        >
          <span>Browse areas instead</span>
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </main>

      {/* Footer Security Note */}
      <footer className="p-6 flex flex-col items-center gap-1.5 z-20">
        <div className="flex items-center gap-1.5 text-xs text-[#584238]/70 font-['JetBrains_Mono']">
          <span className="material-symbols-outlined text-sm">lock</span>
          <span>Your location is encrypted and secure</span>
        </div>
      </footer>
    </div>
  );
};
