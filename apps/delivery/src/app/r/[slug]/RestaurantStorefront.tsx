"use client";

import React, { useState, useMemo } from "react";
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
  Search,
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
  TextInput,
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
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategoryId === "all" || p.categoryId === selectedCategoryId;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategoryId, searchQuery]);

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
      {/* Restaurant Header Banner with Brand Ambient Glow */}
      <VStack
        className="relative border-b border-slate-800 bg-slate-900/80 backdrop-blur-md w-full overflow-hidden"
        style={{
          background: venue.primaryColor
            ? `linear-gradient(135deg, ${venue.primaryColor}22 0%, #0b1329 100%)`
            : "linear-gradient(135deg, #ea580c22 0%, #0b1329 100%)",
        }}
      >
        <VStack className="mx-auto max-w-6xl px-4 py-6 sm:px-6 w-full">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition mb-5 self-start group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <Text className="text-xs font-semibold text-slate-400 group-hover:text-white">
              Volver a todos los comercios
            </Text>
          </Link>

          <HStack className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 w-full">
            {/* Left: Logo & Business Info */}
            <HStack className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0">
              {venue.logoUrl ? (
                <img
                  src={venue.logoUrl}
                  alt={venue.restaurantName || venue.name}
                  className="h-18 w-18 sm:h-22 sm:w-22 object-cover rounded-2xl shadow-xl border-2 border-slate-800 bg-slate-900 shrink-0"
                />
              ) : (
                <HStack
                  className="flex h-18 w-18 sm:h-22 sm:w-22 items-center justify-center rounded-2xl font-black text-white text-3xl shadow-xl border-2 border-slate-800 shrink-0"
                  style={{ backgroundColor: venue.primaryColor || "#ea580c" }}
                >
                  <Text weight="bold" className="text-3xl text-white">
                    {(venue.restaurantName || venue.name).charAt(0).toUpperCase()}
                  </Text>
                </HStack>
              )}

              <VStack className="space-y-1.5 min-w-0">
                <HStack className="flex items-center gap-2.5 flex-wrap">
                  <Heading level={1} className="text-2xl sm:text-3xl font-black text-white truncate">
                    {venue.restaurantName || venue.name}
                  </Heading>
                  {venue.isOpen !== false ? (
                    <Badge
                      label="Abierto Ahora"
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 shadow-xs"
                    />
                  ) : (
                    <Badge
                      label="Cerrado Temporalmente"
                      className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 border border-rose-500/40 px-2.5 py-0.5 text-[11px] font-bold text-rose-300 shadow-xs"
                    />
                  )}
                  {tableParam && (
                    <Badge
                      label={`Mesa ${tableParam}`}
                      className="inline-flex items-center gap-1 rounded-full bg-orange-500/20 border border-orange-500/40 px-2.5 py-0.5 text-[11px] font-black text-orange-300 shadow-xs"
                    />
                  )}
                </HStack>

                {/* Meta chips */}
                <HStack className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs text-slate-300">
                  {venue.address && (
                    <Button
                      label={`${venue.address}${venue.city ? `, ${venue.city}` : ""}`}
                      icon={<MapPin className="h-3.5 w-3.5 text-orange-400 shrink-0" />}
                      type="button"
                      onClick={() => setIsLocationModalOpen(true)}
                      className="inline-flex items-center gap-1 text-slate-300 hover:text-orange-400 hover:underline transition cursor-pointer p-0 bg-transparent border-none text-xs"
                    />
                  )}
                  <HStack className="flex items-center gap-1 text-slate-300">
                    <Clock className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                    <Text className="text-xs text-slate-300">25 - 40 min</Text>
                  </HStack>
                  {venue.openingHours && (
                    <Text className="text-xs text-slate-400">
                      • {venue.openingHours}
                    </Text>
                  )}
                </HStack>

                <VStack className="pt-1">
                  <BusinessSocialLinks venue={venue} variant="compact" />
                </VStack>
              </VStack>
            </HStack>

            {/* Right: Actions */}
            <HStack className="flex items-center gap-2.5 self-start md:self-center shrink-0">
              <Button
                label="Ubicación & Mapa"
                icon={<MapPin className="h-3.5 w-3.5 text-orange-400 shrink-0" />}
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-800/90 px-4 py-2 text-xs font-bold text-slate-200 hover:border-orange-500/50 hover:bg-slate-800 hover:text-white transition shadow-sm cursor-pointer"
              />
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

      {/* Category Navigation Bar & Search (Sticky) */}
      <VStack className="sticky top-16 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md w-full shadow-lg">
        <VStack className="mx-auto max-w-6xl px-4 py-3 sm:px-6 w-full space-y-3">
          <HStack className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
            {/* Category Pills */}
            <HStack className="flex flex-wrap items-center gap-2 flex-1">
              <Button
                label={`Todos (${products.length})`}
                onClick={() => setSelectedCategoryId("all")}
                className={`shrink-0 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition cursor-pointer border ${
                  selectedCategoryId === "all"
                    ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-600/30 border-orange-400"
                    : "bg-slate-900/90 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700 hover:bg-slate-800"
                }`}
              />

              {categories.map((cat) => {
                const count = products.filter(
                  (p) => p.categoryId === cat.id,
                ).length;
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <Button
                    key={cat.id}
                    label={`${cat.name} (${count})`}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`shrink-0 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition cursor-pointer border ${
                      isSelected
                        ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-600/30 border-orange-400"
                        : "bg-slate-900/90 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700 hover:bg-slate-800"
                    }`}
                  />
                );
              })}
            </HStack>

            {/* In-store Search Input */}
            <HStack className="relative flex items-center sm:w-64 shrink-0">
              <Search className="absolute left-3 h-3.5 w-3.5 text-orange-400 z-10" />
              <TextInput
                label="Buscar producto"
                isLabelHidden
                value={searchQuery}
                onChange={(val) => setSearchQuery(val)}
                placeholder="Buscar en la carta..."
                width="100%"
                controlClassName="w-full rounded-xl border border-slate-700 bg-slate-900 py-2 pl-9 pr-7 text-xs text-white placeholder:text-slate-400 shadow-inner focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/20"
              />
              {searchQuery && (
                <Button
                  label="✕"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 text-xs text-slate-400 hover:text-white p-0 bg-transparent border-none cursor-pointer"
                />
              )}
            </HStack>
          </HStack>
        </VStack>
      </VStack>

      {/* Product Catalog Grid */}
      <VStack className="mx-auto max-w-6xl px-4 py-8 sm:px-6 w-full">
        {filteredProducts.length === 0 ? (
          <Card className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center max-w-md mx-auto w-full">
            <ChefHat className="h-12 w-12 text-slate-700 mx-auto" />
            <Heading level={3} className="mt-3 font-bold text-slate-200 text-base">
              No hay productos disponibles
            </Heading>
            <Text className="mt-1 text-xs text-slate-500 block">
              {searchQuery
                ? `No hay platos ni bebidas que coincidan con "${searchQuery}".`
                : "Esta categoría aún no cuenta con productos activos para delivery."}
            </Text>
          </Card>
        ) : (
          <Grid columns={{ minWidth: 280, max: 3 }} gap={4} align="stretch" className="w-full">
            {filteredProducts.map((product) => {
              const hasModifiers =
                product.modifierGroups && product.modifierGroups.length > 0;

              return (
                <Card
                  key={product.id}
                  onClick={() => setActiveProduct(product)}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-4 transition-all duration-200 hover:border-orange-500/50 hover:bg-slate-900 hover:shadow-xl hover:shadow-orange-600/10 cursor-pointer w-full h-full"
                >
                  {/* Top content: Details + Optional Image */}
                  <HStack className="flex items-start justify-between gap-3 w-full">
                    <VStack className="flex-1 min-w-0 space-y-1">
                      <Heading
                        level={3}
                        className="font-bold text-white text-base group-hover:text-orange-400 transition leading-snug line-clamp-1 capitalize"
                      >
                        {product.name}
                      </Heading>

                      <Text className="text-xs text-slate-400 line-clamp-2 leading-relaxed min-h-10">
                        {product.description || "Deliciosa opción preparada al instante con los mejores ingredientes."}
                      </Text>
                    </VStack>

                    {product.imageUrl && (
                      <VStack className="relative w-20 h-20 shrink-0 overflow-hidden rounded-xl bg-slate-800 border border-slate-700/60 ml-2">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            const parent = e.currentTarget.parentElement;
                            if (parent) parent.style.display = "none";
                          }}
                        />
                      </VStack>
                    )}
                  </HStack>

                  {/* Bottom: Price + Customization badge + Button */}
                  <HStack className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 w-full mt-auto">
                    <VStack className="space-y-0.5">
                      <Text
                        weight="bold"
                        className="text-base font-black text-orange-400 leading-none"
                      >
                        {formatCOP(product.price)}
                      </Text>
                      {hasModifiers && (
                        <Badge
                          label="Personalizable"
                          className="rounded-md bg-orange-500/10 border border-orange-500/25 px-1.5 py-0.5 text-[10px] font-semibold text-orange-300 w-fit"
                        />
                      )}
                    </VStack>

                    <Button
                      label={hasModifiers ? "Opciones" : "Agregar"}
                      icon={<Plus className="h-3.5 w-3.5 shrink-0" />}
                      type="button"
                      onClick={(e) => handleQuickAdd(e, product)}
                      className="inline-flex items-center justify-center rounded-xl bg-orange-600 hover:bg-orange-500 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-orange-600/20 transition cursor-pointer"
                    />
                  </HStack>
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