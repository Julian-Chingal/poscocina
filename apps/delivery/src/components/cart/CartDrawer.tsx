"use client";

import React from "react";
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  UtensilsCrossed,
  Store,
  Clock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useCart } from "../../context/CartContext";

export function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    setIsCheckoutOpen,
    currentVenue,
    items,
    itemCount,
    subtotal,
    total,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  if (!isCartOpen) return null;

  const formatCOP = (num: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(num);

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsCartOpen(false);
      }}
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <aside className="relative flex h-full w-full max-w-md flex-col bg-slate-950 border-l border-slate-800 text-slate-100 shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-800/90 px-5 py-4 bg-slate-900/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-md shadow-orange-600/30">
              <ShoppingBag className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white tracking-tight">
                  Tu Pedido
                </h3>
                <span className="rounded-full bg-orange-500/15 border border-orange-500/30 px-2 py-0.5 text-[10px] font-bold text-orange-400">
                  {itemCount} {itemCount === 1 ? "ítem" : "ítems"}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
            aria-label="Cerrar canasta"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Venue Badge */}
        {currentVenue && (
          <div className="bg-slate-900/50 border-b border-slate-800/80 px-5 py-2.5 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-orange-500/10 text-orange-400 shrink-0">
                <Store className="h-3 w-3" />
              </div>
              <span className="text-slate-400 text-xs shrink-0">Comercio:</span>
              <span className="font-bold text-white truncate max-w-48">
                {currentVenue.restaurantName || currentVenue.name}
              </span>
            </div>

            {items.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 hover:underline cursor-pointer bg-transparent border-none p-0 shrink-0 transition"
              >
                <Trash2 className="h-3 w-3" />
                <span>Vaciar</span>
              </button>
            )}
          </div>
        )}

        {/* Item List / Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 custom-scrollbar">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center py-16 px-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-900 border border-slate-800 text-slate-600 shadow-inner mb-4">
                <ShoppingBag className="h-10 w-10 text-slate-600 stroke-[1.4]" />
              </div>
              <h4 className="font-bold text-slate-200 text-lg">
                Tu canasta está vacía
              </h4>
              <p className="mt-1 text-xs text-slate-400 max-w-xs leading-relaxed">
                Explora los deliciosos platos y bebidas de{" "}
                <span className="text-orange-400 font-semibold">
                  {currentVenue?.name || "nuestros comercios"}
                </span>{" "}
                y pide con entrega rápida.
              </p>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-600/25 transition cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Explorar Carta</span>
              </button>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group relative flex flex-col gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3.5 hover:border-slate-700 hover:bg-slate-900/90 transition-all shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3 w-full">
                    {/* Thumbnail + Details */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-13 w-13 rounded-xl object-cover bg-slate-800 border border-slate-700/60 shrink-0"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 text-orange-400 border border-orange-500/20 shrink-0">
                          <UtensilsCrossed className="h-5 w-5" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-white capitalize leading-snug truncate">
                          {item.name}
                        </h4>

                        {/* Modifiers Chips */}
                        {item.modifiers.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {item.modifiers.map((m, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center rounded-md bg-slate-800/90 px-1.5 py-0.5 text-[10px] font-medium text-slate-300 border border-slate-700/60"
                              >
                                +{m.name}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Notes */}
                        {item.notes && (
                          <p className="mt-1 text-[11px] italic text-amber-300/80 line-clamp-1">
                            "{item.notes}"
                          </p>
                        )}

                        {/* Price */}
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-sm font-black text-orange-400">
                            {formatCOP(item.totalItemPrice)}
                          </span>
                          {item.quantity > 1 && (
                            <span className="text-[11px] text-slate-500">
                              ({formatCOP(item.unitPrice)} c/u)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Delete Item Button */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-500/15 hover:text-rose-400 transition cursor-pointer"
                      title="Eliminar producto"
                      aria-label="Eliminar producto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Quantity Controls Bar */}
                  <div className="flex items-center justify-between border-t border-slate-800/70 pt-2.5">
                    <span className="text-[11px] text-slate-400 font-medium">
                      Cantidad
                    </span>

                    <div className="flex items-center gap-1 rounded-xl border border-slate-700/80 bg-slate-950 p-0.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                        aria-label="Disminuir cantidad"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-7 text-center text-xs font-black text-white select-none">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Delivery Guarantee / Info Card (fills empty space with useful info) */}
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-3.5 space-y-2.5 mt-4">
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-500/15 text-orange-400 shrink-0">
                    <Clock className="h-3.5 w-3.5" />
                  </div>
                  <span>
                    Tiempo estimado:{" "}
                    <strong className="text-white font-bold">25 - 40 min</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-400">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </div>
                  <span>
                    Pedido sincronizado en tiempo real con la cocina.
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <footer className="border-t border-slate-800 bg-slate-950 px-5 py-4 space-y-3 w-full shrink-0">
            <div className="space-y-1.5 text-xs text-slate-400 w-full">
              <div className="flex justify-between items-center text-slate-400 text-xs">
                <span>
                  Subtotal ({itemCount}{" "}
                  {itemCount === 1 ? "producto" : "productos"})
                </span>
                <span className="font-semibold text-slate-200">
                  {formatCOP(subtotal)}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400 text-xs">
                <span>Costo de envío</span>
                <span className="text-emerald-400 font-medium">
                  Calculado en checkout
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-800/80 pt-2 text-base font-bold text-white">
                <span className="font-black text-white">Total a Pagar</span>
                <span className="font-black text-lg text-orange-400">
                  {formatCOP(total)}
                </span>
              </div>
            </div>

            {/* Confirm Order Button - 100% Horizontal! */}
            <button
              type="button"
              onClick={handleProceedToCheckout}
              className="w-full flex items-center justify-between rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 py-3.5 px-5 font-bold text-white shadow-xl shadow-orange-600/25 active:scale-[0.99] transition cursor-pointer"
            >
              <span className="font-extrabold text-sm tracking-wide">
                Confirmar Pedido
              </span>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm bg-black/25 px-2.5 py-1 rounded-xl">
                  {formatCOP(total)}
                </span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </button>
          </footer>
        )}
      </aside>
    </div>
  );
}
