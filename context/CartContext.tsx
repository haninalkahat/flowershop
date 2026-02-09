'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  imageUrl?: string; // Deprecated, keep for backward compatibility if needed temporarily
  originalPrice: number;
  discountPrice: number | null;
  flowerType: string;
  stemLength?: number;
  colors?: string[];
  colorImages?: Record<string, string>;
  // New fields
  height?: string;
  origin?: string;
  freshness?: string;
  variants?: any[]; // Simplified for now to avoid circular dependencies or complex type imports
  // Localized fields
  name_tr?: string | null;
  name_en?: string | null;
  name_ar?: string | null;
  description_tr?: string | null;
  description_en?: string | null;
  description_ar?: string | null;
}

interface CartItem extends Product {
  quantity: number;
  selectedColor?: string;
}

export interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product & { selectedColor?: string }, quantity: number) => void;
  removeFromCart: (productId: string, selectedColor?: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number, selectedColor?: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const auth = useAuth();
  const user = auth?.user || null;

  // Load cart on mount or when user changes
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        // User just logged in - merge guest cart with user cart
        const guestCartStr = localStorage.getItem('cart');
        let guestCart: CartItem[] = guestCartStr ? JSON.parse(guestCartStr) : [];

        // Sanitize guest cart to handle potential NaN values from previous bugs
        guestCart = guestCart.map(item => ({
          ...item,
          quantity: Number.isNaN(Number(item.quantity)) ? 1 : Number(item.quantity)
        }));

        try {
          // Fetch user's saved cart from database
          const res = await fetch('/api/cart');
          const data = await res.json();
          const userCart: CartItem[] = data.cart || [];


          // Merge logic: combine guest cart with user cart
          if (guestCart.length > 0) {
            // For each guest cart item, add or merge with user cart
            for (const guestItem of guestCart) {
              const existingItem = userCart.find(item =>
                item.id === guestItem.id && item.selectedColor === guestItem.selectedColor
              );

              if (existingItem) {
                // Item exists in both - update quantity
                await fetch('/api/cart', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    productId: guestItem.id,
                    quantity: existingItem.quantity + guestItem.quantity,
                    selectedColor: guestItem.selectedColor
                  })
                });
              } else {
                // Item only in guest cart - add to user cart
                await fetch('/api/cart', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    productId: guestItem.id,
                    quantity: guestItem.quantity,
                    selectedColor: guestItem.selectedColor
                  })
                });
              }
            }

            // Clear guest cart from localStorage
            localStorage.removeItem('cart');

            // Fetch updated cart from server
            const updatedRes = await fetch('/api/cart');
            const updatedData = await updatedRes.json();
            setCart(updatedData.cart || []);
          } else {
            // No guest cart, just use user cart
            setCart(userCart);
          }
        } catch (err) {
          console.error("Failed to fetch/merge cart", err);
        }
      } else {
        // Not logged in - load from localStorage
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
          const parsedCart: CartItem[] = JSON.parse(storedCart);
          // Sanitize
          const validCart = parsedCart.map(item => ({
            ...item,
            quantity: Number.isNaN(Number(item.quantity)) ? 1 : Number(item.quantity)
          }));
          setCart(validCart);
        } else {
          setCart([]);
        }
      }
    };

    loadCart();
  }, [user]);

  // Sync to local storage only if NOT logged in
  useEffect(() => {
    if (!user && cart.length >= 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, user]);

  const addToCart = async (product: Product & { selectedColor?: string }, quantity: number) => {
    // Optimistic update
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) =>
        item.id === product.id && item.selectedColor === product.selectedColor
      );
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id && item.selectedColor === product.selectedColor
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity, selectedColor: product.selectedColor }];
      }
    });

    if (user) {
      try {
        await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product.id,
            quantity,
            selectedColor: product.selectedColor
          })
        });
      } catch (err) {
        console.error("Failed to sync add to cart", err);
      }
    }
  };

  const removeFromCart = async (productId: string, selectedColor?: string) => {
    setCart((prevCart) => prevCart.filter((item) =>
      !(item.id === productId && item.selectedColor === selectedColor)
    ));

    if (user) {
      await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, selectedColor })
      });
    }
  };

  const updateCartItemQuantity = async (productId: string, quantity: number, selectedColor?: string) => {
    const newQuantity = Math.max(1, quantity);
    setCart((prevCart) =>
      prevCart.map((item) =>
        (item.id === productId && item.selectedColor === selectedColor)
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
    if (user) {
      await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: newQuantity, selectedColor })
      });
    }
  };

  const clearCart = () => {
    setCart([]);
    if (!user) {
      localStorage.removeItem('cart');
    }
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const price = item.discountPrice !== null ? item.discountPrice : item.originalPrice;
      return total + price * item.quantity;
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
