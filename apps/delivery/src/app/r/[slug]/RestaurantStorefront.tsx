"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  MapPin,
  Phone,
  Clock,
  ArrowLeft,
  Plus,
  Sparkles,
  ChefHat,
  UtensilsCrossed,
  Navigation,
} from "lucide-react";
import {
  VStack,
  HStack,
  Grid,
  Text,
  Heading,
  Button,
  Badge,
  Card,
  Banner,
} from "@astryxdesign/core";
import {
  VenuePublicProfile,
  CatalogCategory,
  CatalogProduct,
} from "../../../types/delivery";
import { ProductDetailModal } from "../../../components/modals/ProductDetailModal";
import { BusinessLocationModal } from "../../../components/storefront/BusinessLocationModal";
import { BusinessSocialLinks } from "../../../components/storefront/BusinessSocialLinks";
import { useCart } from "../../../context/CartContext";
import { sileo } from "sileo";

interface Props {
  venue: VenuePublicProfile;
  categories: CatalogCategory[];
  products: CatalogProduct[];
}

export function RestaurantStorefront({ venue, categories, products }: Props) {
  const searchParams = useSearchParams();
  const tableParam = searchParams
    ? searchParams.get("table") || searchParams.get("mesa")
    : null;

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | "all">(
    "all",
  );
  const [activeProduct, setActiveProduct] = useState<CatalogProduct | null>(
    null,
  );
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const { addItem } = useCart();

  const formatCOP = (num: number | string) => {
    const val = typeof num === "string" ? parseFloat(num) : num;
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const filteredProducts =
    selectedCategoryId === "all"
      ? products
      : products.filter((p) => p.categoryId === selectedCategoryId);

  const handleQuickAdd = (e: React.MouseEvent, product: CatalogProduct) => {
    e.stopPropagation();
    if (venue.isOpen === false) {
      sileo.warning({
        title: "Comercio cerrado",
        description: `El comercio no está recibiendo pedidos en este momento.${
          venue.openingHours
            ? ` Horario de atención: ${venue.openingHours}`
            : ""
        }`,
      });
      return;
    }
    const hasModifiers =
      product.modifierGroups && product.modifierGroups.length > 0;
    if (hasModifiers) {
      setActiveProduct(product);
    } else {
      addItem(product, 1, [], "", venue);
      sileo.success({
        title: "Agregado a la canasta",
        description: `1x ${product.name}`,
      });
    }
  };

  return (
    <VStack className="min-h-screen pb-24 w-full">
      {/* Restaurant Header Banner */}
      <VStack className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-sm w-full">
        <VStack className="mx-auto max-w-6xl px-4 py-6 sm:px-6 w-full">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition mb-4 self-start"
          >
            <ArrowLeft className="h-4 w-4" />
            <Text className="text-xs font-semibold text-slate-400">Volver a todos los comercios</Text>
          </Link>

          <HStack className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
            <HStack className="flex items-center gap-4">
              {venue.logoUrl ? (
                <img
                  src={venue.logoUrl}
                  alt={venue.restaurantName || venue.name}
                  className="h-16 w-16 object-cover rounded-2xl shadow-lg border border-slate-700/60 bg-slate-800 shrink-0"
                />
              ) : (
                <HStack
                  className="flex h-16 w-16 items-center justify-center rounded-2xl font-black text-white text-2xl shadow-lg shrink-0"
                  style={{ backgroundColor: venue.primaryColor || "#ea580c" }}
                >
                  <Text weight="bold" className="text-2xl text-white">
                    {(venue.restaurantName || venue.name).charAt(0).toUpperCase()}
                  </Text>
                </HStack>
              )}
              <VStack>
                <Heading level={1} className="text-2xl sm:text-3xl font-black text-white">
                  {venue.restaurantName || venue.name}
                </Heading>
                <HStack className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                  {venue.address && (
                    <Button
                      label="Ver ubicación y dirección"
                      type="button"
                      onClick={() => setIsLocationModalOpen(true)}
                      className="inline-flex items-center gap-1 text-slate-300 hover:text-orange-400 hover:underline transition cursor-pointer p-0 bg-transparent border-none"
                    >
                      <MapPin className="h-3.5 w-3.5 text-orange-500 shrink-0 inline mr-1" />
                      <Text className="text-xs text-slate-300">
                        {venue.address}
                        {venue.city ? `, ${venue.city}` : ""}
                      </Text>
                    </Button>
                  )}
                  {venue.phone && (
                    <HStack className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-slate-500" />
                      <Text className="text-xs text-slate-400">{venue.phone}</Text>
                    </HStack>
                  )}
                  <HStack className="flex items-center gap-1 text-orange-400">
                    <Clock className="h-3.5 w-3.5" />
                    <Text className="text-xs text-orange-400">25-40 min</Text>
                  </HStack>
                  {venue.openingHours && (
                    <Text weight="bold" className="flex items-center gap-1 text-slate-300 font-medium text-xs">
                      • {venue.openingHours}
                    </Text>
                  )}
                </HStack>

                <VStack className="mt-3">
                  <BusinessSocialLinks venue={venue} variant="pills" />
                </VStack>
              </VStack>
            </HStack>

            <HStack className="flex flex-wrap items-center gap-2.5 self-start sm:self-center">
              <Button
                label="Ver Ubicación y Mapa"
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-800/80 px-3.5 py-1.5 text-xs font-bold text-slate-200 hover:border-orange-500/50 hover:bg-slate-800 hover:text-white transition shadow-sm cursor-pointer"
              >
                <MapPin className="h-3.5 w-3.5 text-orange-400" />
                <Text weight="bold" className="text-xs text-slate-200">Ver Ubicación & Mapa</Text>
              </Button>

              {tableParam && (
                <Badge
                  label={`Mesa ${tableParam}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/20 border border-orange-500/40 px-3 py-1 text-xs font-black text-orange-300 shadow-sm"
                />
              )}
              {venue.isOpen !== false ? (
                <Badge
                  label="Abierto Ahora"
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-300"
                />
              ) : (
                <Badge
                  label="Cerrado Temporalmente"
                  className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 px-3 py-1 text-xs font-bold text-rose-300"
                />
              )}
            </HStack>
          </HStack>
        </VStack>
      </VStack>

      {/* Closed Venue Alert Banner */}
      {venue.isOpen === false && (
        <VStack className="bg-rose-950/40 border-b border-rose-500/30 px-4 py-3 backdrop-blur-sm w-full">
          <HStack className="mx-auto max-w-6xl flex items-center justify-between gap-3 text-xs text-rose-200 w-full">
            <HStack className="flex items-center gap-2.5">
              <HStack className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400 font-bold shrink-0">
                <Text weight="bold" className="text-rose-400 font-bold">!</Text>
              </HStack>
              <VStack>
                <Text className="text-xs text-rose-200">
                  <Text weight="bold" className="font-bold text-rose-100">
                    Restaurante cerrado para domicilios en este momento.
                  </Text>{" "}
                  Puedes explorar nuestro catálogo, pero la recepción de pedidos a
                  domicilio se encuentra pausada.
                  {venue.openingHours && (
                    <Text weight="bold" className="block sm:inline sm:ml-2 font-semibold text-rose-300 text-xs">
                      • Horario de atención: {venue.openingHours}
                    </Text>
                  )}
                </Text>
              </VStack>
            </HStack>
          </HStack>
        </VStack>
      )}

      {/* Category Navigation Bar (Sticky) */}
      {categories.length > 0 && (
        <VStack className="sticky top-15.25 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md w-full">
          <VStack className="mx-auto max-w-6xl px-4 sm:px-6 w-full">
            <HStack className="flex items-center gap-2.5 overflow-x-auto py-3 no-scrollbar w-full">
              <Button
                label="Todos los productos"
                onClick={() => setSelectedCategoryId("all")}
                className={`shrink-0 rounded-full px-4.5 py-2 text-sm font-semibold transition cursor-pointer ${
                  selectedCategoryId === "all"
                    ? "bg-orange-600 text-white shadow-md shadow-orange-600/30 border border-orange-500"
                    : "bg-slate-900/90 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700"
                }`}
              >
                <Text weight="bold" className={`text-sm ${selectedCategoryId === "all" ? "text-white" : "text-slate-300"}`}>
                  Todos ({products.length})
                </Text>
              </Button>

              {categories.map((cat) => {
                const count = products.filter(
                  (p) => p.categoryId === cat.id,
                ).length;
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <Button
                    key={cat.id}
                    label={cat.name}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`shrink-0 rounded-full px-4.5 py-2 text-sm font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? "bg-orange-600 text-white shadow-md shadow-orange-600/30 border border-orange-500"
                        : "bg-slate-900/90 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <Text weight="bold" className={`text-sm ${isSelected ? "text-white" : "text-slate-300"}`}>
                      {cat.name}
                    </Text>
                    <Text className="text-xs opacity-75">({count})</Text>
                  </Button>
                );
              })}
            </HStack>
          </VStack>
        </VStack>
      )}

      {/* Product Catalog Grid */}
      <VStack className="mx-auto max-w-6xl px-4 py-8 sm:px-6 w-full">
        {filteredProducts.length === 0 ? (
          <Card className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center max-w-md mx-auto w-full">
            <ChefHat className="h-12 w-12 text-slate-700 mx-auto" />
            <Heading level={3} className="mt-3 font-bold text-slate-200 text-base">
              No hay productos disponibles
            </Heading>
            <Text className="mt-1 text-xs text-slate-500 block">
              Esta categoría aún no cuenta con productos activos para delivery.
            </Text>
          </Card>
        ) : (
          <Grid className="grid gap-3.5 sm:gap-4 grid-cols-1 md:grid-cols-2 w-full">
            {filteredProducts.map((product) => {
              const hasModifiers =
                product.modifierGroups && product.modifierGroups.length > 0;

              return (
                <Card
                  key={product.id}
                  onClick={() => setActiveProduct(product)}
                  className="group relative flex flex-row items-stretch justify-between gap-3 sm:gap-4 overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 transition-all duration-200 hover:border-orange-500/40 hover:bg-slate-900 hover:shadow-lg cursor-pointer w-full min-h-[110px]"
                >
                  {/* Left Column: Info & Price */}
                  <VStack className="flex-1 flex flex-col justify-between min-w-0 pr-1">
                    <VStack>
                      <Heading
                        level={3}
                        className="font-bold text-white text-sm sm:text-base group-hover:text-orange-400 transition truncate"
                      >
                        {product.name}
                      </Heading>

                      {product.description && (
                        <Text className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed block">
                          {product.description}
                        </Text>
                      )}
                    </VStack>

                    <HStack className="mt-3 flex items-center gap-2">
                      <Text
                        weight="bold"
                        className="text-sm sm:text-base font-black text-orange-400"
                      >
                        {formatCOP(product.price)}
                      </Text>
                      {hasModifiers && (
                        <Badge
                          label="Personalizable"
                          className="rounded-md bg-slate-800/90 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 border border-slate-700/50"
                        />
                      )}
                    </HStack>
                  </VStack>

                  {/* Right Column: Thumbnail + Button (or Just Button) */}
                  {product.imageUrl ? (
                    <VStack className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 overflow-hidden rounded-xl bg-slate-800 border border-slate-800/80 self-center">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          const target = e.currentTarget;
                          (target.parentElement as HTMLElement).style.display = "none";
                        }}
                      />
                      <Button
                        label={
                          hasModifiers
                            ? "Ver opciones del producto"
                            : "Agregar producto a la canasta"
                        }
                        type="button"
                        onClick={(e) => handleQuickAdd(e, product)}
                        className="absolute bottom-1 right-1 flex items-center gap-1 rounded-lg bg-orange-600/95 backdrop-blur-xs px-2 py-1 text-[11px] font-bold text-white shadow-md hover:bg-orange-500 transition cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                        <Text weight="bold" className="text-[11px] text-white">
                          {hasModifiers ? "Opciones" : "Agregar"}
                        </Text>
                      </Button>
                    </VStack>
                  ) : (
                    <VStack className="shrink-0 justify-end self-end mb-0.5">
                      <Button
                        label={
                          hasModifiers
                            ? "Ver opciones del producto"
                            : "Agregar producto a la canasta"
                        }
                        type="button"
                        onClick={(e) => handleQuickAdd(e, product)}
                        className="flex items-center gap-1.5 rounded-xl bg-orange-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-orange-500 transition cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <Text weight="bold" className="text-xs text-white">
                          {hasModifiers ? "Opciones" : "Agregar"}
                        </Text>
                      </Button>
                    </VStack>
                  )}
                </Card>
              );
            })}
          </Grid>
        )}
      </VStack>

      {/* Product Customization Modal */}
      <ProductDetailModal
        product={activeProduct}
        venue={venue}
        onClose={() => setActiveProduct(null)}
      />

      {/* Business Location & Info Modal */}
      <BusinessLocationModal
        venue={venue}
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </VStack>
  );
}