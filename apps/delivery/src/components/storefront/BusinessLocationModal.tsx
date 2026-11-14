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
  Share2,
} from 'lucide-react';
import {
  VStack,
  HStack,
  Grid,
  Text,
  Heading,
  Button,
  Badge,
  Card,
} from '@astryxdesign/core';
import { VenuePublicProfile } from '../../types/delivery';
import { BusinessSocialLinks } from './BusinessSocialLinks';

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
    <VStack className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <VStack
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <HStack className="flex items-center justify-between border-b border-slate-800 px-6 py-4 w-full">
          <HStack className="flex items-center gap-2.5">
            <HStack className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600/20 text-orange-400 border border-orange-500/30">
              <MapPin className="h-5 w-5" />
            </HStack>
            <VStack>
              <Heading level={2} className="text-base font-bold text-white">{businessName}</Heading>
              <Text className="text-xs text-slate-400 block">Ubicación y Datos de Contacto</Text>
            </VStack>
          </HStack>
          <Button
            label="Cerrar modal"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </Button>
        </HStack>

        {/* Content Body */}
        <VStack className="p-6 space-y-6 max-h-[80vh] overflow-y-auto w-full">
          {/* Map Preview */}
          {mapEmbedUrl ? (
            <VStack className="relative w-full h-56 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
              <iframe
                title="Mapa de ubicación"
                src={mapEmbedUrl}
                className="w-full h-full border-0"
                loading="lazy"
              />
            </VStack>
          ) : (
            <VStack className="w-full h-40 rounded-2xl border border-dashed border-slate-800 bg-slate-950/50 flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
              <MapPin className="h-6 w-6 text-slate-600" />
              <Text className="text-xs text-slate-500">Dirección pendiente de confirmación geográfica</Text>
            </VStack>
          )}

          {/* Location details & Navigation links */}
          <Grid className="grid gap-4 sm:grid-cols-2 w-full">
            <Card className="rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4 space-y-2">
              <Text weight="bold" className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Dirección Física
              </Text>
              <Text weight="bold" className="text-sm font-semibold text-white block">
                {fullAddress || 'No especificada'}
              </Text>
              {fullAddress && (
                <HStack className="flex items-center gap-2 pt-2">
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-orange-600/15 border border-orange-500/30 px-3 py-1.5 text-xs font-bold text-orange-300 hover:bg-orange-600/25 transition"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    <Text weight="bold" className="text-xs text-orange-300">Google Maps</Text>
                    <ExternalLink className="h-3 w-3 opacity-70" />
                  </a>

                  <a
                    href={wazeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 border border-slate-700/60 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700 transition"
                  >
                    <Text weight="bold" className="text-xs text-slate-300">Waze</Text>
                    <ExternalLink className="h-3 w-3 opacity-70" />
                  </a>
                </HStack>
              )}
            </Card>

            <Card className="rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4 space-y-2">
              <Text weight="bold" className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Contacto Directo
              </Text>
              {venue.phone ? (
                <>
                  <HStack className="text-sm font-semibold text-white flex items-center gap-2">
                    <Phone className="h-4 w-4 text-orange-400" />
                    <Text weight="bold" className="text-white text-sm">{venue.phone}</Text>
                  </HStack>
                  <VStack className="pt-2">
                    <a
                      href={`tel:${venue.phone.replace(/[^0-9+]/g, '')}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 border border-slate-700/60 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition"
                    >
                      <Text weight="bold" className="text-xs text-slate-200">Llamar al comercio</Text>
                    </a>
                  </VStack>
                </>
              ) : (
                <Text className="text-xs text-slate-500 block">Teléfono no registrado</Text>
              )}
            </Card>
          </Grid>

          {/* Social Networks & Official Channels */}
          <Card className="rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4 space-y-3 w-full">
            <HStack className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Share2 className="h-3.5 w-3.5 text-orange-400" />
              <Text weight="bold" className="text-xs text-slate-400">Redes Sociales & Canales Oficiales</Text>
            </HStack>
            <BusinessSocialLinks venue={venue} variant="cards" />
          </Card>

          {/* Schedule / Horarios */}
          <Card className="rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4 space-y-3 w-full">
            <HStack className="flex items-center justify-between w-full">
              <HStack className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-orange-400" />
                <Text weight="bold" className="text-xs text-slate-400">Horario de Atención</Text>
              </HStack>
              {venue.isOpen !== false ? (
                <Badge
                  label="Abierto Ahora"
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300"
                />
              ) : (
                <Badge
                  label="Cerrado"
                  className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 text-[10px] font-bold text-rose-300"
                />
              )}
            </HStack>

            {venue.openingHours && (
              <Text className="text-xs text-slate-300 bg-slate-900/80 rounded-xl p-2.5 border border-slate-800 block">
                {venue.openingHours}
              </Text>
            )}

            {venue.schedule && venue.schedule.length > 0 && (
              <Grid className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs w-full">
                {venue.schedule.map((day) => (
                  <HStack
                    key={day.day}
                    className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-900/40"
                  >
                    <Text className="text-slate-400 text-xs">{day.dayName}</Text>
                    <Text
                      weight="bold"
                      className={`font-semibold text-xs ${
                        day.enabled ? 'text-slate-200' : 'text-slate-500'
                      }`}
                    >
                      {day.enabled
                        ? `${day.openTime} - ${day.closeTime}`
                        : 'Cerrado'}
                    </Text>
                  </HStack>
                ))}
              </Grid>
            )}
          </Card>
        </VStack>

        {/* Footer */}
        <HStack className="border-t border-slate-800 bg-slate-950/40 px-6 py-3.5 flex justify-end w-full">
          <Button
            label="Cerrar modal"
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700 transition cursor-pointer"
          >
            <Text weight="bold" className="text-xs text-white">Cerrar</Text>
          </Button>
        </HStack>
      </VStack>
    </VStack>
  );
}