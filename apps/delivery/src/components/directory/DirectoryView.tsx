"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Store,
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  Sparkles,
  Search,
  UtensilsCrossed,
  ShoppingBag,
  HeartPulse,
  Wine,
  Building2,
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
  TextInput,
} from "@astryxdesign/core";
import { VenuePublicProfile } from "../../types/delivery";
import { BusinessSocialLinks } from "../storefront/BusinessSocialLinks";

interface Props {
  initialVenues: VenuePublicProfile[];
}

type BusinessCategory = "all" | "restaurant" | "store" | "pharmacy" | "drinks";

const CATEGORIES: Array<{
  id: BusinessCategory;
  label: string;
  icon: React.ElementType;
}> = [
  { id: "all", label: "Todos", icon: Store },
  { id: "restaurant", label: "Restaurantes", icon: UtensilsCrossed },
  { id: "store", label: "Tiendas & Mercados", icon: ShoppingBag },
  { id: "pharmacy", label: "Farmacias", icon: HeartPulse },
  { id: "drinks", label: "Bebidas & Licores", icon: Wine },
];

export function DirectoryView({ initialVenues }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<BusinessCategory>("all");

  const filteredVenues = useMemo(() => {
    return initialVenues.filter((venue) => {
      // Category filter (if venue specifies businessType, match it; if 'all', pass; default matches 'restaurant' or general)
      const bType = (venue.businessType || "restaurant").toLowerCase();
      const matchesCategory =
        selectedCategory === "all" ||
        (selectedCategory === "restaurant" &&
          (bType.includes("restaurant") ||
            bType.includes("comida") ||
            !venue.businessType)) ||
        (selectedCategory === "store" &&
          (bType.includes("store") ||
            bType.includes("tienda") ||
            bType.includes("mercado"))) ||
        (selectedCategory === "pharmacy" &&
          (bType.includes("pharmacy") ||
            bType.includes("farmacia") ||
            bType.includes("salud"))) ||
        (selectedCategory === "drinks" &&
          (bType.includes("drinks") ||
            bType.includes("licor") ||
            bType.includes("bebida")));

      // Text search filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        venue.name.toLowerCase().includes(q) ||
        (venue.restaurantName &&
          venue.restaurantName.toLowerCase().includes(q)) ||
        (venue.address && venue.address.toLowerCase().includes(q)) ||
        (venue.city && venue.city.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [initialVenues, selectedCategory, searchQuery]);

  return (
    <VStack className="relative overflow-hidden w-full">
      {/* Background glow accent */}
      <VStack className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-linear-to-b from-orange-600/15 via-amber-600/5 to-transparent pointer-events-none" />

      <VStack className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-14 w-full">
        {/* Hero Section */}
        <VStack className="text-center max-w-3xl mx-auto space-y-4 items-center">
          <HStack className="inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/10 px-4 py-1.5 text-xs font-semibold text-orange-400">
            <Sparkles className="h-3.5 w-3.5" />
            <Text className="text-xs font-semibold text-orange-400">Restaurantes, Tiendas y Más a Domicilio</Text>
          </HStack>

          <Heading level={1} className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Tus comercios favoritos en minutos
          </Heading>

          <Text className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto block">
            Pide comida preparada, compras y productos locales de tu ciudad con
            entrega rápida y despacho sincronizado en tiempo real.
          </Text>

          {/* Quick Search Bar */}
          <VStack className="pt-2 max-w-xl mx-auto w-full">
            <HStack className="relative flex items-center w-full">
              <Search className="absolute left-4 h-4 w-4 text-orange-400 z-10" />
              <TextInput
                label="Buscar comercio o producto"
                isLabelHidden
                value={searchQuery}
                onChange={(val) => setSearchQuery(val)}
                placeholder="Buscar restaurante, tienda o dirección..."
                width="100%"
                controlClassName="w-full rounded-2xl border border-slate-700 bg-slate-900 py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-400 shadow-inner focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/25"
              />
              {searchQuery && (
                <Button
                  label="Limpiar búsqueda"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 text-xs text-slate-400 hover:text-white px-2 py-1 z-10 cursor-pointer bg-transparent border-none"
                >
                  <Text className="text-xs text-slate-300">Limpiar</Text>
                </Button>
              )}
            </HStack>
          </VStack>
        </VStack>

        {/* Category Filter Pills - Full width grid, no horizontal scroll */}
        <Grid
          columns={{ minWidth: 150, max: 5 }}
          gap={3}
          className="w-full max-w-5xl mx-auto pt-6 pb-2"
        >
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <Button
                key={cat.id}
                label={cat.label}
                width="100%"
                icon={
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isSelected ? "text-white" : "text-orange-400"
                    }`}
                  />
                }
                onClick={() => setSelectedCategory(cat.id)}
                className={`w-full flex items-center justify-center rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition cursor-pointer border ${
                  isSelected
                    ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-600/30 border-orange-400"
                    : "bg-slate-900/90 text-slate-200 hover:text-white border-slate-700/80 hover:border-orange-500/50 hover:bg-slate-800"
                }`}
              />
            );
          })}
        </Grid>

        {/* Venues Grid */}
        <VStack className="mt-10 w-full max-w-6xl mx-auto">
          <HStack className="flex items-center justify-between mb-6 w-full">
            <Heading level={2} className="text-lg font-bold text-white flex items-center gap-2">
              <Store className="h-5 w-5 text-orange-500 inline mr-2" />
              Negocios Disponibles ({filteredVenues.length})
            </Heading>
          </HStack>

          {filteredVenues.length === 0 ? (
            <Card className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center max-w-md mx-auto w-full">
              <Store className="h-12 w-12 text-slate-700 mx-auto" />
              <Heading level={3} className="mt-4 font-bold text-slate-200 text-base">
                No se encontraron comercios
              </Heading>
              <Text className="mt-1 text-xs text-slate-400 block">
                {searchQuery
                  ? `No hay resultados para "${searchQuery}". Prueba con otro término.`
                  : "Próximamente más restaurantes y tiendas en tu localidad."}
              </Text>
              {searchQuery && (
                <Button
                  label="Ver todos los comercios"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="mt-4 inline-flex items-center gap-1 text-xs text-orange-400 hover:underline cursor-pointer"
                >
                  <Text className="text-xs text-orange-400">Ver todos los comercios</Text>
                </Button>
              )}
            </Card>
          ) : (
            <Grid columns={{ minWidth: 320, max: 3 }} gap={6} align="stretch" className="w-full">
              {filteredVenues.map((venue) => {
                const targetSlug = venue.slug || venue.id;
                // Category label
                const bType = venue.businessType || "restaurant";
                const categoryBadge =
                  bType === "store"
                    ? "Tienda & Mercado"
                    : bType === "pharmacy"
                      ? "Farmacia"
                      : bType === "drinks"
                        ? "Licores"
                        : "Restaurante";

                return (
                  <Card
                    key={venue.id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-0 transition-all duration-300 hover:border-orange-500/50 hover:bg-slate-900 hover:shadow-xl hover:shadow-orange-600/10 w-full h-full"
                  >
                    {/* Header Banner with Category & Status - Fixed Height */}
                    <HStack
                      className="relative h-24 w-full p-3 flex items-start justify-between border-b border-slate-800/80 shrink-0"
                      style={{
                        background: venue.primaryColor
                          ? `linear-gradient(135deg, ${venue.primaryColor}33 0%, #0f172a 100%)`
                          : "linear-gradient(135deg, #ea580c33 0%, #0f172a 100%)",
                      }}
                    >
                      {/* Logo Overlapping */}
                      <HStack className="absolute -bottom-5 left-4 z-10">
                        {venue.logoUrl ? (
                          <img
                            src={venue.logoUrl}
                            alt={venue.restaurantName || venue.name}
                            className="h-14 w-14 object-cover rounded-xl shadow-xl border-2 border-slate-900 bg-slate-800 shrink-0"
                          />
                        ) : (
                          <HStack
                            className="flex h-14 w-14 items-center justify-center rounded-xl font-black text-white shadow-xl border-2 border-slate-900 text-xl shrink-0"
                            style={{
                              backgroundColor: venue.primaryColor || "#ea580c",
                            }}
                          >
                            <Text weight="bold" className="text-white text-xl">
                              {(venue.restaurantName || venue.name)
                                .charAt(0)
                                .toUpperCase()}
                            </Text>
                          </HStack>
                        )}
                      </HStack>

                      {/* Right Badges */}
                      <HStack className="flex items-center gap-1.5 ml-auto">
                        <Badge
                          label={categoryBadge}
                          className="rounded-full bg-slate-950/90 border border-slate-700/80 px-2.5 py-0.5 text-[11px] font-semibold text-slate-200 shadow-xs"
                        />
                        {venue.isOpen !== false ? (
                          <Badge
                            label="Abierto"
                            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 shadow-xs"
                          />
                        ) : (
                          <Badge
                            label="Cerrado"
                            className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 px-2.5 py-0.5 text-[11px] font-bold text-rose-300 shadow-xs"
                          />
                        )}
                      </HStack>
                    </HStack>

                    {/* Card Content - Uniform Fixed Slots */}
                    <VStack className="p-4 pt-8 flex-1 flex flex-col justify-between w-full space-y-3">
                      <VStack className="space-y-2 w-full">
                        {/* Title slot: fixed height row */}
                        <HStack className="h-7 items-center w-full">
                          <Heading
                            level={3}
                            className="text-lg font-black text-white group-hover:text-orange-400 transition truncate w-full"
                          >
                            {venue.restaurantName || venue.name}
                          </Heading>
                        </HStack>

                        {/* Location / Details: fixed height row */}
                        <HStack className="h-5 items-center gap-x-3 text-xs text-slate-300 w-full">
                          <HStack className="flex items-center gap-1 truncate">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-orange-400" />
                            <Text className="text-xs text-slate-300 truncate">
                              {venue.city || "Sede principal"}
                            </Text>
                          </HStack>
                          <HStack className="flex items-center gap-1 shrink-0 text-slate-300">
                            <Clock className="h-3.5 w-3.5 text-orange-400" />
                            <Text className="text-xs text-slate-300">25 - 40 min</Text>
                          </HStack>
                          <Text weight="bold" className="font-bold text-orange-400 text-xs shrink-0">
                            {venue.currency || "COP"}
                          </Text>
                        </HStack>

                        {/* Horario slot: fixed height row for ALL cards */}
                        <HStack className="h-5 items-center text-xs text-slate-400 w-full">
                          <Text className="text-xs text-slate-400 truncate">
                            {venue.openingHours
                              ? `Horario: ${venue.openingHours}`
                              : "Horario habitual de atención"}
                          </Text>
                        </HStack>
                      </VStack>

                      {/* Footer Actions: social + button pinned to bottom */}
                      <VStack className="pt-2 border-t border-slate-800/80 w-full space-y-2.5 mt-auto">
                        <HStack className="h-6 items-center w-full">
                          {venue.phone || venue.socialLinks ? (
                            <BusinessSocialLinks venue={venue} variant="compact" />
                          ) : (
                            <Text className="text-[11px] text-slate-500 italic">
                              Atención en línea
                            </Text>
                          )}
                        </HStack>

                        <Link
                          href={`/r/${targetSlug}`}
                          className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition cursor-pointer no-underline ${
                            venue.isOpen !== false
                              ? "bg-orange-600 text-white shadow-md shadow-orange-600/30 hover:bg-orange-500"
                              : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/60"
                          }`}
                        >
                          <Text weight="bold" className="text-xs text-white">
                            {venue.isOpen !== false
                              ? "Ver Catálogo & Pedir"
                              : "Cerrado • Ver Catálogo"}
                          </Text>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </VStack>
                    </VStack>
                  </Card>
                );
              })}
            </Grid>
          )}
        </VStack>

        {/* Business Recruitment Callout */}
        <Card className="mt-16 rounded-3xl border border-orange-500/30 bg-linear-to-r from-orange-950/40 via-slate-900 to-slate-900 p-8 sm:p-10 relative overflow-hidden w-full">
          <VStack className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
          <HStack className="flex flex-col sm:flex-row items-center justify-between gap-6 relative w-full">
            <VStack className="space-y-2 text-center sm:text-left">
              <HStack className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-400">
                <Building2 className="h-4 w-4" />
                <Text weight="bold" className="text-xs text-orange-400">¿Tienes un restaurante o comercio?</Text>
              </HStack>
              <Heading level={3} className="text-2xl font-black text-white">
                Vende en Pallevar y haz crecer tus ventas
              </Heading>
              <Text className="text-xs sm:text-sm text-slate-400 max-w-xl block">
                Crea tu catálogo en minutos, recibe pedidos directos en tu
                cocina o mostrador y despacha a domicilio con total control y
                sin comisiones asfixiantes.
              </Text>
            </VStack>
            <Link
              href="/para-negocios"
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-orange-600/25 hover:bg-orange-500 transition"
            >
              <Text weight="bold" className="text-xs text-white">Afiliar mi Negocio</Text>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </HStack>
        </Card>
      </VStack>
    </VStack>
  );
}