'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Clock, ArrowLeft, Plus, Box, Sparkles, ChefHat } from 'lucide-react';
import { VenuePublicProfile, CatalogCategory, CatalogProduct } from '../../../types/delivery';
import { ProductDetailModal } from '../../../components/modals/ProductDetailModal';
import { useCart } from '../../../context/CartContext';

interface Props {
  venue: VenuePublicProfile;
  categories: CatalogCategory[];
  products: CatalogProduct[];
}

export function RestaurantStorefront({ venue, categories, products }: Props) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | 'all'>('all');
  const [activeProduct, setActiveProduct] = useState<CatalogProduct | null>(null);
  const { addItem } = useCart();

  const formatCOP = (num: number | string) => {
    const val = typeof num === 'string' ? parseFloat(num) : num;
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
  };

  const filteredProducts =
    selectedCategoryId === 'all'
      ? products
      : products.filter((p) => p.categoryId === selectedCategoryId);

  const handleQuickAdd = (e: React.MouseEvent, product: CatalogProduct) => {
    e.stopPropagation();
    const hasModifiers = product.modifierGroups && product.modifierGroups.length > 0;
    if (hasModifiers) {
      setActiveProduct(product);
    } else {
      addItem(product, 1, [], '', venue);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Restaurant Header Banner */}
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver a todas las sedes</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl font-black text-white text-2xl shadow-lg"
                style={{ backgroundColor: venue.primaryColor || '#ea580c' }}
              >
                {venue.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">{venue.name}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                  {venue.address && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-500" />
                      {venue.address}{venue.city ? `, ${venue.city}` : ''}
                    </span>
                  )}
                  {venue.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-slate-500" />
                      {venue.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-orange-400">
                    <Clock className="h-3.5 w-3.5" />
                    25-40 min
                  </span>
                </div>
              </div>
            </div>

            {venue.isPrimary && (
              <span className="self-start sm:self-center rounded-full bg-orange-500/15 border border-orange-500/30 px-3 py-1 text-xs font-bold text-orange-300">
                Sede Principal
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Category Navigation Bar (Sticky) */}
      {categories.length > 0 && (
        <div className="sticky top-[61px] z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar">
              <button
                onClick={() => setSelectedCategoryId('all')}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition ${
                  selectedCategoryId === 'all'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Todos ({products.length})
              </button>

              {categories.map((cat) => {
                const count = products.filter((p) => p.categoryId === cat.id).length;
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-orange-600 text-white shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] opacity-75">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Product Catalog Grid */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center max-w-md mx-auto">
            <ChefHat className="h-12 w-12 text-slate-700 mx-auto" />
            <h3 className="mt-3 font-bold text-slate-200">No hay platos disponibles</h3>
            <p className="mt-1 text-xs text-slate-500">
              Esta categoría aún no cuenta con productos activos para delivery.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => {
              const has3D = !!product.model3dUrl;
              const hasModifiers = product.modifierGroups && product.modifierGroups.length > 0;

              return (
                <div
                  key={product.id}
                  onClick={() => setActiveProduct(product)}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition-all duration-300 hover:border-orange-500/40 hover:bg-slate-900 hover:shadow-lg cursor-pointer"
                >
                  <div>
                    {product.imageUrl && (
                      <div className="relative mb-4 h-40 w-full overflow-hidden rounded-xl bg-slate-800">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {has3D && (
                          <span className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-slate-950/80 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-orange-400 border border-orange-500/30">
                            <Box className="h-3 w-3" />
                            <span>3D</span>
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-white text-base group-hover:text-orange-400 transition">
                        {product.name}
                      </h3>
                      {!product.imageUrl && has3D && (
                        <span className="flex items-center gap-1 rounded-md bg-orange-500/15 border border-orange-500/30 px-2 py-0.5 text-[10px] font-bold text-orange-400">
                          <Box className="h-3 w-3" />
                          <span>3D</span>
                        </span>
                      )}
                    </div>

                    {product.description && (
                      <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3">
                    <div>
                      <span className="block text-base font-black text-orange-400">
                        {formatCOP(product.price)}
                      </span>
                      {hasModifiers && (
                        <span className="text-[10px] text-slate-500">Personalizable</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleQuickAdd(e, product)}
                      className="flex items-center gap-1.5 rounded-xl bg-orange-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-orange-500 transition"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>{hasModifiers ? 'Opciones' : 'Agregar'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Customization Modal */}
      <ProductDetailModal
        product={activeProduct}
        venue={venue}
        onClose={() => setActiveProduct(null)}
      />
    </div>
  );
}
