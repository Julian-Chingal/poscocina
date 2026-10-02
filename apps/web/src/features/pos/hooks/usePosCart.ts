import { useState, useMemo, useCallback } from 'react';
import { CartItem, Product } from '../types/pos.types';

export const usePosCart = (taxRate: number = 0.08) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.product.id === product.id && !item.notes && (!item.modifiers || item.modifiers.length === 0)
      );
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx].quantity += 1;
        return next;
      }
      return [...prev, { product, quantity: 1, notes: '', modifiers: [] }];
    });
  }, []);

  const addCustomizedToCart = useCallback(
    (
      product: Product,
      quantity: number,
      notes: string,
      modifiers: Array<{ modifierId: string; priceDelta: number; name?: string }>
    ) => {
      setCart((prev) => [
        ...prev,
        {
          product,
          quantity: Math.max(1, quantity),
          notes,
          modifiers,
        },
      ]);
    },
    []
  );

  const updateQuantity = useCallback((index: number, delta: number) => {
    setCart((prev) => {
      const next = [...prev];
      const newQty = next[index].quantity + delta;
      if (newQty <= 0) {
        return next.filter((_, i) => i !== index);
      }
      next[index].quantity = newQty;
      return next;
    });
  }, []);

  const updateNotes = useCallback((index: number, notes: string) => {
    setCart((prev) => {
      const next = [...prev];
      next[index].notes = notes;
      return next;
    });
  }, []);

  const updateCartItem = useCallback(
    (
      index: number,
      updates: {
        quantity?: number;
        notes?: string;
        modifiers?: Array<{ modifierId: string; priceDelta: number; name?: string }>;
      }
    ) => {
      setCart((prev) => {
        if (!prev[index]) return prev;
        const next = [...prev];
        next[index] = {
          ...next[index],
          ...(updates.quantity !== undefined ? { quantity: updates.quantity } : {}),
          ...(updates.notes !== undefined ? { notes: updates.notes } : {}),
          ...(updates.modifiers !== undefined ? { modifiers: updates.modifiers } : {}),
        };
        return next;
      });
    },
    []
  );

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const { subtotal, taxTotal, total, itemsCount } = useMemo(() => {
    const sub = cart.reduce((acc, item) => {
      const itemPrice = parseFloat(item.product.price || '0');
      const modsDelta = item.modifiers?.reduce((mAcc, m) => mAcc + (m.priceDelta || 0), 0) || 0;
      return acc + (itemPrice + modsDelta) * item.quantity;
    }, 0);

    const tax = sub * taxRate;
    const count = cart.reduce((acc, item) => acc + item.quantity, 0);

    return {
      subtotal: sub,
      taxTotal: tax,
      total: sub + tax,
      itemsCount: count,
    };
  }, [cart, taxRate]);

  return {
    cart,
    addToCart,
    addCustomizedToCart,
    updateQuantity,
    updateNotes,
    updateCartItem,
    clearCart,
    subtotal,
    taxTotal,
    total,
    itemsCount,
  };
};
