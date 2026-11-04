'use client';

import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    setIsCheckoutOpen,
    currentVenue,
    items,
    itemCount,
    subtotal,
    taxTotal,
    total,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  if (!isCartOpen) return null;

  const formatCOP = (num: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(num);

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex h-full w-full max-w-md flex-col bg-slate-900 border-l border-slate-800 text-slate-100 shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-orange-500" />
            <h3 className="font-bold text-lg text-white">Tu Pedido ({itemCount})</h3>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Venue Badge */}
        {currentVenue && (
          <div className="bg-slate-950/70 border-b border-slate-800/80 px-6 py-2.5 flex items-center justify-between text-xs">
            <span className="text-slate-400">Sede de entrega:</span>
            <span className="font-semibold text-orange-400 truncate max-w-[200px]">{currentVenue.name}</span>
          </div>
        )}

        {/* Item List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-slate-800/60">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center py-12">
              <ShoppingBag className="h-16 w-16 text-slate-700 stroke-[1.2]" />
              <p className="mt-4 font-semibold text-slate-300 text-base">Tu canasta está vacía</p>
              <p className="mt-1 text-xs text-slate-500">Explora la carta y agrega tus platos favoritos</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white">{item.name}</h4>
                    {item.modifiers.length > 0 && (
                      <p className="mt-0.5 text-xs text-slate-400">
                        {item.modifiers.map((m) => m.name).join(', ')}
                      </p>
                    )}
                    {item.notes && (
                      <p className="mt-1 text-[11px] italic text-orange-300/80">"{item.notes}"</p>
                    )}
                    <span className="mt-2 block text-sm font-bold text-orange-400">
                      {formatCOP(item.totalItemPrice)}
                    </span>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="rounded p-1 text-slate-400 hover:text-white transition"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="rounded p-1 text-slate-400 hover:text-white transition"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 text-slate-500 hover:text-red-400 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-slate-800 bg-slate-950/90 px-6 py-4 space-y-3">
            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-slate-200">{formatCOP(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Impoconsumo (INC {((currentVenue?.taxRate || 0.08) * 100).toFixed(0)}%)</span>
                <span className="font-medium text-slate-200">{formatCOP(taxTotal)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2 text-base font-bold text-white">
                <span>Total a Pagar</span>
                <span className="text-orange-500 font-black">{formatCOP(total)}</span>
              </div>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-3.5 font-bold text-white shadow-lg shadow-orange-600/30 hover:bg-orange-500 transition text-sm"
            >
              <span>Confirmar Pedido</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
