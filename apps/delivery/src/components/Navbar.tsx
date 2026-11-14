"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Store, Sparkles, Building2, User, LogOut, MessageSquare } from "lucide-react";
import { HStack, Text, Badge, Button } from "@astryxdesign/core";
import { useCart } from "../context/CartContext";
import { useCustomerAuth } from "../context/CustomerAuthContext";

export function Navbar() {
  const pathname = usePathname();
  const { currentVenue, itemCount, total, setIsCartOpen } = useCart();
  const { customer, isAuthenticated, setIsAuthModalOpen, logout } = useCustomerAuth();

  const isStorefront = pathname ? pathname.startsWith("/r/") : false;

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
          <img
            src="/logo.png"
            alt="Pallevar"
            className="h-10 w-10 rounded-xl object-contain shadow-md shadow-orange-600/30 shrink-0"
          />
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

        {/* Center: Contextual Navigation */}
        <HStack className="hidden md:flex items-center gap-5">
          {isStorefront && currentVenue ? (
            <HStack className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3.5 py-1.5 text-xs text-slate-300">
              <Store className="h-3.5 w-3.5 text-orange-400" />
              <Text className="text-xs text-slate-300">
                Local:{" "}
                <Text weight="bold" className="text-white font-bold">
                  {currentVenue.name}
                </Text>
              </Text>
              <Link
                href="/"
                className="text-[10px] text-orange-400 hover:text-orange-300 font-semibold underline ml-1.5"
              >
                Ver todos
              </Link>
            </HStack>
          ) : (
            <Link
              href="/"
              className={`flex items-center gap-1.5 text-xs font-semibold transition ${
                pathname === "/"
                  ? "text-orange-400"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Store className="h-3.5 w-3.5" />
              <Text className="text-xs font-semibold">
                Directorio de Comercios
              </Text>
            </Link>
          )}

          <Link
            href="/para-negocios"
            className={`flex items-center gap-1.5 text-xs font-semibold transition ${
              pathname === "/para-negocios"
                ? "text-orange-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Building2 className="h-3.5 w-3.5 text-slate-500" />
            <Text className="text-xs font-semibold">¿Tienes un negocio?</Text>
          </Link>
        </HStack>

        {/* Right: Actions */}
        <HStack className="flex items-center gap-2.5">
          {isAuthenticated && customer ? (
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs text-white">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                <User className="h-3.5 w-3.5" />
              </div>
              <span className="font-semibold max-w-[110px] truncate">{customer.name}</span>
              <button
                onClick={logout}
                title="Cerrar sesión"
                className="text-slate-400 hover:text-red-400 ml-1 transition"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 hover:text-white transition cursor-pointer"
            >
              <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
              <span>Ingresar</span>
            </button>
          )}

          <Link
            href="/para-negocios"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-orange-500/30 bg-orange-500/10 px-3.5 py-1.5 text-xs font-bold text-orange-300 hover:bg-orange-500/20 hover:text-white transition"
          >
            <Sparkles className="h-3.5 w-3.5 text-orange-400" />
            <Text className="text-xs font-bold text-orange-300">
              Vende en Pallevar
            </Text>
          </Link>

          <Button
            label={
              itemCount > 0
                ? `Canasta con ${itemCount} ${
                    itemCount === 1 ? "ítem" : "ítems"
                  } por ${formatCOP(total)}`
                : "Canasta de compras"
            }
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-700/90 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:border-orange-500 hover:bg-slate-800 transition cursor-pointer"
          >
            <HStack className="flex items-center gap-2">
              <ShoppingBag className="h-4.5 w-4.5 text-orange-400 shrink-0" />
              {itemCount > 0 ? (
                <HStack className="flex items-center gap-1.5">
                  <HStack
                    as="span"
                    className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-600 px-1.5 text-[10px] font-black text-white shrink-0"
                  >
                    <Text weight="bold" className="text-[10px] text-white leading-none">
                      {itemCount}
                    </Text>
                  </HStack>
                  <Text weight="bold" className="text-xs font-bold text-white">
                    {formatCOP(total)}
                  </Text>
                </HStack>
              ) : (
                <Text weight="bold" className="text-xs font-bold text-slate-300">
                  Canasta
                </Text>
              )}
            </HStack>
          </Button>
        </HStack>
      </HStack>
    </HStack>
  );
}
