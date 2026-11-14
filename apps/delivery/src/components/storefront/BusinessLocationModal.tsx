'use client';

import React from 'react';
import {
  MapPin,
  X,
  Navigation,
  Phone,
  Clock,
  ExternalLink,
  Calendar,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { VenuePublicProfile } from '../../types/delivery';

interface Props {
  venue: VenuePublicProfile;
  isOpen: boolean;
  onClose: () => void;
}

export function BusinessLocationModal({ venue, isOpen, onClose }: Props) {
  if (!isOpen) return null;

  const fullAddress = [venue.address, venue.city].filter(Boolean).join(', ');
  const businessName = venue.restaurantName || venue.name;

  // Map embed URL
  let mapEmbedUrl = '';
  if (venue.latitude && venue.longitude) {
    const lat = venue.latitude;
    const lon = venue.longitude;
    mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.005}%2C${lat - 0.003}%2C${lon + 0.005}%2C${lat + 0.003}&layer=mapnik&marker=${lat}%2C${lon}`;
  } else if (fullAddress) {
    mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
      `${businessName}, ${fullAddress}`
    )}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${businessName} ${fullAddress}`
  )}`;

  const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(
    `${businessName} ${fullAddress}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600/20 text-orange-400 border border-orange-500/30">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{businessName}</h2>
              <p className="text-xs text-slate-400">Ubicación y Datos de Contacto</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Map Preview */}
          {mapEmbedUrl ? (
            <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
              <iframe
                title="Mapa de ubicación"
                src={mapEmbedUrl}
                className="w-full h-full border-0"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="w-full h-40 rounded-2xl border border-dashed border-slate-800 bg-slate-950/50 flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
              <MapPin className="h-6 w-6 text-slate-600" />
              <span>Dirección pendiente de confirmación geográfica</span>
            </div>
          )}

          {/* Location details & Navigation links */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Dirección Física
              </span>
              <p className="text-sm font-semibold text-white">
                {fullAddress || 'No especificada'}
              </p>
              {fullAddress && (
                <div className="flex items-center gap-2 pt-2">
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-orange-600/15 border border-orange-500/30 px-3 py-1.5 text-xs font-bold text-orange-300 hover:bg-orange-600/25 transition"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    <span>Google Maps</span>
                    <ExternalLink className="h-3 w-3 opacity-70" />
                  </a>

                  <a
                    href={wazeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 border border-slate-700/60 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700 transition"
                  >
                    <span>Waze</span>
                    <ExternalLink className="h-3 w-3 opacity-70" />
                  </a>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Contacto Directo
              </span>
              {venue.phone ? (
                <>
                  <p className="text-sm font-semibold text-white flex items-center gap-2">
                    <Phone className="h-4 w-4 text-orange-400" />
                    <span>{venue.phone}</span>
                  </p>
                  <div className="pt-2">
                    <a
                      href={`tel:${venue.phone.replace(/[^0-9+]/g, '')}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 border border-slate-700/60 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition"
                    >
                      <span>Llamar al comercio</span>
                    </a>
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-500">Teléfono no registrado</p>
              )}
            </div>
          </div>

          {/* Schedule / Horarios */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-orange-400" />
                <span>Horario de Atención</span>
              </span>
              {venue.isOpen !== false ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  <CheckCircle2 className="h-3 w-3" />
                  Abierto Ahora
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                  <XCircle className="h-3 w-3" />
                  Cerrado
                </span>
              )}
            </div>

            {venue.openingHours && (
              <p className="text-xs text-slate-300 bg-slate-900/80 rounded-xl p-2.5 border border-slate-800">
                {venue.openingHours}
              </p>
            )}

            {venue.schedule && venue.schedule.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                {venue.schedule.map((day) => (
                  <div
                    key={day.day}
                    className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-900/40"
                  >
                    <span className="text-slate-400">{day.dayName}</span>
                    <span
                      className={`font-semibold ${
                        day.enabled ? 'text-slate-200' : 'text-slate-500'
                      }`}
                    >
                      {day.enabled
                        ? `${day.openTime} - ${day.closeTime}`
                        : 'Cerrado'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 bg-slate-950/40 px-6 py-3.5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
