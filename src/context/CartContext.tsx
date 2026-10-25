import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product, ProductVariant } from '../types.js';

export interface CartItem {
  id: string; // composite key: `${productId}_${variantId}`
  productId: string;
  variantId: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, variantId: string, quantity?: number) => boolean;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'galur_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to sync cart to storage', e);
    }
  }, [items]);

  const addToCart = (product: Product, variantId: string, quantity = 1): boolean => {
    const variant = product.variants.find(v => v.id === variantId);
    if (!variant || variant.stock <= 0) {
      return false;
    }

    setItems(prevItems => {
      const existingIdx = prevItems.findIndex(i => i.variantId === variantId);
      if (existingIdx > -1) {
        const currentQty = prevItems[existingIdx].quantity;
        const newQty = Math.min(variant.stock, currentQty + quantity);
        const updated = [...prevItems];
        updated[existingIdx] = { ...updated[existingIdx], quantity: newQty };
        return updated;
      } else {
        const actualQty = Math.min(variant.stock, Math.max(1, quantity));
        return [
          ...prevItems,
          {
            id: `${product.id}_${variant.id}`,
            productId: product.id,
            variantId: variant.id,
            product,
            variant,
            quantity: actualQty,
          },
        ];
      }
    });

    setIsDrawerOpen(true);
    return true;
  };

  const removeFromCart = (variantId: string) => {
    setItems(prev => prev.filter(i => i.variantId !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }

    setItems(prev =>
      prev.map(item => {
        if (item.variantId === variantId) {
          const maxStock = item.variant.stock;
          const safeQty = Math.min(maxStock, quantity);
          return { ...item, quantity: safeQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce((sum, item) => {
    const price = item.product.discountPrice ?? item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        itemCount,
        isDrawerOpen,
        setIsDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
