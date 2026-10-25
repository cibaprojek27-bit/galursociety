import React from 'react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about-section" className="border-t border-[#1e1e26] bg-[#0c0c10] py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Brand Story */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#888894]">
              <span>About Us</span>
              <span aria-hidden="true">·</span>
              <span>Brand Heritage</span>
            </div>

            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-black uppercase text-white leading-tight">
              BORN IN THE SHADOWS. CRAFTED FOR THE PAVEMENT.
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-[#9c9ca8] leading-relaxed font-sans">
              <p>
                <strong className="text-white">GALUR SOCIETY</strong> berdiri sebagai perlawanan terhadap serbuan fast-fashion yang dangkal dan mudah usang. Kami adalah kolektif streetwear independen yang berakar dari subkultur jalanan underground, musik grunge 90-an, brutalist visual art, dan warisan pakaian kerja vintage yang tangguh.
              </p>
              <p>
                Setiap rilisan adalah arsip terbatas (limited run archive). Kami tidak mengikuti tren musiman massal; setiap kaos, hoodie, dan jaket kami diproduksi menggunakan bahan katun combed padat 16s hingga 420 GSM heavy French terry, diproses melalui pencucian asam (acid wash) manual dan screenprint distressed yang memiliki karakter unik pada setiap helainya.
              </p>
              <p>
                Ketika Anda mengenakan Galur Society, Anda tidak sekadar memakai pakaian—Anda membawa identitas yang tak lekang oleh waktu.
              </p>
            </div>

            {/* 3 Core Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#1e1e28] text-xs font-mono">
              <div className="p-3 bg-[#111116] border border-[#1e1e26]">
                <span className="text-[#f4f4f0] font-bold block mb-1">01. Heavy Duty</span>
                <span className="text-[#787884]">Kain katun tebal tidak tipis, awet dipakai bertahun-tahun.</span>
              </div>
              <div className="p-3 bg-[#111116] border border-[#1e1e26]">
                <span className="text-[#f4f4f0] font-bold block mb-1">02. Manual Wash</span>
                <span className="text-[#787884]">Efek pudar dan acid distressed yang otentik dan artistik.</span>
              </div>
              <div className="p-3 bg-[#111116] border border-[#1e1e26]">
                <span className="text-[#f4f4f0] font-bold block mb-1">03. Zero Fast-Fashion</span>
                <span className="text-[#787884]">Arsip rilis terbatas dengan nomor seri SKU resmi.</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Frame */}
          <div className="lg:col-span-5">
            <div className="relative aspect-4/5 overflow-hidden bg-[#15151c] border border-[#262632] shadow-xl">
              <img
                src="/src/assets/images/product_work_jacket_1792935715027.jpg"
                alt="Galur Society Craftsmanship"
                className="w-full h-full object-cover grayscale contrast-125 brightness-90 hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0d]/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 text-[11px] font-mono text-[#a4a4b0] flex justify-between">
                <span>GALUR ATELIER SPEC</span>
                <span>AUTHENTIC STREETWEAR</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
