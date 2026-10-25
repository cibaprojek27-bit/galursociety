export type ProductCategory = 'T-Shirt' | 'Long Sleeve' | 'Hoodie' | 'Jacket' | 'Accessories';

export type ProductSize = 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'One Size';

export interface ProductVariant {
  id: string;
  productId: string;
  size: ProductSize;
  color: string;
  stock: number;
  sku: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  description: string;
  materials: string;
  price: number;
  discountPrice?: number | null;
  images: string[];
  isNewArrival: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  status: 'active' | 'hidden';
  variants: ProductVariant[];
  createdAt: string;
}

export type OrderStatus = 'Pending' | 'Paid' | 'Processing' | 'Shipped' | 'Completed' | 'Cancelled';

export interface OrderItem {
  productId: string;
  variantId: string;
  productName: string;
  size: ProductSize;
  color: string;
  unitPrice: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  customerName: string;
  whatsapp: string;
  email: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  notes?: string;
  paymentMethod: 'bank_transfer' | 'qris' | 'cod';
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  variantId: string;
  variantLabel: string;
  type: 'in' | 'out' | 'adjustment';
  quantityDelta: number;
  previousStock: number;
  newStock: number;
  reason: string;
  performedBy: string;
  createdAt: string;
}

export interface StoreSettings {
  brandName: string;
  tagline: string;
  subtagline: string;
  heroImage: string;
  whatsappNumber: string;
  instagram: string;
  flatShippingFee: number;
  freeShippingThreshold: number;
  announcement: string;
  bankDetails: string;
}

export interface DashboardSummary {
  totalProducts: number;
  totalStockUnits: number;
  lowStockCount: number;
  soldOutCount: number;
  totalOrders: number;
  totalRevenue: number;
}
