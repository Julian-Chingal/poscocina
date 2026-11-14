'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { Navigation, ZoomIn, ZoomOut, MapPin, Check, Loader2, LocateFixed } from 'lucide-react';
import {
  VStack,
  HStack,
  Text,
  Button,
  Card,
} from '@astryxdesign/core';
import { sileo } from 'sileo';

interface Props {
  initialLat?: number | null;
  initialLng?: number | null;
  venueCoords?: { latitude?: number | null; longitude?: number | null } | null;
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    suggestedAddress?: string;
    suggestedBarrio?: string;
  }) => void;
  onClose?: () => void;
}

const createCustomPinIcon = () => {
  return L.divIcon({
    className: 'custom-delivery-pin',
    html: `
      <div style="position: relative; width: 34px; height: 44px; transform: translate(-50%, -100%);">
        <svg viewBox="0 0 24 24" width="34" height="44" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#ea580c" stroke="#ffffff" stroke-width="2"/>
          <circle cx="12" cy="9" r="3.2" fill="#ffffff"/>
        </svg>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

export default function DeliveryLocationPickerMap({
  initialLat,
  initialLng,
  venueCoords,
  onLocationSelect,
  onClose,
}: Props) {
  const containerRef = useRef<HTMLElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Default fallback: Colombia center or Mocoa/venue coords
  const defaultCenter: [number, number] = venueCoords?.latitude && venueCoords?.longitude
    ? [venueCoords.latitude, venueCoords.longitude]
    : [1.1492, -76.6467]; // Default to Mocoa Putumayo (Arepamia's main venue location)

  const [currentCoords, setCurrentCoords] = useState<[number, number]>(() => {
    if (initialLat && initialLng && !isNaN(initialLat) && !isNaN(initialLng)) {
      return [initialLat, initialLng];
    }
    return defaultCenter;
  });

  const [hasMarker, setHasMarker] = useState<boolean>(() => {
    return Boolean(initialLat && initialLng && !isNaN(initialLat) && !isNaN(initialLng));
  });

  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [addressPreview, setAddressPreview] = useState<{
    address?: string;
    barrio?: string;
  } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Reverse geocoding via OpenStreetMap Nominatim
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`,
        { headers: { 'Accept-Language': 'es' } }
      );
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.address) {
        const road = data.address.road || data.address.pedestrian || data.address.path || '';
        const houseNumber = data.address.house_number || '';
        const barrio =
          data.address.neighbourhood ||
          data.address.suburb ||
          data.address.quarter ||
          data.address.residential ||
          '';

        const composedAddress = road ? `${road} ${houseNumber}`.trim() : data.display_name?.split(',')[0] || '';
        setAddressPreview({
          address: composedAddress,
          barrio: barrio,
        });
      }
    } catch (e) {
      console.warn('Reverse geocoding error', e);
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  // Update marker position
  const updateMarker = useCallback(
    (lat: number, lng: number) => {
      setCurrentCoords([lat, lng]);
      setHasMarker(true);

      if (!mapRef.current) return;

      if (!markerRef.current) {
        const pinIcon = createCustomPinIcon();
        const newMarker = L.marker([lat, lng], {
          icon: pinIcon,
          draggable: true,
        }).addTo(mapRef.current);

        newMarker.on('dragend', () => {
          const pos = newMarker.getLatLng();
          updateMarker(pos.lat, pos.lng);
        });

        markerRef.current = newMarker;
      } else {
        markerRef.current.setLatLng([lat, lng]);
      }

      reverseGeocode(lat, lng);
    },
    [reverseGeocode]
  );

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current as HTMLElement, {
      center: currentCoords,
      zoom: 16,
      zoomControl: false,
    });

    // Dark-styled CARTO tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap, &copy; CARTO',
      maxZoom: 19,
    }).addTo(map);

    // Click handler to position pin
    map.on('click', (e: L.LeafletMouseEvent) => {
      updateMarker(e.latlng.lat, e.latlng.lng);
    });

    // If initial coords exist, place pin immediately
    if (initialLat && initialLng && !isNaN(initialLat) && !isNaN(initialLng)) {
      const pinIcon = createCustomPinIcon();
      const initialMarker = L.marker([initialLat, initialLng], {
        icon: pinIcon,
        draggable: true,
      }).addTo(map);

      initialMarker.on('dragend', () => {
        const pos = initialMarker.getLatLng();
        updateMarker(pos.lat, pos.lng);
      });

      markerRef.current = initialMarker;
      reverseGeocode(initialLat, initialLng);
    }

    // Add venue marker if available (for reference)
    if (venueCoords?.latitude && venueCoords?.longitude) {
      const venuePin = L.divIcon({
        className: 'venue-ref-pin',
        html: `
          <div style="background-color: #0f172a; border: 2px solid #ea580c; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.5);">
            <span style="font-size: 14px;">🏪</span>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });
      L.marker([venueCoords.latitude, venueCoords.longitude], {
        icon: venuePin,
        interactive: false,
      })
        .addTo(map)
        .bindTooltip('Sede del Restaurante', { permanent: false, direction: 'top' });
    }

    mapRef.current = map;

    // Fix possible leaflet size invalidation after modal transition
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Browser Geolocation / GPS Detection
  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      sileo.error({
        title: 'GPS no disponible',
        description: 'Tu navegador no soporta geolocalización.',
      });
      return;
    }

    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 17, { animate: true });
        }
        updateMarker(latitude, longitude);
        setIsDetectingGps(false);
        sileo.success({
          title: 'Ubicación detectada',
          description: 'Punto fijado en tu ubicación GPS actual.',
        });
      },
      (err) => {
        setIsDetectingGps(false);
        sileo.warning({
          title: 'No se pudo obtener ubicación',
          description: 'Verifica los permisos de GPS de tu navegador.',
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Confirm and return location to form
  const handleConfirmLocation = () => {
    if (!hasMarker) {
      sileo.warning({
        title: 'Fija un punto en el mapa',
        description: 'Haz clic en el mapa donde deseas recibir tu pedido.',
      });
      return;
    }

    onLocationSelect({
      latitude: currentCoords[0],
      longitude: currentCoords[1],
      suggestedAddress: addressPreview?.address || undefined,
      suggestedBarrio: addressPreview?.barrio || undefined,
    });

    sileo.success({
      title: 'Ubicación seleccionada',
      description: 'Coordenadas y dirección guardadas.',
    });

    if (onClose) onClose();
  };

  return (
    <Card className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col p-0">
      {/* Map Header Instructions */}
      <HStack className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs w-full">
        <HStack className="flex items-center gap-2 text-slate-300">
          <MapPin className="h-4 w-4 text-orange-400 shrink-0" />
          <Text className="text-xs text-slate-300">Toca el mapa o arrastra el pin para fijar tu entrega</Text>
        </HStack>
        {isGeocoding && (
          <HStack className="flex items-center gap-1 text-[11px] text-orange-400">
            <Loader2 className="h-3 w-3 animate-spin" />
            <Text className="text-[11px] text-orange-400">Buscando dirección...</Text>
          </HStack>
        )}
      </HStack>

      {/* Map Canvas */}
      <VStack className="relative w-full h-72 sm:h-80 bg-slate-950">
        <VStack ref={containerRef} className="w-full h-full" />

        {/* Floating Controls */}
        <VStack className="absolute top-3 right-3 z-[400] flex flex-col gap-1.5">
          <Button
            label="Usar mi ubicación GPS"
            type="button"
            onClick={handleDetectGps}
            isDisabled={isDetectingGps}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/95 text-slate-200 hover:text-white hover:bg-slate-800 border border-slate-700/80 shadow-md backdrop-blur-sm transition cursor-pointer"
            tooltip="Usar mi ubicación GPS"
          >
            {isDetectingGps ? (
              <Loader2 className="h-4 w-4 animate-spin text-orange-400" />
            ) : (
              <LocateFixed className="h-4 w-4 text-orange-400" />
            )}
          </Button>

          <Button
            label="Acercar mapa"
            type="button"
            onClick={() => mapRef.current?.zoomIn()}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900/90 text-slate-200 hover:bg-slate-800 border border-slate-700/80 shadow-md backdrop-blur-sm transition cursor-pointer"
            tooltip="Acercar"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>

          <Button
            label="Alejar mapa"
            type="button"
            onClick={() => mapRef.current?.zoomOut()}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900/90 text-slate-200 hover:bg-slate-800 border border-slate-700/80 shadow-md backdrop-blur-sm transition cursor-pointer"
            tooltip="Alejar"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
        </VStack>
      </VStack>

      {/* Address preview & Confirmation Footer */}
      <HStack className="p-3.5 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
        <VStack className="w-full sm:w-auto text-left flex-1 min-w-0">
          {hasMarker ? (
            <VStack>
              <Text weight="bold" className="text-xs font-semibold text-white truncate block">
                {addressPreview?.address || `${currentCoords[0]}, ${currentCoords[1]}`}
              </Text>
              {addressPreview?.barrio && (
                <Text weight="bold" className="text-[11px] text-orange-400 font-medium block">
                  Barrio detectado: {addressPreview.barrio}
                </Text>
              )}
            </VStack>
          ) : (
            <Text className="text-xs text-slate-400 block">Ningún punto seleccionado todavía</Text>
          )}
        </VStack>

        <Button
          label="Fijar esta ubicación"
          type="button"
          onClick={handleConfirmLocation}
          isDisabled={!hasMarker}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-orange-500 disabled:opacity-50 transition cursor-pointer"
        >
          <Check className="h-3.5 w-3.5" />
          <Text weight="bold" className="text-xs text-white">Fijar esta ubicación</Text>
        </Button>
      </HStack>
    </Card>
  );
}