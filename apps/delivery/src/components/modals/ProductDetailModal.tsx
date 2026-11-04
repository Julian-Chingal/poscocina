'use client';

import React, { useState } from 'react';
import { X, Plus, Minus, Check, Sparkles } from 'lucide-react';
import { CatalogProduct, CartModifierSelection, VenuePublicProfile } from '../../types/delivery';
import { useCart } from '../../context/CartContext';

interface Props {
  product: CatalogProduct | null;
  venue: VenuePublicProfile;
  onClose: () => void;
}

export function ProductDetailModal({ product, venue, onClose }: Props) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, CartModifierSelection[]>>({});
  const [notes, setNotes] = useState('');

  if (!product) return null;

  const basePrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;

  const handleSingleSelect = (groupId: string, modifier: { id: string; name: string; priceDelta: string | number }) => {
    const delta = typeof modifier.priceDelta === 'string' ? parseFloat(modifier.priceDelta) : modifier.priceDelta;
    setSelectedModifiers((prev) => ({
      ...prev,
      [groupId]: [{ modifierId: modifier.id, name: modifier.name, priceDelta: delta || 0 }],
    }));
  };

  const handleMultipleSelect = (groupId: string, modifier: { id: string; name: string; priceDelta: string | number }) => {
    const delta = typeof modifier.priceDelta === 'string' ? parseFloat(modifier.priceDelta) : modifier.priceDelta;
    setSelectedModifiers((prev) => {
      const current = prev[groupId] || [];
      const exists = current.some((m) => m.modifierId === modifier.id);
      if (exists) {
        return {
          ...prev,
          [groupId]: current.filter((m) => m.modifierId !== modifier.id),
        };
      }
      return {
        ...prev,
        [groupId]: [...current, { modifierId: modifier.id, name: modifier.name, priceDelta: delta || 0 }],
      };
    });
  };

  const allSelectedModifiers = Object.values(selectedModifiers).flat();
  const modifiersTotal = allSelectedModifiers.reduce((acc, m) => acc + (m.priceDelta || 0), 0);
  const unitPrice = basePrice + modifiersTotal;
  const totalPrice = unitPrice * quantity;

  // Validation: check if required modifier groups are fulfilled
  const groups = product.modifierGroups?.map((g) => g.modifierGroup).filter(Boolean) || [];
  const missingRequired = groups.some((group) => {
    if (!group.isRequired) return false;
    const selected = selectedModifiers[group.id] || [];
    return selected.length < (group.minSelections || 1);
  });

  const handleAddToCart = () => {
    if (missingRequired) return;
    addItem(product, quantity, allSelectedModifiers, notes, venue);
    onClose();
  };

  const formatCOP = (num: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(num);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <h3 className="text-lg font-bold text-white line-clamp-1">{product.name}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 py-4 space-y-6 flex-1">
          {product.imageUrl && (
            <div className="relative h-48 w-full overflow-hidden rounded-xl bg-slate-800">
              <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
            </div>
          )}

          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-orange-500">{formatCOP(basePrice)}</span>
              {product.prepTimeMin && (
                <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">
                  ⏱️ {product.prepTimeMin} min aprox.
                </span>
              )}
            </div>
            {product.description && (
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{product.description}</p>
            )}
          </div>

          {/* Modifier Groups */}
          {groups.map((group) => {
            const isSingle = group.selectionType === 'single';
            const selectedInGroup = selectedModifiers[group.id] || [];

            return (
              <div key={group.id} className="rounded-xl border border-slate-800 bg-slate-800/40 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-200 text-sm">{group.name}</h4>
                  {group.isRequired ? (
                    <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider bg-orange-500/10 px-2 py-0.5 rounded">
                      Obligatorio
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">Opcional</span>
                  )}
                </div>

                <div className="space-y-2">
                  {group.modifiers.map((mod) => {
                    const isSelected = selectedInGroup.some((m) => m.modifierId === mod.id);
                    const delta = typeof mod.priceDelta === 'string' ? parseFloat(mod.priceDelta) : mod.priceDelta;

                    return (
                      <button
                        type="button"
                        key={mod.id}
                        onClick={() =>
                          isSingle ? handleSingleSelect(group.id, mod) : handleMultipleSelect(group.id, mod)
                        }
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition ${
                          isSelected
                            ? 'bg-orange-500/15 border border-orange-500/40 text-orange-200'
                            : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`flex h-4 w-4 items-center justify-center rounded-${
                              isSingle ? 'full' : 'md'
                            } border ${
                              isSelected ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-600'
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <span>{mod.name}</span>
                        </div>
                        {delta > 0 && (
                          <span className="text-xs font-semibold text-orange-400">+{formatCOP(delta)}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Notas para la Cocina (Opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Término medio, sin cebolla, aderezo aparte..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              rows={2}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 bg-slate-900/90 px-6 py-4 flex items-center justify-between gap-4">
          {/* Quantity Selector */}
          <div className="flex items-center rounded-xl border border-slate-700 bg-slate-800/80 p-1">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="rounded-lg p-2 text-slate-400 hover:text-white disabled:opacity-40 transition"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center font-bold text-white text-sm">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="rounded-lg p-2 text-slate-400 hover:text-white transition"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Submit */}
          <button
            onClick={handleAddToCart}
            disabled={missingRequired}
            className="flex-1 rounded-xl bg-orange-600 py-3 px-4 font-bold text-white shadow-lg shadow-orange-600/30 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm flex items-center justify-center gap-2"
          >
            <span>Agregar</span>
            <span>•</span>
            <span>{formatCOP(totalPrice)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
