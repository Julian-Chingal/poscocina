import React from "react";
import Link from "next/link";
import {
  Store,
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  Sparkles,
  ChefHat,
  Search,
} from "lucide-react";
import { VenuePublicProfile } from "../types/delivery";

async function getPublicVenues(): Promise<VenuePublicProfile[]> {
  try {
    const backendUrl = process.env.INTERNAL_API_URL || "http://localhost:3000";
    const res = await fetch(`${backendUrl}/api/public/venues`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.error("Error fetching public venues on SSR", e);
    return [];
  }
}

export default async function MultiVenueDirectoryPage() {
  const venues = await getPublicVenues();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    name: "poscocina Delivery Network",
    image: "http://localhost:3001/pwa-512x512.png",
    description:
      "Red de restaurantes y sedes gastronómicas con delivery en tiempo real.",
    hasMenu: "http://localhost:3001",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-linear-to-b from-orange-600/10 via-transparent to-transparent pointer-events-none" />

        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-16">
          {/* Hero Section */}
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3.5 py-1 text-xs font-semibold text-orange-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Gastronomía Artesanal a Domicilio</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Elige tu sede y pide en minutos
            </h1>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Preparación artesanal en vivo, despacho directo desde cocina y
              comanda sincronizada en tiempo real.
            </p>
          </div>

          {/* Venues Grid */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Store className="h-5 w-5 text-orange-500" />
                <span>Restaurantes & Sedes Disponibles ({venues.length})</span>
              </h2>
            </div>

            {venues.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center">
                <ChefHat className="h-12 w-12 text-slate-700 mx-auto" />
                <h3 className="mt-4 font-bold text-slate-200">
                  No se encontraron sedes activas
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Crea una sede desde el panel de administración (/web) para
                  comenzar a recibir pedidos.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {venues.map((venue) => {
                  const targetSlug = venue.slug || venue.id;
                  return (
                    <div
                      key={venue.id}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6 transition-all duration-300 hover:border-orange-500/50 hover:bg-slate-900 hover:shadow-xl hover:shadow-orange-600/5"
                    >
                      <div>
                        {/* Header card with logo/badge */}
                        <div className="flex items-start justify-between gap-3">
                          <div
                            className="flex h-12 w-12 items-center justify-center rounded-xl font-black text-white shadow-md text-lg"
                            style={{
                              backgroundColor: venue.primaryColor || "#ea580c",
                            }}
                          >
                            {venue.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap justify-end">
                            {venue.isPrimary && (
                              <span className="rounded-full bg-orange-500/15 border border-orange-500/30 px-2.5 py-0.5 text-[11px] font-bold text-orange-300">
                                Sede Principal
                              </span>
                            )}
                            {venue.isOpen !== false ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Abierto
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 text-[11px] font-bold text-rose-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                Cerrado
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title & Info */}
                        <h3 className="mt-4 text-xl font-bold text-white group-hover:text-orange-400 transition">
                          {venue.name}
                        </h3>

                        {venue.address && (
                          <p className="mt-2 flex items-start gap-2 text-xs text-slate-400">
                            <MapPin className="h-4 w-4 shrink-0 text-slate-500 mt-0.5" />
                            <span>
                              {venue.address}
                              {venue.city ? `, ${venue.city}` : ""}
                            </span>
                          </p>
                        )}

                        {venue.phone && (
                          <p className="mt-1.5 flex items-center gap-2 text-xs text-slate-400">
                            <Phone className="h-4 w-4 shrink-0 text-slate-500" />
                            <span>{venue.phone}</span>
                          </p>
                        )}

                        <div className="mt-4 flex flex-col gap-2 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-orange-400" />
                              <span>25 - 40 min</span>
                            </div>
                            <span>{venue.currency || "COP"}</span>
                          </div>
                          {venue.openingHours && (
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate" title={venue.openingHours}>
                              <span>Horario:</span>
                              <span className="text-slate-400 font-medium">{venue.openingHours}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* CTA Button */}
                      <Link
                        href={`/r/${targetSlug}`}
                        className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition ${
                          venue.isOpen !== false
                            ? "bg-orange-600/90 text-white shadow-sm hover:bg-orange-500"
                            : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/60"
                        }`}
                      >
                        <span>{venue.isOpen !== false ? "Ver Menú & Pedir" : "Cerrado • Ver Menú"}</span>
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
