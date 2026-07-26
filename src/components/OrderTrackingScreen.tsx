import React, { useState, useEffect } from 'react';
import { ScreenId } from '../types';

interface OrderTrackingScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const OrderTrackingScreen: React.FC<OrderTrackingScreenProps> = ({ onNavigate }) => {
  const [courierPos, setCourierPos] = useState({ x: 35, y: 40 });
  const [activeStep, setActiveStep] = useState(3);
  const [minutesLeft, setMinutesLeft] = useState(18);

  // Smooth courier moped movement animation along simulated map route
  useEffect(() => {
    const interval = setInterval(() => {
      setCourierPos((prev) => {
        const nextX = prev.x + 0.8;
        const nextY = prev.y + 0.4;
        if (nextX > 75) {
          return { x: 35, y: 40 };
        }
        return { x: nextX, y: nextY };
      });

      setMinutesLeft((prev) => (prev > 1 ? prev - 1 : 18));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#fcf9f8] text-[#1c1b1b] min-h-screen pb-28 font-['Hanken_Grotesk']">
      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Header Order Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-3xl border border-stone-200/60 shadow-sm gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#9c3f00] fill-1">local_shipping</span>
              <h1 className="text-2xl font-extrabold text-[#1c1b1b]">Order #TDX-8849</h1>
            </div>
            <p className="font-['JetBrains_Mono'] text-xs text-[#584238] mt-1">
              From: <strong className="text-[#9c3f00]">Teeduex Market (Houston Hub)</strong> • Delivered to: 1234 Westheimer Rd, Houston, TX
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-[#b9eeab] text-[#1E3F1B] px-4 py-1.5 rounded-full font-['JetBrains_Mono'] text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#1E3F1B] animate-ping"></span>
              In Transit
            </span>
            <button
              onClick={() => onNavigate('transactions')}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-[#584238] font-bold text-xs rounded-xl"
            >
              View Receipt
            </button>
          </div>
        </div>

        {/* Map View & Live ETA Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Map Column */}
          <div className="lg:col-span-7 bg-stone-200 h-[380px] sm:h-[420px] rounded-3xl overflow-hidden relative shadow-inner border border-stone-300">
            {/* Map Canvas Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-85"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCuTl7nxBMbTAZCqr84C_j8-GriBKTKEavwJmaIwEJH9fGDe7nFDKbruTq4UBpXRD5oDNmyHCvMXh1zw2T_aAOKKGdV0ChXeuu7suxRYBp1y52MaSkUao7QdHcEavCFzHpD7zLUHRvPDPXCSVmHFxoABDqhNyHWRfjQ9gubzNe7JHng-O-tUSmKpO9q83wd9aVowiAP_QBVaCXSmpXuUdzApn97PCk9xuXx8UtpRCWVKSBX0RKQyXMGKA')",
              }}
            ></div>

            {/* SVG Animated Route Line */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <path
                d="M 120 100 Q 220 180 400 280"
                fill="none"
                stroke="#9c3f00"
                strokeWidth="5"
                strokeDasharray="8 8"
                className="dash-move"
              />
            </svg>

            {/* Store Location Pin */}
            <div className="absolute top-[80px] left-[100px] z-10 flex flex-col items-center">
              <div className="bg-white text-[#9c3f00] p-2 rounded-full shadow-xl border-2 border-[#9c3f00] flex items-center justify-center">
                <span className="material-symbols-outlined text-lg fill-1">storefront</span>
              </div>
              <span className="bg-white/90 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-[#1c1b1b] shadow mt-1">
                Mama Jones
              </span>
            </div>

            {/* Moving Courier Pin (Van) */}
            <div
              className="absolute z-20 flex flex-col items-center transition-all duration-1000 ease-linear"
              style={{ left: `${courierPos.x}%`, top: `${courierPos.y}%` }}
            >
              <div className="bg-[#9c3f00] text-white p-2.5 rounded-full shadow-2xl border-2 border-white flex items-center justify-center animate-bounce">
                <span className="material-symbols-outlined text-xl">directions_car</span>
              </div>
              <span className="bg-[#1E3F1B] text-white px-2 py-0.5 rounded-full font-['JetBrains_Mono'] text-[10px] font-bold shadow mt-1">
                Marcus (Express)
              </span>
            </div>

            {/* Destination Pin */}
            <div className="absolute bottom-[100px] right-[100px] z-10 flex flex-col items-center">
              <div className="bg-[#1E3F1B] text-white p-2 rounded-full shadow-xl border-2 border-white flex items-center justify-center">
                <span className="material-symbols-outlined text-lg fill-1">home</span>
              </div>
              <span className="bg-white/90 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-[#1c1b1b] shadow mt-1">
                Westheimer Rd
              </span>
            </div>

            {/* Live ETA Card Overlay */}
            <div className="absolute top-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/60 flex items-center justify-between">
              <div>
                <p className="font-['JetBrains_Mono'] text-[10px] font-bold text-[#584238] uppercase">
                  Estimated Arrival
                </p>
                <h3 className="font-extrabold text-2xl text-[#9c3f00] font-['Hanken_Grotesk']">
                  {minutesLeft} mins
                </h3>
              </div>
              <div className="text-right">
                <p className="font-['JetBrains_Mono'] text-xs text-[#1E3F1B] font-bold">
                  On Time (2:45 PM)
                </p>
                <p className="text-[11px] text-[#584238]">Distance: 2.4 km remaining</p>
              </div>
            </div>
          </div>

          {/* Courier Info & Status Column */}
          <div className="lg:col-span-5 space-y-4">
            {/* Courier Driver Card */}
            <div className="bg-white p-5 rounded-3xl border border-stone-200/60 shadow-sm space-y-4">
              <div className="flex items-center gap-4">
                <img
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#9c3f00] p-0.5 shadow-md"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGGIlnUs7TM4C7HPj7ISS3Ws-7hsSTGNRJdkLejot52xMAhxSCa1KMF4cpO141BH7geMjHWc3nPL68ltDkjtkQEG_-kFluuHks9LUEo2BWYitZ0j7s8ghDzY36reA6p5bV22Tx0Zf2ehuABdwwcraUp2YvdQRwdIFQGrcT-2gQViA6qzHziR4QAHF1zkJq6MmgxH384jHdUjUr96c4reGXTQWmYEj1cCjPxeZq_Fbn8SM66UOV7UAPoA"
                  alt="Courier Marcus Johnson"
                />
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <h3 className="font-extrabold text-base text-[#1c1b1b]">Marcus Johnson</h3>
                    <div className="flex items-center gap-1 text-[#3b6934] font-bold text-xs bg-[#b9eeab]/30 px-2 py-0.5 rounded-md">
                      <span className="material-symbols-outlined text-xs fill-1">star</span>
                      <span>4.9</span>
                    </div>
                  </div>
                  <p className="font-['JetBrains_Mono'] text-xs text-[#584238]">
                    Ford E-Transit Van (Houston HQ) • 1,240 Deliveries
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => alert('Calling driver Marcus Johnson (+1 713-555-0199)...')}
                  className="py-2.5 px-4 bg-[#9c3f00] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#c45100] transition-colors shadow-md"
                >
                  <span className="material-symbols-outlined text-base">call</span>
                  <span>Call Courier</span>
                </button>
                <button
                  onClick={() => alert('Opening live chat with Marcus...')}
                  className="py-2.5 px-4 bg-stone-100 text-[#584238] rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-stone-200 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">chat</span>
                  <span>Chat Courier</span>
                </button>
              </div>
            </div>

            {/* Timeline Steps */}
            <div className="bg-white p-5 rounded-3xl border border-stone-200/60 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-[#1c1b1b]">Delivery Lifecycle</h3>

              <div className="space-y-4 relative pl-6 border-l-2 border-stone-200 ml-2">
                {/* Step 1 */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-[#3b6934] text-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm font-bold">check</span>
                  </div>
                  <p className="font-bold text-xs text-[#1c1b1b]">Order Confirmed</p>
                  <p className="font-['JetBrains_Mono'] text-[11px] text-[#584238]">1:30 PM • Payment Verified</p>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-[#3b6934] text-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm font-bold">check</span>
                  </div>
                  <p className="font-bold text-xs text-[#1c1b1b]">Fresh Produce Packed</p>
                  <p className="font-['JetBrains_Mono'] text-[11px] text-[#584238]">1:42 PM • Inspected at Mama Jones</p>
                </div>

                {/* Step 3 */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-[#9c3f00] text-white flex items-center justify-center animate-pulse">
                    <span className="material-symbols-outlined text-sm">local_shipping</span>
                  </div>
                  <p className="font-bold text-xs text-[#9c3f00]">Out for Express Delivery</p>
                  <p className="font-['JetBrains_Mono'] text-[11px] text-[#584238]">1:55 PM • On moped route</p>
                </div>

                {/* Step 4 */}
                <div className="relative opacity-50">
                  <div className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-stone-300 text-stone-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm">home</span>
                  </div>
                  <p className="font-bold text-xs text-[#1c1b1b]">Arrived at Destination</p>
                  <p className="font-['JetBrains_Mono'] text-[11px] text-[#584238]">Expected ~ 2:15 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
