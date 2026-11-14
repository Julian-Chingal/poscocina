"use client";

import React from "react";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import {
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Badge,
  Divider,
} from "@astryxdesign/core";
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
    taxTotal,
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
    <HStack
      justify="end"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsCartOpen(false);
      }}
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <VStack className="relative flex h-full w-full max-w-md flex-col bg-slate-900 border-l border-slate-800 text-slate-100 shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <HStack className="flex items-center justify-between border-b border-slate-800 px-6 py-4 w-full">
          <HStack className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-orange-500" />
            <Heading level={3} className="font-bold text-lg text-white">
              Tu Pedido ({itemCount})
            </Heading>
          </HStack>
          <Button
            label="Cerrar canasta"
            onClick={() => setIsCartOpen(false)}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </Button>
        </HStack>

        {/* Venue Badge */}
        {currentVenue && (
          <HStack className="bg-slate-950/70 border-b border-slate-800/80 px-6 py-2.5 flex items-center justify-between text-xs w-full">
            <Text className="text-slate-400 text-xs">Comercio:</Text>
            <Badge
              label={currentVenue.restaurantName || currentVenue.name}
              className="font-semibold text-orange-400 truncate max-w-50"
            />
          </HStack>
        )}

        {/* Item List */}
        <VStack className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-slate-800/60 w-full">
          {items.length === 0 ? (
            <VStack className="flex h-full flex-col items-center justify-center text-center py-12 w-full">
              <ShoppingBag className="h-16 w-16 text-slate-700 stroke-[1.2]" />
              <Text
                weight="bold"
                className="mt-4 font-semibold text-slate-300 text-base"
              >
                Tu canasta está vacía
              </Text>
              <Text className="mt-1 text-xs text-slate-500">
                Explora la carta y agrega tus platos favoritos
              </Text>
            </VStack>
          ) : (
            items.map((item) => (
              <VStack
                key={item.id}
                className="py-4 first:pt-0 last:pb-0 w-full"
              >
                <HStack className="flex items-start justify-between gap-3 w-full">
                  <VStack className="flex-1">
                    <Heading
                      level={4}
                      className="text-sm font-semibold text-white"
                    >
                      {item.name}
                    </Heading>
                    {item.modifiers.length > 0 && (
                      <Text className="mt-0.5 text-xs text-slate-400 block">
                        {item.modifiers.map((m) => m.name).join(", ")}
                      </Text>
                    )}
                    {item.notes && (
                      <Text className="mt-1 text-[11px] italic text-orange-300/80 block">
                        "{item.notes}"
                      </Text>
                    )}
                    <Text
                      weight="bold"
                      className="mt-2 block text-sm font-bold text-orange-400"
                    >
                      {formatCOP(item.totalItemPrice)}
                    </Text>
                  </VStack>

                  {/* Quantity Controls */}
                  <HStack className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1">
                    <Button
                      label="Disminuir cantidad"
                      onClick={() => updateQuantity(item.id, -1)}
                      className="rounded p-1 text-slate-400 hover:text-white transition cursor-pointer"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <Text
                      weight="bold"
                      className="w-6 text-center text-xs font-bold text-white"
                    >
                      {item.quantity}
                    </Text>
                    <Button
                      label="Aumentar cantidad"
                      onClick={() => updateQuantity(item.id, 1)}
                      className="rounded p-1 text-slate-400 hover:text-white transition cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </HStack>

                  <Button
                    label="Eliminar producto"
                    onClick={() => removeItem(item.id)}
                    className="p-1 text-slate-500 hover:text-red-400 transition cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </HStack>
              </VStack>
            ))
          )}
        </VStack>

        {/* Footer */}
        {items.length > 0 && (
          <VStack className="border-t border-slate-800 bg-slate-950/90 px-6 py-4 space-y-3 w-full">
            <VStack className="space-y-1.5 text-xs text-slate-400 w-full">
              <HStack className="flex justify-between w-full">
                <Text className="text-slate-400 text-xs">
                  Subtotal ({itemCount}{" "}
                  {itemCount === 1 ? "producto" : "productos"})
                </Text>
                <Text className="font-medium text-slate-200 text-xs">
                  {formatCOP(subtotal)}
                </Text>
              </HStack>
              <HStack className="flex justify-between border-t border-slate-800 pt-2 text-base font-bold text-white w-full">
                <Text weight="bold" className="text-white text-base font-bold">
                  Total a Pagar
                </Text>
                <Text
                  weight="bold"
                  className="text-orange-500 font-black text-base"
                >
                  {formatCOP(total)}
                </Text>
              </HStack>
            </VStack>

            <Button
              label="Confirmar Pedido"
              onClick={handleProceedToCheckout}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-3.5 font-bold text-white shadow-lg shadow-orange-600/30 hover:bg-orange-500 transition text-sm cursor-pointer"
            >
              <Text weight="bold" className="text-white font-bold text-sm">
                Confirmar Pedido
              </Text>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </VStack>
        )}
      </VStack>
    </HStack>
  );
}
