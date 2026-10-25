import React, { useState } from 'react';
import { X, CheckCircle2, MessageSquare, CreditCard, QrCode, Truck, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { useStore } from '../context/StoreContext.js';
import { formatIDR, buildWhatsAppOrderLink } from '../utils/formatters.js';
import type { Order } from '../types.js';

export const CheckoutModal: React.FC = () => {
  const { items, subtotal, clearCart } = useCart();
  const { isCheckoutOpen, setIsCheckoutOpen, settings, refreshProducts } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'qris' | 'cod'>('bank_transfer');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  if (!isCheckoutOpen) return null;

  const freeShippingThreshold = settings.freeShippingThreshold || 500000;
  const shippingFee = subtotal >= freeShippingThreshold ? 0 : (settings.flatShippingFee || 22000);
  const grandTotal = subtotal + shippingFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim() || !whatsapp.trim() || !shippingAddress.trim() || !city.trim()) {
      setErrorMessage('Mohon lengkapi Nama, WhatsApp, Alamat Pengiriman, dan Kota.');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Keranjang belanja kosong.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customerName,
        whatsapp,
        email,
        shippingAddress,
        city,
        postalCode,
        notes,
        paymentMethod,
        items: items.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          productName: item.product.name,
          quantity: item.quantity,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal memproses pesanan di server.');
      }

      setConfirmedOrder(data.data);
      clearCart();
      await refreshProducts(); // update client product stock
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setConfirmedOrder(null);
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-[#0f0f14] border border-[#262632] shadow-2xl text-[#f4f4f0] my-auto overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#1e1e28] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#7f7f8d]">
              Direct Secure Checkout
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white">
              {confirmedOrder ? 'PESANAN TERKONFIRMASI' : 'CHECKOUT PESANAN'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-[#80808e] hover:text-white bg-[#171720] rounded hover:bg-[#20202c] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Confirmed Order State */}
        {confirmedOrder ? (
          <div className="p-6 sm:p-10 space-y-6">
            <div className="p-6 bg-[#131b17] border border-[#26533f] text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-[#50e3c2] mx-auto" />
              <h3 className="font-display text-2xl font-bold uppercase text-[#50e3c2] tracking-wider">
                PESANAN BERHASIL DITERIMA
              </h3>
              <p className="text-xs font-mono text-[#a2c9ba]">
                Nomor Pesanan: <span className="font-bold text-white text-sm">{confirmedOrder.id}</span>
              </p>
              <p className="text-xs text-[#b8d4c8] max-w-lg mx-auto">
                Terima kasih, <span className="font-semibold text-white">{confirmedOrder.customerName}</span>. Stok barang Anda telah diamankan oleh sistem kami.
              </p>
            </div>

            {/* Payment & instructions */}
            <div className="p-5 bg-[#14141a] border border-[#22222c] space-y-3 text-xs font-mono">
              <span className="text-[#848492] uppercase block font-bold">Instruksi Pembayaran:</span>
              <p className="text-[#e2e2dc] leading-relaxed">
                {confirmedOrder.paymentMethod === 'bank_transfer' && (
                  <>
                    Silakan transfer ke rekening resmi:{' '}
                    <span className="font-bold text-white">{settings.bankDetails}</span>
                  </>
                )}
                {confirmedOrder.paymentMethod === 'qris' && (
                  <>
                    Scan QRIS Galur Society atau hubungi WhatsApp kami untuk menerima barcode tagihan instan.
                  </>
                )}
                {confirmedOrder.paymentMethod === 'cod' && (
                  <>
                    Pembayaran tunai di tempat (COD) saat kurir mengantarkan paket ke alamat Anda.
                  </>
                )}
              </p>
              <div className="pt-2 flex justify-between border-t border-[#20202a] text-sm">
                <span className="text-[#92929e]">Total Tagihan:</span>
                <span className="font-bold text-[#f4f4f0] font-mono-numbers">
                  {formatIDR(confirmedOrder.totalAmount)}
                </span>
              </div>
            </div>

            {/* Direct WhatsApp Confirmation Button */}
            <div className="space-y-3 pt-2">
              <a
                href={buildWhatsAppOrderLink(
                  settings.whatsappNumber,
                  confirmedOrder.id,
                  confirmedOrder.customerName,
                  confirmedOrder.totalAmount,
                  confirmedOrder.items
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-[#25D366] hover:bg-[#20ba5a] text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-lg"
              >
                <MessageSquare className="w-5 h-5 fill-current" />
                <span>Konfirmasi Pesanan via WhatsApp Sekarang</span>
              </a>

              <button
                onClick={handleClose}
                className="w-full py-3 bg-[#171720] hover:bg-[#20202c] text-[#a4a4b2] text-xs uppercase tracking-wider font-mono border border-[#2b2b36] transition-colors"
              >
                Kembali Ke Toko
              </button>
            </div>
          </div>
        ) : (
          /* Form Checkout */
          <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 md:grid-cols-12 max-h-[75vh] overflow-y-auto">
            {/* Left Column: Customer & Shipping details */}
            <div className="md:col-span-7 p-6 sm:p-8 space-y-4 border-b md:border-b-0 md:border-r border-[#1e1e28]">
              {errorMessage && (
                <div className="p-3 bg-[#2a1315] border border-[#6b252a] text-[#f87171] text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-[#9e9ea8]">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Contoh: Rian Pratama"
                  className="w-full bg-[#131318] border border-[#242430] focus:border-[#4d4d5e] p-2.5 text-xs text-[#f4f4f0] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-[#9e9ea8]">WhatsApp Aktif *</label>
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={e => setWhatsapp(e.target.value)}
                    placeholder="0812xxxxxxxx"
                    className="w-full bg-[#131318] border border-[#242430] focus:border-[#4d4d5e] p-2.5 text-xs text-[#f4f4f0] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-[#9e9ea8]">Email (Opsional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full bg-[#131318] border border-[#242430] focus:border-[#4d4d5e] p-2.5 text-xs text-[#f4f4f0] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-[#9e9ea8]">Alamat Lengkap Pengiriman *</label>
                <textarea
                  required
                  rows={2}
                  value={shippingAddress}
                  onChange={e => setShippingAddress(e.target.value)}
                  placeholder="Jl. Sudirman No. 12, RT 01 / RW 03, Kelurahan..."
                  className="w-full bg-[#131318] border border-[#242430] focus:border-[#4d4d5e] p-2.5 text-xs text-[#f4f4f0] focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-[#9e9ea8]">Kota / Kabupaten *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="Jakarta Selatan"
                    className="w-full bg-[#131318] border border-[#242430] focus:border-[#4d4d5e] p-2.5 text-xs text-[#f4f4f0] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-[#9e9ea8]">Kode Pos</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={e => setPostalCode(e.target.value)}
                    placeholder="12190"
                    className="w-full bg-[#131318] border border-[#242430] focus:border-[#4d4d5e] p-2.5 text-xs text-[#f4f4f0] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-[#9e9ea8]">Metode Pembayaran</label>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`p-2.5 border text-left flex flex-col justify-between transition-all ${
                      paymentMethod === 'bank_transfer'
                        ? 'border-[#f4f4f0] bg-[#1a1a24] text-white'
                        : 'border-[#22222c] bg-[#121217] text-[#868694] hover:border-[#383846]'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mb-1" />
                    <span className="text-[11px] font-mono uppercase font-bold">Transfer Bank</span>
                    <span className="text-[9px] text-[#70707c]">BCA / Mandiri</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qris')}
                    className={`p-2.5 border text-left flex flex-col justify-between transition-all ${
                      paymentMethod === 'qris'
                        ? 'border-[#f4f4f0] bg-[#1a1a24] text-white'
                        : 'border-[#22222c] bg-[#121217] text-[#868694] hover:border-[#383846]'
                    }`}
                  >
                    <QrCode className="w-4 h-4 mb-1" />
                    <span className="text-[11px] font-mono uppercase font-bold">QRIS Instant</span>
                    <span className="text-[9px] text-[#70707c]">Gopay/Ovo/Dana</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-2.5 border text-left flex flex-col justify-between transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-[#f4f4f0] bg-[#1a1a24] text-white'
                        : 'border-[#22222c] bg-[#121217] text-[#868694] hover:border-[#383846]'
                    }`}
                  >
                    <Truck className="w-4 h-4 mb-1" />
                    <span className="text-[11px] font-mono uppercase font-bold">Bayar COD</span>
                    <span className="text-[9px] text-[#70707c]">Bayar di Tempat</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-[#9e9ea8]">Catatan Khusus (Opsional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Titipkan ke satpam, patokan rumah cat hitam..."
                  className="w-full bg-[#131318] border border-[#242430] focus:border-[#4d4d5e] p-2 text-xs text-[#f4f4f0] focus:outline-none"
                />
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="md:col-span-5 p-6 sm:p-8 bg-[#0c0c10] flex flex-col justify-between space-y-6">
              <div>
                <h4 className="text-xs font-mono uppercase tracking-widest text-[#888896] pb-3 border-b border-[#1c1c24]">
                  Ringkasan Pesanan ({items.length} items)
                </h4>

                <div className="divide-y divide-[#181820] max-h-48 overflow-y-auto pr-1 mt-2">
                  {items.map(item => {
                    const price = item.product.discountPrice ?? item.product.price;
                    return (
                      <div key={item.variantId} className="py-2.5 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-semibold text-[#e8e8e3] truncate max-w-44">{item.product.name}</p>
                          <p className="text-[10px] font-mono text-[#787884]">
                            Size {item.variant.size} × {item.quantity}
                          </p>
                        </div>
                        <span className="font-mono-numbers text-[#f4f4f0] font-bold">
                          {formatIDR(price * item.quantity)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Calculation breakdown */}
                <div className="space-y-2 pt-4 border-t border-[#1e1e28] text-xs font-mono">
                  <div className="flex justify-between text-[#8c8c98]">
                    <span>Subtotal Produk:</span>
                    <span className="font-mono-numbers">{formatIDR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#8c8c98]">
                    <span>Biaya Pengiriman:</span>
                    <span className="font-mono-numbers">
                      {shippingFee === 0 ? <span className="text-[#50e3c2]">GRATIS</span> : formatIDR(shippingFee)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#22222e] text-sm text-[#f4f4f0] font-bold">
                    <span>Total Pembayaran:</span>
                    <span className="font-mono-numbers text-base text-white">{formatIDR(grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={isSubmitting || items.length === 0}
                  className="w-full py-4 bg-[#f4f4f0] hover:bg-white disabled:opacity-50 text-[#0b0b0d] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memproses Pesanan...</span>
                    </>
                  ) : (
                    <span>Konfirmasi & Buat Pesanan</span>
                  )}
                </button>
                <p className="text-[10px] text-center font-mono text-[#6c6c78]">
                  Stok barang otomatis dipotong secara aman dari server database.
                </p>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
