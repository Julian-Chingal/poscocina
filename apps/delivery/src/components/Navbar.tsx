"use client";

import React from "react";
import Link from "next/link";
import { ShoppingBag, MapPin, Store, Sparkles, Building2 } from "lucide-react";
import { HStack, Text, Badge, Button } from "@astryxdesign/core";
import { useCart } from "../context/CartContext";

export function Navbar() {
  const { currentVenue, itemCount, total, setIsCartOpen } = useCart();

  const formatCOP = (num: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(num);

  return (
    <HStack
      as="header"
      className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md w-full"
    >
      <HStack className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 w-full">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 transition hover:opacity-95"
        >
          <HStack className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-orange-500 to-amber-600 shadow-md shadow-orange-600/30">
            <ShoppingBag className="h-5 w-5 text-white" />
          </HStack>
          <HStack className="flex items-center">
            <Text className="text-xl font-black tracking-tight text-white">
              Pallevar
            </Text>
            <Badge
              label="DELIVERY"
              className="ml-1.5 rounded-md bg-orange-500/15 border border-orange-500/30 px-1.5 py-0.5 text-[10px] font-bold text-orange-400"
            />
          </HStack>
        </Link>

        {/* Center: Current Store or Directory Link */}
        <HStack className="hidden md:flex items-center gap-4">
          {currentVenue ? (
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/80 px-3.5 py-1.5 text-xs text-slate-300 hover:border-orange-500/50 hover:text-white transition"
              title="Cambiar de comercio"
            >
              <Store className="h-3.5 w-3.5 text-orange-400" />
              <Text className="text-xs text-slate-300">
                Negocio:{" "}
                <Text weight="bold" className="text-white font-bold">
                  {currentVenue.name}
                </Text>
              </Text>
              <Text className="text-[10px] text-slate-500 underline ml-1">
                Cambiar
              </Text>
            </Link>
          ) : (
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-orange-400 transition"
            >
              <MapPin className="h-3.5 w-3.5 text-orange-400" />
              <Text className="text-xs text-slate-400">
                Directorio de Negocios
              </Text>
            </Link>
          )}

          <Link
            href="/para-negocios"
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-orange-400 transition"
          >
            <Building2 className="h-3.5 w-3.5 text-slate-500" />
            <Text className="text-xs text-slate-400">¿Tienes un negocio?</Text>
          </Link>
        </HStack>

        {/* Right: Actions */}
        <HStack className="flex items-center gap-2.5">
          <Link
            href="/para-negocios"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 text-xs font-bold text-orange-300 hover:bg-orange-500/20 hover:text-white transition"
          >
            <Sparkles className="h-3.5 w-3.5 text-orange-400" />
            <Text className="text-xs font-bold text-orange-300">
              Vende en Pallevar
            </Text>
          </Link>

          <Button
            label="Ver canasta de compras"
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:border-orange-500/50 hover:bg-slate-800 transition cursor-pointer"
          >
            <HStack className="relative flex items-center justify-center">
              <ShoppingBag className="h-4 w-4 text-orange-500" />
              {itemCount > 0 && (
                <Text className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-[10px] font-bold text-white shadow-sm">
                  {itemCount}
                </Text>
              )}
            </HStack>
            <Text className="hidden xs:inline text-xs text-white">Canasta</Text>
            {itemCount > 0 && (
              <>
                <Text className="text-slate-600">•</Text>
                <Text
                  weight="bold"
                  className="font-bold text-orange-400 text-xs"
                >
                  {formatCOP(total)}
                </Text>
              </>
            )}
          </Button>
        </HStack>
      </HStack>
    </HStack>
  );
}
