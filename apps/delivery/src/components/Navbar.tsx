'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, MapPin, Store, Sparkles, Building2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

export function Navbar() {
  const { currentVenue, itemCount, total, setIsCartOpen } = useCart();

  const formatCOP = (num: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(num);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 transition hover:opacity-95">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-md shadow-orange-600/30">
            <ShoppingBag className="h-5 w-5 text-white" />
          </div>
          <div className="flex items-center">
            <span className="text-xl font-black tracking-tight text-white">Pallevar</span>
            <span className="ml-1.5 rounded-md bg-orange-500/15 border border-orange-500/30 px-1.5 py-0.5 text-[10px] font-bold text-orange-400">
              DELIVERY
            </span>
          </div>
        </Link>

        {/* Center: Current Store or Directory Link */}
        <div className="hidden md:flex items-center gap-4">
          {currentVenue ? (
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/80 px-3.5 py-1.5 text-xs text-slate-300 hover:border-orange-500/50 hover:text-white transition"
              title="Cambiar de comercio"
            >
              <Store className="h-3.5 w-3.5 text-orange-400" />
              <span>Negocio: <strong className="text-white">{currentVenue.name}</strong></span>
              <span className="text-[10px] text-slate-500 underline ml-1">Cambiar</span>
            </Link>
          ) : (
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-orange-400 transition"
            >
              <MapPin className="h-3.5 w-3.5 text-orange-400" />
              <span>Directorio de Negocios</span>
            </Link>
          )}

          <Link
            href="/para-negocios"
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-orange-400 transition"
          >
            <Building2 className="h-3.5 w-3.5 text-slate-500" />
            <span>¿Tienes un negocio?</span>
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/para-negocios"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 text-xs font-bold text-orange-300 hover:bg-orange-500/20 hover:text-white transition"
          >
            <Sparkles className="h-3.5 w-3.5 text-orange-400" />
            <span>Vende en Pallevar</span>
          </Link>

          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:border-orange-500/50 hover:bg-slate-800 transition"
          >
            <div className="relative">
              <ShoppingBag className="h-4 w-4 text-orange-500" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-[10px] font-bold text-white shadow-sm">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="hidden xs:inline">Canasta</span>
            {itemCount > 0 && (
              <>
                <span className="text-slate-600">•</span>
                <span className="font-bold text-orange-400">{formatCOP(total)}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
