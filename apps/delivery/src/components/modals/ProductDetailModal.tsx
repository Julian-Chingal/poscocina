'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus, Minus, Check, Sparkles, CheckCircle2 } from 'lucide-react';
import {
  CatalogProduct,
  CatalogModifierGroup,
  CartModifierSelection,
  VenuePublicProfile,
} from '../../types/delivery';
import { useCart } from '../../context/CartContext';
import { sileo } from 'sileo';

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

  // Normalize modifier groups from server payload (handles both flattened and pivot-wrapped shapes)
  const groups: CatalogModifierGroup[] = useMemo(() => {
    if (!product?.modifierGroups || !Array.isArray(product.modifierGroups)) return [];
    return product.modifierGroups
      .map((item: any) => {
        if (!item) return null;
        if (item.modifierGroup) {
          return {
            ...item.modifierGroup,
            isRequired: item.isRequired ?? item.modifierGroup.isRequired ?? false,
            sortOrder: item.sortOrder ?? item.modifierGroup.sortOrder ?? 0,
            modifiers: item.modifierGroup.modifiers || [],
          };
        }
        return {
          ...item,
          modifiers: item.modifiers || [],
        };
      })
      .filter(
        (g): g is CatalogModifierGroup =>
          Boolean(g && g.id && Array.isArray(g.modifiers) && g.modifiers.length > 0)
      )
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [product]);

  // Pre-select default modifiers whenever product or groups change
  useEffect(() => {
    if (!product) return;
    const initial: Record<string, CartModifierSelection[]> = {};

    groups.forEach((group) => {
      const activeMods = (group.modifiers || []).filter((m) => m.isAvailable !== false);
      const defaults = activeMods.filter((m) => m.isDefault);

      if (defaults.length > 0) {
        if (group.selectionType === 'single') {
          const first = defaults[0];
          const delta = typeof first.priceDelta === 'string' ? parseFloat(first.priceDelta) : first.priceDelta;
          initial[group.id] = [
            {
              modifierId: first.id,
              name: first.name,
              priceDelta: delta || 0,
            },
          ];
        } else {
          initial[group.id] = defaults.map((m) => {
            const delta = typeof m.priceDelta === 'string' ? parseFloat(m.priceDelta) : m.priceDelta;
            return {
              modifierId: m.id,
              name: m.name,
              priceDelta: delta || 0,
            };
          });
        }
      } else {
        initial[group.id] = [];
      }
    });

    setSelectedModifiers(initial);
    setQuantity(1);
    setNotes('');
  }, [product, groups]);

  if (!product) return null;

  const basePrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;

  // Single select handler: Mutuamente Excluyente (Radio behavior)
  const handleSingleSelect = (
    group: CatalogModifierGroup,
    modifier: { id: string; name: string; priceDelta: string | number }
  ) => {
    const delta = typeof modifier.priceDelta === 'string' ? parseFloat(modifier.priceDelta) : modifier.priceDelta;
    const current = selectedModifiers[group.id] || [];
    const isAlreadySelected = current.some((m) => m.modifierId === modifier.id);

    // If it's already selected and the group is optional, allow unchecking
    if (isAlreadySelected && !group.isRequired) {
      setSelectedModifiers((prev) => ({
        ...prev,
        [group.id]: [],
      }));
      return;
    }

    setSelectedModifiers((prev) => ({
      ...prev,
      [group.id]: [{ modifierId: modifier.id, name: modifier.name, priceDelta: delta || 0 }],
    }));
  };

  // Multiple select handler: Incluyente (Checkbox / Additions behavior)
  const handleMultipleSelect = (
    group: CatalogModifierGroup,
    modifier: { id: string; name: string; priceDelta: string | number }
  ) => {
    const delta = typeof modifier.priceDelta === 'string' ? parseFloat(modifier.priceDelta) : modifier.priceDelta;
    const current = selectedModifiers[group.id] || [];
    const exists = current.some((m) => m.modifierId === modifier.id);

    if (exists) {
      setSelectedModifiers((prev) => ({
        ...prev,
        [group.id]: current.filter((m) => m.modifierId !== modifier.id),
      }));
    } else {
      if (group.maxSelections && current.length >= group.maxSelections) {
        sileo.warning({
          title: 'Límite de opciones alcanzado',
          description: `Solo puedes seleccionar hasta ${group.maxSelections} opciones en "${group.name}".`,
        });
        return;
      }

      setSelectedModifiers((prev) => ({
        ...prev,
        [group.id]: [...current, { modifierId: modifier.id, name: modifier.name, priceDelta: delta || 0 }],
      }));
    }
  };

  const allSelectedModifiers = Object.values(selectedModifiers).flat();
  const modifiersTotal = allSelectedModifiers.reduce((acc, m) => acc + (m.priceDelta || 0), 0);
  const unitPrice = basePrice + modifiersTotal;
  const totalPrice = unitPrice * quantity;

  // Validation: find first unsatisfied required modifier group
  const missingRequiredGroup = groups.find((group) => {
    if (!group.isRequired) return false;
    const selected = selectedModifiers[group.id] || [];
    const minNeeded = group.minSelections && group.minSelections > 0 ? group.minSelections : 1;
    return selected.length < minNeeded;
  });

  const handleAddToCart = () => {
    if (venue.isOpen === false) {
      sileo.warning({
        title: 'Comercio cerrado',
        description: `El comercio no está recibiendo pedidos en este momento.${
          venue.openingHours ? ` Horario de atención: ${venue.openingHours}` : ''
        }`,
      });
      return;
    }

    if (missingRequiredGroup) {
      sileo.warning({
        title: 'Opción obligatoria requerida',
        description: `Por favor selecciona al menos una opción en "${missingRequiredGroup.name}".`,
      });
      return;
    }

    addItem(product, quantity, allSelectedModifiers, notes, venue);
    sileo.success({
      title: 'Producto agregado',
      description: `${quantity}x ${product.name} en tu canasta`,
    });
    onClose();
  };

  const formatCOP = (num: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(num);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/90 px-6 py-4 bg-slate-900/80 backdrop-blur-md">
          <div className="pr-4">
            <h3 className="text-lg font-bold text-white line-clamp-1">{product.name}</h3>
            {product.category?.name && (
              <span className="text-xs text-slate-400 font-medium">{product.category.name}</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-6 py-5 space-y-6 flex-1 custom-scrollbar">
          {product.imageUrl && (
            <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-slate-800 border border-slate-800 shadow-inner">
              <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
            </div>
          )}

          {/* Pricing & Description */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-0.5">
                  Precio base
                </span>
                <span className="text-2xl font-black text-orange-400">{formatCOP(basePrice)}</span>
              </div>
              {product.prepTimeMin && (
                <span className="text-xs font-semibold text-slate-300 bg-slate-800/90 border border-slate-700/60 px-3 py-1 rounded-full">
                  ⏱️ {product.prepTimeMin} min aprox.
                </span>
              )}
            </div>
            {product.description && (
              <p className="mt-3 text-sm leading-relaxed text-slate-300 border-t border-slate-800/80 pt-3">
                {product.description}
              </p>
            )}
          </div>

          {/* Modifier Groups: Incluyentes & Excluyentes */}
          {groups.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-orange-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Opciones & Toppings
                </h4>
              </div>

              {groups.map((group) => {
                const isSingle = group.selectionType === 'single';
                const selectedInGroup = selectedModifiers[group.id] || [];
                const activeMods = (group.modifiers || []).filter((m) => m.isAvailable !== false);

                return (
                  <div
                    key={group.id}
                    className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4 transition-colors hover:border-slate-700/80"
                  >
                    {/* Group Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h5 className="font-bold text-slate-100 text-sm">{group.name}</h5>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {isSingle
                            ? 'Selección única (Excluyente) • Elige 1 opción'
                            : group.maxSelections
                            ? `Selección múltiple (Incluyente) • Hasta ${group.maxSelections} opciones`
                            : 'Selección múltiple (Incluyente) • Elige las que desees'}
                        </p>
                      </div>

                      {group.isRequired ? (
                        <span className="shrink-0 text-[10px] font-bold text-orange-400 uppercase tracking-wider bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 rounded-full">
                          Obligatorio
                        </span>
                      ) : (
                        <span className="shrink-0 text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full">
                          Opcional
                        </span>
                      )}
                    </div>

                    {/* Modifiers List */}
                    <div className="space-y-2">
                      {activeMods.map((mod) => {
                        const isSelected = selectedInGroup.some((m) => m.modifierId === mod.id);
                        const delta =
                          typeof mod.priceDelta === 'string'
                            ? parseFloat(mod.priceDelta)
                            : mod.priceDelta || 0;

                        return (
                          <button
                            type="button"
                            key={mod.id}
                            onClick={() =>
                              isSingle
                                ? handleSingleSelect(group, mod)
                                : handleMultipleSelect(group, mod)
                            }
                            className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-sm transition text-left ${
                              isSelected
                                ? 'bg-orange-500/15 border border-orange-500/50 text-orange-100 shadow-sm'
                                : 'bg-slate-900/80 hover:bg-slate-800/80 text-slate-300 border border-slate-800/80'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {/* Selection Indicator: Circle for Excluyente (Single), Square for Incluyente (Multiple) */}
                              <div
                                className={`flex h-4 w-4 shrink-0 items-center justify-center ${
                                  isSingle ? 'rounded-full' : 'rounded-md'
                                } border transition ${
                                  isSelected
                                    ? 'border-orange-500 bg-orange-500 text-white'
                                    : 'border-slate-600 bg-slate-950/80'
                                }`}
                              >
                                {isSelected && (
                                  isSingle ? (
                                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                  ) : (
                                    <Check className="h-3 w-3 stroke-[3]" />
                                  )
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{mod.name}</span>
                                {mod.isDefault && (
                                  <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                                    Base
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              {delta > 0 ? (
                                <span className="text-xs font-bold text-orange-400">
                                  +{formatCOP(delta)}
                                </span>
                              ) : delta < 0 ? (
                                <span className="text-xs font-semibold text-rose-400">
                                  -{formatCOP(Math.abs(delta))}
                                </span>
                              ) : (
                                <span className="text-[11px] text-slate-500 font-medium">
                                  Sin costo
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Special Notes for Kitchen */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Notas para la Cocina (Opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Término medio, sin cebolla, salsa tártara aparte..."
              className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition"
              rows={2}
              maxLength={255}
            />
          </div>
        </div>

        {/* Footer with Quantity & Total */}
        <div className="border-t border-slate-800/90 bg-slate-900/95 px-6 py-4 flex items-center justify-between gap-4">
          {/* Quantity Controls */}
          <div className="flex items-center rounded-2xl border border-slate-800 bg-slate-950 p-1">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="rounded-xl p-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition"
              aria-label="Disminuir cantidad"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center font-bold text-white text-sm select-none">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="rounded-xl p-2 text-slate-400 hover:text-white transition"
              aria-label="Aumentar cantidad"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Add to Cart CTA */}
          <button
            onClick={handleAddToCart}
            disabled={venue.isOpen === false}
            className="flex-1 rounded-2xl bg-orange-600 py-3.5 px-5 font-bold text-white shadow-lg shadow-orange-600/30 hover:bg-orange-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition text-sm flex items-center justify-between"
          >
            <span>{venue.isOpen === false ? 'Comercio Cerrado' : 'Agregar a la canasta'}</span>
            <span className="font-extrabold text-orange-100">{formatCOP(totalPrice)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
