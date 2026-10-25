import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Product, StoreSettings } from '../types.js';

interface AdminUser {
  email: string;
  name: string;
  role: string;
}

interface StoreContextType {
  products: Product[];
  settings: StoreSettings;
  isLoading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  
  // Selected product modal
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;
  
  // Checkout modal
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;

  // Admin state
  adminToken: string | null;
  adminUser: AdminUser | null;
  isAdminViewOpen: boolean;
  setIsAdminViewOpen: (open: boolean) => void;
  adminLogin: (token: string, user: AdminUser) => void;
  adminLogout: () => void;
}

const DEFAULT_SETTINGS: StoreSettings = {
  brandName: 'GALUR SOCIETY',
  tagline: 'BUILT FROM THE STREETS.',
  subtagline: 'Independent Streetwear. Timeless Identity.',
  heroImage: '/src/assets/images/hero_streetwear_vintage_1792935711123.jpg',
  whatsappNumber: '6281234567890',
  instagram: '@galursociety.archive',
  flatShippingFee: 22000,
  freeShippingThreshold: 500000,
  announcement: 'FREE SHIPPING ORDERS OVER RP 500.000 — ARCHIVE RELEASE 2026',
  bankDetails: 'BCA: 8830192831 a.n GALUR SOCIETY | Mandiri: 1370019283921 | QRIS All Payment',
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Admin
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('galur_admin_token');
  });
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    const raw = localStorage.getItem('galur_admin_user');
    return raw ? JSON.parse(raw) : null;
  });
  const [isAdminViewOpen, setIsAdminViewOpen] = useState(false);

  const refreshProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch products', err);
      setError('Gagal memuat katalog produk');
    }
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch settings', err);
    }
  }, []);

  useEffect(() => {
    Promise.all([refreshProducts(), refreshSettings()]).finally(() => {
      setIsLoading(false);
    });
  }, [refreshProducts, refreshSettings]);

  const adminLogin = (token: string, user: AdminUser) => {
    setAdminToken(token);
    setAdminUser(user);
    localStorage.setItem('galur_admin_token', token);
    localStorage.setItem('galur_admin_user', JSON.stringify(user));
  };

  const adminLogout = () => {
    setAdminToken(null);
    setAdminUser(null);
    localStorage.removeItem('galur_admin_token');
    localStorage.removeItem('galur_admin_user');
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        settings,
        isLoading,
        error,
        refreshProducts,
        refreshSettings,
        selectedProduct,
        setSelectedProduct,
        isCheckoutOpen,
        setIsCheckoutOpen,
        adminToken,
        adminUser,
        isAdminViewOpen,
        setIsAdminViewOpen,
        adminLogin,
        adminLogout,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
