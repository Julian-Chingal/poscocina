'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus, Minus, Check, Sparkles } from 'lucide-react';
import {
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Badge,
  Card,
  TextArea,
} from '@astryxdesign/core';
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
      } else if (group.isRequired && group.selectionType === 'single' && activeMods.length > 0) {
        // Automatically select first available option for mandatory single-choice groups
        const first = activeMods[0];
        const delta = typeof first.priceDelta === 'string' ? parseFloat(first.priceDelta) : first.priceDelta;
        initial[group.id] = [
          {
            modifierId: first.id,
            name: first.name,
            priceDelta: delta || 0,
          },
        ];
      }
    });

    setSelectedModifiers(initial);
    setQuantity(1);
    setNotes('');
  }, [product, groups]);

  if (!product) return null;

  const formatCOP = (num: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(num);

  const basePrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;

  // Single select (excluyente: radio behavior)
  const handleSingleSelect = (group: CatalogModifierGroup, modifier: any) => {
    const delta = typeof modifier.priceDelta === 'string' ? parseFloat(modifier.priceDelta) : modifier.priceDelta;
    setSelectedModifiers((prev) => ({
      ...prev,
      [group.id]: [
        {
          modifierId: modifier.id,
          name: modifier.name,
          priceDelta: delta || 0,
        },
      ],
    }));
  };

  // Multiple select (incluyente: checkbox behavior with max limit support)
  const handleMultipleSelect = (group: CatalogModifierGroup, modifier: any) => {
    const delta = typeof modifier.priceDelta === 'string' ? parseFloat(modifier.priceDelta) : modifier.priceDelta;
    const currentList = selectedModifiers[group.id] || [];
    const exists = currentList.some((m) => m.modifierId === modifier.id);

    if (exists) {
      // Toggle off
      setSelectedModifiers((prev) => ({
        ...prev,
        [group.id]: currentList.filter((m) => m.modifierId !== modifier.id),
      }));
    } else {
      // Check max allowed selections
      if (group.maxSelections && currentList.length >= group.maxSelections) {
        sileo.warning({
          title: 'Límite alcanzado',
          description: `Solo puedes seleccionar hasta ${group.maxSelections} opciones en "${group.name}".`,
        });
        return;
      }

      setSelectedModifiers((prev) => ({
        ...prev,
        [group.id]: [
          ...currentList,
          {
            modifierId: modifier.id,
            name: modifier.name,
            priceDelta: delta || 0,
          },
        ],
      }));
    }
  };

  // Calculate total unit price including modifier deltas
  const modifierTotal = Object.values(selectedModifiers)
    .flat()
    .reduce((sum, mod) => sum + (mod.priceDelta || 0), 0);

  const unitPrice = Math.max(0, basePrice + modifierTotal);
  const totalPrice = unitPrice * quantity;

  // Validate required groups before adding to cart
  const validateMandatoryGroups = (): boolean => {
    for (const group of groups) {
      if (group.isRequired) {
        const selections = selectedModifiers[group.id] || [];
        if (selections.length === 0) {
          sileo.error({
            title: 'Opción obligatoria requerida',
            description: `Por favor selecciona al menos una opción en "${group.name}".`,
          });
          return false;
        }
      }
    }
    return true;
  };

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

    if (!validateMandatoryGroups()) return;

    const flattenedModifiers = Object.values(selectedModifiers).flat();
    addItem(product, quantity, flattenedModifiers, notes, venue);

    sileo.success({
      title: '¡Agregado a la canasta!',
      description: `${quantity}x ${product.name} listo en tu pedido.`,
    });

    onClose();
  };

  return (
    <VStack className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <VStack className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <HStack className="flex items-center justify-between border-b border-slate-800/90 px-6 py-4 bg-slate-900/80 backdrop-blur-md w-full">
          <VStack className="pr-4">
            <Heading level={3} className="text-lg font-bold text-white line-clamp-1">{product.name}</Heading>
            {product.category?.name && (
              <Text className="text-xs text-slate-400 font-medium">{product.category.name}</Text>
            )}
          </VStack>
          <Button
            label="Cerrar modal"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </Button>
        </HStack>

        {/* Scrollable Content */}
        <VStack className="overflow-y-auto px-6 py-5 space-y-6 flex-1 custom-scrollbar w-full">
          {product.imageUrl && (
            <VStack className="relative h-48 w-full overflow-hidden rounded-2xl bg-slate-800 border border-slate-800 shadow-inner">
              <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
            </VStack>
          )}

          {/* Pricing & Description */}
          <Card className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4 w-full">
            <HStack className="flex items-baseline justify-between w-full">
              <VStack>
                <Text weight="bold" className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-0.5">
                  Precio base
                </Text>
                <Text weight="bold" className="text-2xl font-black text-orange-400">{formatCOP(basePrice)}</Text>
              </VStack>
              {product.prepTimeMin && (
                <Badge
                  label={`⏱️ ${product.prepTimeMin} min aprox.`}
                  className="text-xs font-semibold text-slate-300 bg-slate-800/90 border border-slate-700/60 px-3 py-1 rounded-full"
                />
              )}
            </HStack>
            {product.description && (
              <Text className="mt-3 text-sm leading-relaxed text-slate-300 border-t border-slate-800/80 pt-3 block">
                {product.description}
              </Text>
            )}
          </Card>

          {/* Modifier Groups: Incluyentes & Excluyentes */}
          {groups.length > 0 && (
            <VStack className="space-y-4 w-full">
              <HStack className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-orange-400" />
                <Heading level={4} className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Opciones & Toppings
                </Heading>
              </HStack>

              {groups.map((group) => {
                const isSingle = group.selectionType === 'single';
                const selectedInGroup = selectedModifiers[group.id] || [];
                const activeMods = (group.modifiers || []).filter((m) => m.isAvailable !== false);

                return (
                  <Card
                    key={group.id}
                    className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4 transition-colors hover:border-slate-700/80 w-full"
                  >
                    {/* Group Header */}
                    <HStack className="flex items-start justify-between gap-2 mb-3 w-full">
                      <VStack>
                        <Heading level={5} className="font-bold text-slate-100 text-sm">{group.name}</Heading>
                        <Text className="text-[11px] text-slate-400 mt-0.5 block">
                          {isSingle
                            ? 'Selección única (Excluyente) • Elige 1 opción'
                            : group.maxSelections
                            ? `Selección múltiple (Incluyente) • Hasta ${group.maxSelections} opciones`
                            : 'Selección múltiple (Incluyente) • Elige las que desees'}
                        </Text>
                      </VStack>

                      {group.isRequired ? (
                        <Badge
                          label="Obligatorio"
                          className="shrink-0 text-[10px] font-bold text-orange-400 uppercase tracking-wider bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 rounded-full"
                        />
                      ) : (
                        <Badge
                          label="Opcional"
                          className="shrink-0 text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full"
                        />
                      )}
                    </HStack>

                    {/* Modifiers List */}
                    <VStack className="space-y-2 w-full">
                      {activeMods.map((mod) => {
                        const isSelected = selectedInGroup.some((m) => m.modifierId === mod.id);
                        const delta =
                          typeof mod.priceDelta === 'string'
                            ? parseFloat(mod.priceDelta)
                            : mod.priceDelta || 0;

                        return (
                          <Button
                            label={mod.name}
                            type="button"
                            key={mod.id}
                            onClick={() =>
                              isSingle
                                ? handleSingleSelect(group, mod)
                                : handleMultipleSelect(group, mod)
                            }
                            className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-sm transition text-left cursor-pointer ${
                              isSelected
                                ? 'bg-orange-500/15 border border-orange-500/50 text-orange-100 shadow-sm'
                                : 'bg-slate-900/80 hover:bg-slate-800/80 text-slate-300 border border-slate-800/80'
                            }`}
                          >
                            <HStack className="flex items-center gap-3">
                              {/* Selection Indicator: Circle for Excluyente (Single), Square for Incluyente (Multiple) */}
                              <HStack
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
                                    <VStack className="h-1.5 w-1.5 rounded-full bg-white" />
                                  ) : (
                                    <Check className="h-3 w-3 stroke-[3]" />
                                  )
                                )}
                              </HStack>

                              <HStack className="flex items-center gap-2">
                                <Text weight="bold" className="font-medium text-sm">{mod.name}</Text>
                                {mod.isDefault && (
                                  <Badge
                                    label="Base"
                                    className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded"
                                  />
                                )}
                              </HStack>
                            </HStack>

                            <VStack className="text-right shrink-0">
                              {delta > 0 ? (
                                <Text weight="bold" className="text-xs font-bold text-orange-400">
                                  +{formatCOP(delta)}
                                </Text>
                              ) : delta < 0 ? (
                                <Text weight="bold" className="text-xs font-semibold text-rose-400">
                                  -{formatCOP(Math.abs(delta))}
                                </Text>
                              ) : (
                                <Text className="text-[11px] text-slate-500 font-medium">
                                  Sin costo
                                </Text>
                              )}
                            </VStack>
                          </Button>
                        );
                      })}
                    </VStack>
                  </Card>
                );
              })}
            </VStack>
          )}

          {/* Special Notes for Kitchen */}
          <VStack className="w-full">
            <TextArea
              label="Notas para la Cocina (Opcional)"
              value={notes}
              onChange={(val) => setNotes(val)}
              placeholder="Ej: Término medio, sin cebolla, salsa tártara aparte..."
              width="100%"
              controlClassName="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition"
              rows={2}
            />
          </VStack>
        </VStack>

        {/* Footer with Quantity & Total */}
        <HStack className="border-t border-slate-800/90 bg-slate-900/95 px-6 py-4 flex items-center justify-between gap-4 w-full">
          {/* Quantity Controls */}
          <HStack className="flex items-center rounded-2xl border border-slate-800 bg-slate-950 p-1">
            <Button
              label="Disminuir cantidad"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              isDisabled={quantity <= 1}
              className="rounded-xl p-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition cursor-pointer"
              aria-label="Disminuir cantidad"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Text weight="bold" className="w-8 text-center font-bold text-white text-sm select-none">
              {quantity}
            </Text>
            <Button
              label="Aumentar cantidad"
              onClick={() => setQuantity((q) => q + 1)}
              className="rounded-xl p-2 text-slate-400 hover:text-white transition cursor-pointer"
              aria-label="Aumentar cantidad"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </HStack>

          {/* Add to Cart CTA */}
          <Button
            label="Agregar a la canasta"
            onClick={handleAddToCart}
            isDisabled={venue.isOpen === false}
            className="flex-1 rounded-2xl bg-orange-600 py-3.5 px-5 font-bold text-white shadow-lg shadow-orange-600/30 hover:bg-orange-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition text-sm flex items-center justify-between cursor-pointer"
          >
            <Text weight="bold" className="text-white text-sm">
              {venue.isOpen === false ? 'Comercio Cerrado' : 'Agregar a la canasta'}
            </Text>
            <Text weight="bold" className="font-extrabold text-orange-100 text-sm">
              {formatCOP(totalPrice)}
            </Text>
          </Button>
        </HStack>
      </VStack>
    </VStack>
  );
}