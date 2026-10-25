/**
 * Currency & helper formatters for Galur Society
 */

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace(/\s/g, ' ');
}

export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return isoString;
  }
}

export function getStockStatus(stock: number): { label: string; tone: 'emerald' | 'amber' | 'rose' } {
  if (stock <= 0) {
    return { label: 'Sold Out', tone: 'rose' };
  }
  if (stock <= 4) {
    return { label: `Tersisa ${stock} pcs`, tone: 'amber' };
  }
  return { label: 'In Stock', tone: 'emerald' };
}

export function buildWhatsAppOrderLink(
  whatsappNumber: string,
  orderId: string,
  customerName: string,
  totalAmount: number,
  items: Array<{ productName: string; size: string; quantity: number }>
): string {
  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
  const itemList = items
    .map((item, idx) => `${idx + 1}. ${item.productName} [${item.size}] x${item.quantity}`)
    .join('%0A');

  const text = `Halo Galur Society Archive,%0A%0ASaya ingin konfirmasi pesanan:%0A- No. Pesanan: ${orderId}%0A- Nama: ${customerName}%0A- Total: ${formatIDR(totalAmount)}%0A%0ARincian Barang:%0A${itemList}%0A%0AMohon info verifikasi pembayaran dan pengiriman. Terima kasih.`;

  return `https://wa.me/${cleanNumber}?text=${text}`;
}
