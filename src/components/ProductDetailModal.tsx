import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Zap, Check, AlertCircle, ShieldCheck, Truck } from 'lucide-react';
import type { Product, ProductVariant } from '../types.js';
import { formatIDR, getStockStatus } from '../utils/formatters.js';
import { useCart } from '../context/CartContext.js';
import { useStore } from '../context/StoreContext.js';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
}) => {
  const { addToCart } = useCart();
  const { setSelectedProduct, setIsCheckoutOpen, products } = useStore();

  // Find first in-stock variant by default, or the first variant
  const initialVariant = product.variants.find(v => v.stock > 0) || product.variants[0];
  const [selectedVariantId, setSelectedVariantId] = useState<string>(initialVariant?.id || '');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addSuccess, setAddSuccess] = useState(false);

  const selectedVariant = product.variants.find(v => v.id === selectedVariantId) || initialVariant;
  const currentStock = selectedVariant?.stock ?? 0;
  const isSoldOut = currentStock <= 0;
  const stockStatus = getStockStatus(currentStock);

  // Keyboard shortcut to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Reset quantity if stock changes
  useEffect(() => {
    if (quantity > currentStock && currentStock > 0) {
      setQuantity(currentStock);
    } else if (currentStock === 0) {
      setQuantity(1);
    }
  }, [selectedVariantId, currentStock]);

  const handleAddToCart = () => {
    if (isSoldOut || !selectedVariant) return;
    const ok = addToCart(product, selectedVariant.id, quantity);
    if (ok) {
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 2000);
    }
  };

  const handleBuyNow = () => {
    if (isSoldOut || !selectedVariant) return;
    addToCart(product, selectedVariant.id, quantity);
    onClose();
    setIsCheckoutOpen(true);
  };

  // Recommended products (excluding current)
  const recommendations = products
    .filter(p => p.id !== product.id && p.status === 'active')
    .slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 md:p-10 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl bg-[#0f0f13] border border-[#262630] shadow-2xl text-[#f4f4f0] overflow-hidden my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-[#888894] hover:text-white bg-[#17171f]/80 rounded hover:bg-[#20202a] transition-colors"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[85vh] overflow-y-auto">
          {/* Left Column: Image Gallery */}
          <div className="md:col-span-6 p-4 sm:p-6 bg-[#0c0c10] border-b md:border-b-0 md:border-r border-[#1e1e26] flex flex-col gap-4">
            {/* Main Stage Image */}
            <div className="relative aspect-4/5 w-full bg-[#141419] border border-[#202028] overflow-hidden">
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
              {isSoldOut && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="font-display text-3xl font-extrabold uppercase tracking-widest text-[#f87171] border-2 border-[#f87171] px-4 py-1">
                    SOLD OUT
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-20 shrink-0 border overflow-hidden transition-all ${
                      activeImageIndex === idx
                        ? 'border-[#f4f4f0] opacity-100 ring-1 ring-[#f4f4f0]'
                        : 'border-[#262630] opacity-60 hover:opacity-90'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Purchase Module */}
          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              {/* Category & Status */}
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-[#858592]">
                <span>{product.category}</span>
                <span
                  className={
                    stockStatus.tone === 'rose'
                      ? 'text-[#f87171]'
                      : stockStatus.tone === 'amber'
                      ? 'text-[#fbbf24]'
                      : 'text-[#50e3c2]'
                  }
                >
                  ● {stockStatus.label}
                </span>
              </div>

              {/* Title */}
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white leading-tight">
                {product.name}
              </h2>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="font-mono-numbers text-2xl sm:text-3xl font-bold text-[#f4f4f0]">
                  {formatIDR(product.discountPrice ?? product.price)}
                </span>
                {product.discountPrice && (
                  <span className="font-mono-numbers text-base text-[#6f6f7d] line-through">
                    {formatIDR(product.price)}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#9c9ca6] leading-relaxed">
                {product.description}
              </p>

              {/* Materials Spec */}
              <div className="p-3 bg-[#131318] border border-[#202028] text-xs font-mono text-[#a6a6b0]">
                <span className="text-[#6c6c78] uppercase block mb-1">Material & Specs</span>
                <span>{product.materials}</span>
              </div>

              {/* Size Selector with real stock counts */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase text-[#a0a0ab]">Pilih Ukuran (Size):</span>
                  {selectedVariant && (
                    <span className="text-[11px] font-mono text-[#787884]">
                      SKU: {selectedVariant.sku}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {product.variants.map(variant => {
                    const isSelected = selectedVariant?.id === variant.id;
                    const isOutOfStock = variant.stock <= 0;

                    return (
                      <button
                        key={variant.id}
                        disabled={isOutOfStock}
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={`flex flex-col items-center justify-center p-2 border transition-all text-center ${
                          isSelected
                            ? 'bg-[#f4f4f0] text-[#0b0b0d] border-[#f4f4f0] font-bold shadow-sm'
                            : isOutOfStock
                            ? 'bg-[#121216] border-[#1d1d24] text-[#4a4a54] cursor-not-allowed line-through'
                            : 'bg-[#14141a] border-[#262632] text-[#d0d0c8] hover:border-[#4e4e5e]'
                        }`}
                      >
                        <span className="font-mono text-sm">{variant.size}</span>
                        <span
                          className={`text-[9px] font-mono mt-0.5 ${
                            isSelected
                              ? 'text-[#444]'
                              : isOutOfStock
                              ? 'text-[#555]'
                              : variant.stock <= 3
                              ? 'text-[#fbbf24]'
                              : 'text-[#777]'
                          }`}
                        >
                          {isOutOfStock ? 'Habis' : `Sisa ${variant.stock}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity stepper */}
              {!isSoldOut && (
                <div className="flex items-center gap-4 pt-2">
                  <span className="text-xs font-mono uppercase text-[#a0a0ab]">Jumlah:</span>
                  <div className="flex items-center border border-[#2b2b36] bg-[#121217]">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="px-3 py-1 text-sm font-mono text-[#9c9ca6] hover:text-white disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-mono font-bold text-white min-w-8 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                      disabled={quantity >= currentStock}
                      className="px-3 py-1 text-sm font-mono text-[#9c9ca6] hover:text-white disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[11px] font-mono text-[#6c6c78]">
                    (Maksimal {currentStock} pcs)
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-[#1e1e26]">
              <div className="grid grid-cols-2 gap-3">
                <button
                  disabled={isSoldOut}
                  onClick={handleAddToCart}
                  className={`w-full py-3.5 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border transition-all ${
                    addSuccess
                      ? 'bg-[#153e2e] text-[#50e3c2] border-[#50e3c2]'
                      : isSoldOut
                      ? 'bg-[#16161c] text-[#555562] border-[#22222a] cursor-not-allowed'
                      : 'bg-[#181820] hover:bg-[#20202a] text-[#f4f4f0] border-[#2e2e3a]'
                  }`}
                >
                  {addSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Ditambahkan</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>{isSoldOut ? 'Stok Habis' : 'Tambah Ke Keranjang'}</span>
                    </>
                  )}
                </button>

                <button
                  disabled={isSoldOut}
                  onClick={handleBuyNow}
                  className={`w-full py-3.5 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    isSoldOut
                      ? 'bg-[#22222a] text-[#555562] cursor-not-allowed'
                      : 'bg-[#f4f4f0] hover:bg-white text-[#0b0b0d]'
                  }`}
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Beli Sekarang</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-mono text-[#787884]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#50e3c2]" />
                  <span>100% Original Independent Archive</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#50e3c2]" />
                  <span>Pengiriman Cepat Seluruh ID</span>
                </div>
              </div>
            </div>

            {/* Related Recommendations */}
            {recommendations.length > 0 && (
              <div className="pt-4 border-t border-[#1e1e26]">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#7e7e8c] block mb-2">
                  Lengkapi Koleksi Anda:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {recommendations.map(rec => (
                    <button
                      key={rec.id}
                      onClick={() => {
                        setSelectedProduct(rec);
                        setActiveImageIndex(0);
                      }}
                      className="text-left group/rec bg-[#121217] p-1.5 border border-[#1e1e26] hover:border-[#3d3d4c] transition-colors"
                    >
                      <div className="aspect-square w-full bg-[#171720] overflow-hidden mb-1">
                        <img
                          src={rec.images[0]}
                          alt={rec.name}
                          className="w-full h-full object-cover grayscale group-hover/rec:grayscale-0 transition-all"
                        />
                      </div>
                      <p className="text-[10px] font-semibold text-[#d0d0cb] truncate">
                        {rec.name}
                      </p>
                      <p className="text-[10px] font-mono text-[#8a8a94]">
                        {formatIDR(rec.discountPrice ?? rec.price)}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
