import React from 'react';
import { ArrowRight, Flame, Sparkles } from 'lucide-react';
import type { Product } from '../types.js';
import { ProductCard } from './ProductCard.js';

interface FeaturedSectionsProps {
  products: Product[];
  onExploreAll: () => void;
}

export const FeaturedSections: React.FC<FeaturedSectionsProps> = ({
  products,
  onExploreAll,
}) => {
  const newArrivals = products.filter(p => p.isNewArrival && p.status === 'active').slice(0, 3);
  const bestSellers = products.filter(p => p.isBestSeller && p.status === 'active').slice(0, 3);

  return (
    <div className="space-y-20 md:space-y-28 my-16 md:my-24">
      {/* 1. NEW ARRIVALS SECTION */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#1f1f28]">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#888894] mb-1">
                <span>Recent Drops</span>
                <span aria-hidden="true">·</span>
                <span>Season 2026</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase text-[#f4f4f0]">
                NEW ARRIVALS
              </h2>
            </div>
            <button
              onClick={onExploreAll}
              className="text-xs font-mono uppercase text-[#a4a4b0] hover:text-white flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <span>View All Releases</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {newArrivals.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 2. VINTAGE PROMO EDITORIAL BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-[#121217] border border-[#262632] p-8 md:p-14 lg:p-16">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-xs font-mono tracking-widest uppercase text-[#888896]">
              Atelier Manifesto // 001
            </span>
            <h3 className="font-display text-3xl sm:text-4xl md:text-5xl font-black uppercase text-white leading-[0.95]">
              RAW FABRICS. MANUAL GRUNGE WASH. HEAVYWEIGHT CUTS.
            </h3>
            <p className="text-xs sm:text-sm text-[#9e9ea8] leading-relaxed">
              Setiap helai dirancang secara independen tanpa kompromi. Menggunakan katun combed berdensitas tinggi mulai dari 240 GSM hingga fleece 420 GSM, diberi perlakuan enzim asam dan jahitan ganda agar bertahan melewati waktu.
            </p>
            <div className="pt-2">
              <button
                onClick={onExploreAll}
                className="px-6 py-3 bg-[#f4f4f0] hover:bg-white text-black font-bold text-xs uppercase tracking-wider"
              >
                Jelajahi Arsip Produk
              </button>
            </div>
          </div>

          {/* Background watermark / subtle aesthetic motif */}
          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 pointer-events-none hidden md:block">
            <img
              src="/src/assets/images/hero_streetwear_vintage_1792935711123.jpg"
              alt="Background texture"
              className="w-full h-full object-cover grayscale contrast-150"
            />
          </div>
        </div>
      </section>

      {/* 3. BEST SELLERS SECTION */}
      {bestSellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#1f1f28]">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#888894] mb-1">
                <span>Streetwear Staples</span>
                <span aria-hidden="true">·</span>
                <span>Core Archive</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase text-[#f4f4f0]">
                BEST SELLERS
              </h2>
            </div>
            <button
              onClick={onExploreAll}
              className="text-xs font-mono uppercase text-[#a4a4b0] hover:text-white flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <span>Explore All Pieces</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {bestSellers.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
