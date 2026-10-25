import React from 'react';
import { X, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { useStore } from '../context/StoreContext.js';
import { formatIDR } from '../utils/formatters.js';

export const CartDrawer: React.FC = () => {
  const { items, removeFromCart, updateQuantity, subtotal, isDrawerOpen, setIsDrawerOpen } = useCart();
  const { settings, setIsCheckoutOpen } = useStore();

  if (!isDrawerOpen) return null;

  const freeShippingThreshold = settings.freeShippingThreshold || 500000;
  const remainingForFreeShip = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleProceedToCheckout = () => {
    setIsDrawerOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#0e0e12] border-l border-[#24242e] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1e1e26] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#f4f4f0]" />
            <h3 className="font-display text-xl uppercase font-extrabold tracking-wider text-[#f4f4f0]">
              KERANJANG ({items.length})
            </h3>
          </div>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="p-1.5 text-[#8c8c98] hover:text-white bg-[#16161d] rounded hover:bg-[#202028] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress bar */}
        <div className="p-3.5 bg-[#141419] border-b border-[#1e1e26] text-xs font-mono">
          {remainingForFreeShip > 0 ? (
            <p className="text-[#9c9ca6]">
              Tambah <span className="text-[#f4f4f0] font-bold">{formatIDR(remainingForFreeShip)}</span> lagi untuk <span className="text-[#50e3c2]">GRATIS ONGKIR</span>
            </p>
          ) : (
            <p className="text-[#50e3c2] font-bold">
              ✓ Anda mendapatkan GRATIS ONGKIR domestik!
            </p>
          )}
          <div className="mt-2 w-full h-1.5 bg-[#202028] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#f4f4f0] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {items.length > 0 ? (
            items.map(item => {
              const unitPrice = item.product.discountPrice ?? item.product.price;
              const maxStock = item.variant.stock;

              return (
                <div
                  key={item.variantId}
                  className="flex gap-4 p-3 bg-[#121217] border border-[#1f1f28] hover:border-[#2e2e3a] transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-24 bg-[#171720] shrink-0 overflow-hidden border border-[#24242e]">
                    <img
                      src={item.product.images[0] || '/src/assets/images/product_vintage_tee_1792935713250.jpg'}
                      alt={item.product.name}
                      className="w-full h-full object-cover grayscale"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex flex-col justify-between flex-1 min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-xs sm:text-sm text-[#f0f0eb] truncate">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.variantId)}
                          className="text-[#6c6c78] hover:text-[#f87171] p-1 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-[11px] font-mono text-[#8a8a96] mt-0.5">
                        Size: <span className="text-[#e2e2dc] font-bold">{item.variant.size}</span> · {item.variant.color}
                      </p>

                      <p className="font-mono-numbers text-xs font-bold text-[#f4f4f0] mt-1">
                        {formatIDR(unitPrice)}
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-[#262632] bg-[#0c0c10]">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="px-2 py-0.5 text-xs font-mono text-[#9c9ca6] hover:text-white"
                        >
                          -
                        </button>
                        <span className="px-2.5 py-0.5 text-xs font-mono font-bold text-white min-w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          disabled={item.quantity >= maxStock}
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="px-2 py-0.5 text-xs font-mono text-[#9c9ca6] hover:text-white disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-mono-numbers text-xs font-bold text-[#f4f4f0]">
                        {formatIDR(unitPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-20 text-center text-[#747480] space-y-3">
              <ShoppingBag className="w-12 h-12 mx-auto stroke-1 text-[#444450]" />
              <p className="font-display text-xl uppercase tracking-wider text-[#a0a0aa]">
                KERANJANG KOSONG
              </p>
              <p className="text-xs font-mono">
                Belum ada item streetwear yang ditambahkan.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 bg-[#121217] border-t border-[#1e1e26] space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-mono uppercase text-[#888894]">Subtotal Produk:</span>
              <span className="font-mono-numbers text-lg font-bold text-[#f4f4f0]">
                {formatIDR(subtotal)}
              </span>
            </div>

            <p className="text-[11px] font-mono text-[#6c6c78]">
              Ongkir akan dihitung otomatis saat pengisian alamat pengiriman.
            </p>

            <button
              onClick={handleProceedToCheckout}
              className="w-full py-3.5 bg-[#f4f4f0] hover:bg-white text-[#0b0b0d] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              <span>Lanjut Ke Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
