'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, CartModifierSelection, VenuePublicProfile } from '../types/delivery';

interface CartContextType {
  currentVenue: VenuePublicProfile | null;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  taxTotal: number;
  total: number;
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  addItem: (
    product: { id: string; name: string; price: number | string },
    quantity: number,
    modifiers: CartModifierSelection[],
    notes: string,
    venue: VenuePublicProfile
  ) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [currentVenue, setCurrentVenue] = useState<VenuePublicProfile | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedVenue = localStorage.getItem('poscocina_delivery_venue');
      const savedCart = localStorage.getItem('poscocina_delivery_cart');
      if (savedVenue) setCurrentVenue(JSON.parse(savedVenue));
      if (savedCart) setItems(JSON.parse(savedCart));
    } catch (e) {
      console.warn('Failed to parse delivery cart from localStorage', e);
    }
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    try {
      if (currentVenue) {
        localStorage.setItem('poscocina_delivery_venue', JSON.stringify(currentVenue));
      } else {
        localStorage.removeItem('poscocina_delivery_venue');
      }
      localStorage.setItem('poscocina_delivery_cart', JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save delivery cart to localStorage', e);
    }
  }, [currentVenue, items]);

  const addItem = (
    product: { id: string; name: string; price: number | string },
    quantity: number,
    modifiers: CartModifierSelection[],
    notes: string,
    venue: VenuePublicProfile
  ) => {
    // Check if venue changed
    if (currentVenue && currentVenue.id !== venue.id && items.length > 0) {
      const confirmChange = window.confirm(
        `Tu carrito tiene productos de "${currentVenue.name}". ¿Deseas vaciar el carrito para pedir en "${venue.name}"?`
      );
      if (!confirmChange) return;
      setItems([]);
    }

    setCurrentVenue(venue);

    const basePrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    const modsSum = modifiers.reduce((acc, m) => acc + (m.priceDelta || 0), 0);
    const unitPrice = basePrice + modsSum;
    const totalItemPrice = unitPrice * quantity;

    // Generate deterministic ID based on productId + modifiers + notes
    const modKey = modifiers.map((m) => m.modifierId).sort().join('-');
    const cartItemId = `${product.id}_${modKey}_${notes.trim().toLowerCase()}`;

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        const existing = updated[existingIndex];
        const newQty = existing.quantity + quantity;
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          totalItemPrice: existing.unitPrice * newQty,
        };
        return updated;
      }
      return [
        ...prev,
        {
          id: cartItemId,
          productId: product.id,
          name: product.name,
          unitPrice,
          quantity,
          notes: notes.trim() || undefined,
          modifiers,
          totalItemPrice,
        },
      ];
    });

    setIsCartOpen(true);
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              totalItemPrice: item.unitPrice * newQty,
            };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.totalItemPrice, 0);
  const taxRate = currentVenue?.taxRate || 0.08;
  const taxTotal = subtotal * taxRate;
  const total = subtotal + taxTotal;

  return (
    <CartContext.Provider
      value={{
        currentVenue,
        items,
        itemCount,
        subtotal,
        taxTotal,
        total,
        isCartOpen,
        isCheckoutOpen,
        setIsCartOpen,
        setIsCheckoutOpen,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
