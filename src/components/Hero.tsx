import React from 'react';
import { ArrowDownRight, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext.js';

interface HeroProps {
  onShopClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onShopClick }) => {
  const { settings } = useStore();

  return (
    <section className="relative w-full overflow-hidden border-b border-[#1e1e24] bg-[#0b0b0d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 lg:pr-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#888892]">
              <span>Drop 04</span>
              <span aria-hidden="true">·</span>
              <span>Limited Archive Run</span>
              <span aria-hidden="true">·</span>
              <span>Vintage Cut</span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight text-[#f4f4f0] leading-[0.92]">
              {settings.tagline || 'BUILT FROM THE STREETS.'}
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-[#9c9ca4] max-w-xl font-normal leading-relaxed">
              {settings.subtagline || 'Independent Streetwear. Timeless Identity.'}
              <span className="block mt-2 text-sm text-[#73737c]">
                Heavyweight combed fabrics, distressed treatments, and brutalist graphics engineered for those who carve their own path.
              </span>
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={onShopClick}
                className="group px-8 py-4 bg-[#f4f4f0] hover:bg-white text-[#0b0b0d] font-bold text-sm tracking-wider uppercase flex items-center gap-3 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>SHOP NOW</span>
                <ArrowDownRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
              </button>

              <a
                href="#collections"
                className="px-6 py-4 bg-[#141418] hover:bg-[#1c1c22] border border-[#2b2b34] text-[#e0e0dc] font-semibold text-xs tracking-widest uppercase transition-colors"
              >
                Explore Archive
              </a>
            </div>

            {/* Quick trust metrics */}
            <div className="pt-8 grid grid-cols-3 gap-4 border-t border-[#1b1b22] text-[#8c8c96]">
              <div>
                <p className="font-mono-numbers text-lg md:text-xl font-bold text-[#f4f4f0]">240-420</p>
                <p className="text-[11px] uppercase tracking-wider font-mono">GSM Heavy Cotton</p>
              </div>
              <div>
                <p className="font-mono-numbers text-lg md:text-xl font-bold text-[#f4f4f0]">100%</p>
                <p className="text-[11px] uppercase tracking-wider font-mono">Independent Brand</p>
              </div>
              <div>
                <p className="font-mono-numbers text-lg md:text-xl font-bold text-[#f4f4f0]">ID</p>
                <p className="text-[11px] uppercase tracking-wider font-mono">Batam & JKT Hub</p>
              </div>
            </div>
          </div>

          {/* Right Hero Image Frame */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-4/3 lg:aspect-4/5 overflow-hidden bg-[#141419] border border-[#262630] shadow-2xl">
              <img
                src={settings.heroImage || '/src/assets/images/hero_streetwear_vintage_1792935711123.jpg'}
                alt="Galur Society Underground Streetwear Editorial"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover grayscale contrast-125 brightness-95 hover:grayscale-0 transition-all duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0d]/90 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-[#a2a2ac]">
                <span>GALUR ARCHIVE // LOOKBOOK 01</span>
                <span>LIMITED RUN</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
