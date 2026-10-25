import React, { useState } from 'react';
import type { Product } from '../types.js';
import { formatIDR, getStockStatus } from '../utils/formatters.js';
import { useStore } from '../context/StoreContext.js';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { setSelectedProduct } = useStore();
  const [imgError, setImgError] = useState(false);

  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const stockInfo = getStockStatus(totalStock);
  const mainImage = product.images[0] || '/src/assets/images/product_vintage_tee_1792935713250.jpg';

  // Badge label (max 1 tag)
  let badgeLabel: string | null = null;
  if (totalStock === 0) {
    badgeLabel = 'SOLD OUT';
  } else if (totalStock <= 4) {
    badgeLabel = `ONLY ${totalStock} LEFT`;
  } else if (product.isNewArrival) {
    badgeLabel = 'NEW ARRIVAL';
  } else if (product.isBestSeller) {
    badgeLabel = 'BEST SELLER';
  }

  const sizesSummary = product.variants
    .map(v => v.size)
    .filter((val, idx, arr) => arr.indexOf(val) === idx)
    .join(' · ');

  return (
    <article
      onClick={() => setSelectedProduct(product)}
      className="group cursor-pointer flex flex-col bg-[#111115] border border-[#1f1f26] hover:border-[#383844] transition-all duration-200 hover:-translate-y-1 overflow-hidden"
    >
      {/* Product Image Frame (70% height) */}
      <div className="relative aspect-4/5 w-full overflow-hidden bg-[#15151c]">
        {!imgError ? (
          <img
            src={mainImage}
            alt={product.name}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center grayscale contrast-110 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#171720]">
            <span className="font-display text-2xl font-bold uppercase text-[#4e4e5a]">GALUR ARCHIVE</span>
            <span className="text-xs font-mono text-[#787886] mt-2">{product.name}</span>
          </div>
        )}

        {/* Gradient Scrim for subtle contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e12]/60 via-transparent to-transparent pointer-events-none" />

        {/* Quiet top tag (max 1, unboxed text or minimal label) */}
        {badgeLabel && (
          <div className="absolute top-3 left-3">
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase bg-[#0e0e12]/90 border border-[#2b2b36] px-2 py-0.5 text-[#e4e4df]">
              {badgeLabel}
            </span>
          </div>
        )}

        {/* Quick view hint on hover */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-full py-2 bg-[#f4f4f0] text-[#0b0b0d] text-center text-xs font-bold uppercase tracking-wider">
            Quick View / Sizing
          </div>
        </div>
      </div>

      {/* Card Info Content */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Category & Sizing inline */}
          <div className="flex items-center justify-between text-xs font-mono text-[#7d7d8a] uppercase tracking-wider mb-1">
            <span>{product.category}</span>
            <span className="text-[11px] text-[#5e5e6a]">{sizesSummary}</span>
          </div>

          <h3 className="font-semibold text-sm sm:text-base text-[#f0f0eb] group-hover:text-white transition-colors line-clamp-1">
            {product.name}
          </h3>
        </div>

        {/* Price & Stock info */}
        <div className="flex items-baseline justify-between pt-1 border-t border-[#1a1a22]">
          <div className="flex items-baseline gap-2">
            <span className="font-mono-numbers text-sm sm:text-base font-bold text-[#f4f4f0]">
              {formatIDR(product.discountPrice ?? product.price)}
            </span>
            {product.discountPrice && (
              <span className="font-mono-numbers text-xs text-[#6e6e7c] line-through">
                {formatIDR(product.price)}
              </span>
            )}
          </div>

          <span
            className={`text-[11px] font-mono ${
              stockInfo.tone === 'rose'
                ? 'text-[#f87171]'
                : stockInfo.tone === 'amber'
                ? 'text-[#fbbf24]'
                : 'text-[#9ca3af]'
            }`}
          >
            {stockInfo.label}
          </span>
        </div>
      </div>
    </article>
  );
};
