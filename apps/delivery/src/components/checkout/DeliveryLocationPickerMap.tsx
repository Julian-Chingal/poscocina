'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { Navigation, ZoomIn, ZoomOut, MapPin, Check, Loader2, LocateFixed } from 'lucide-react';
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
  const containerRef = useRef<HTMLDivElement | null>(null);
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
    return Boolean(initialLat && initialLng);
  });

  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [addressPreview, setAddressPreview] = useState<{ address: string; barrio: string } | null>(null);

  // Reverse geocoding via OpenStreetMap Nominatim
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'es' } }
      );
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const barrio =
          addr.suburb ||
          addr.neighbourhood ||
          addr.quarter ||
          addr.residential ||
          addr.city_district ||
          addr.village ||
          '';

        const road = addr.road || data.name || '';
        const houseNumber = addr.house_number ? ` #${addr.house_number}` : '';
        const address = road ? `${road}${houseNumber}` : '';

        setAddressPreview({ address, barrio });
        return { address, barrio };
      }
    } catch (e) {
      console.warn('Reverse geocoding error:', e);
    } finally {
      setIsGeocoding(false);
    }
    return { address: '', barrio: '' };
  }, []);

  // Update or place marker
  const updateMarker = useCallback((lat: number, lng: number, mapInstance?: L.Map) => {
    const map = mapInstance || mapRef.current;
    if (!map) return;

    const roundedLat = parseFloat(lat.toFixed(6));
    const roundedLng = parseFloat(lng.toFixed(6));
    setCurrentCoords([roundedLat, roundedLng]);
    setHasMarker(true);

    if (markerRef.current) {
      markerRef.current.setLatLng([roundedLat, roundedLng]);
    } else {
      const marker = L.marker([roundedLat, roundedLng], {
        icon: createCustomPinIcon(),
        draggable: true,
      }).addTo(map);

      marker.on('dragend', (event) => {
        const pos = event.target.getLatLng();
        updateMarker(pos.lat, pos.lng);
      });

      markerRef.current = marker;
    }

    reverseGeocode(roundedLat, roundedLng);
  }, [reverseGeocode]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: currentCoords,
      zoom: hasMarker ? 16 : 14,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);

    if (hasMarker) {
      const marker = L.marker(currentCoords, {
        icon: createCustomPinIcon(),
        draggable: true,
      }).addTo(map);

      marker.on('dragend', (event) => {
        const pos = event.target.getLatLng();
        updateMarker(pos.lat, pos.lng, map);
      });

      markerRef.current = marker;
      reverseGeocode(currentCoords[0], currentCoords[1]);
    }

    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      updateMarker(lat, lng, map);
    });

    mapRef.current = map;

    // Small delay resize to ensure container renders correctly
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Handle GPS detection
  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      sileo.warning({
        title: 'Geolocalización no disponible',
        description: 'Tu navegador no soporta geolocalización automática.',
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
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col">
      {/* Map Header Instructions */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <MapPin className="h-4 w-4 text-orange-400 shrink-0" />
          <span>Toca el mapa o arrastra el pin para fijar tu entrega</span>
        </div>
        {isGeocoding && (
          <span className="flex items-center gap-1 text-[11px] text-orange-400">
            <Loader2 className="h-3 w-3 animate-spin" />
            Buscando dirección...
          </span>
        )}
      </div>

      {/* Map Canvas */}
      <div className="relative w-full h-72 sm:h-80 bg-slate-950">
        <div ref={containerRef} className="w-full h-full" />

        {/* Floating Controls */}
        <div className="absolute top-3 right-3 z-[400] flex flex-col gap-1.5">
          <button
            type="button"
            onClick={handleDetectGps}
            disabled={isDetectingGps}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/95 text-slate-200 hover:text-white hover:bg-slate-800 border border-slate-700/80 shadow-md backdrop-blur-sm transition"
            title="Usar mi ubicación GPS"
          >
            {isDetectingGps ? (
              <Loader2 className="h-4 w-4 animate-spin text-orange-400" />
            ) : (
              <LocateFixed className="h-4 w-4 text-orange-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => mapRef.current?.zoomIn()}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900/90 text-slate-200 hover:bg-slate-800 border border-slate-700/80 shadow-md backdrop-blur-sm transition"
            title="Acercar"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => mapRef.current?.zoomOut()}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900/90 text-slate-200 hover:bg-slate-800 border border-slate-700/80 shadow-md backdrop-blur-sm transition"
            title="Alejar"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Address preview & Confirmation Footer */}
      <div className="p-3.5 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-auto text-left flex-1 min-w-0">
          {hasMarker ? (
            <div>
              <p className="text-xs font-semibold text-white truncate">
                {addressPreview?.address || `${currentCoords[0]}, ${currentCoords[1]}`}
              </p>
              {addressPreview?.barrio && (
                <p className="text-[11px] text-orange-400 font-medium">
                  Barrio detectado: {addressPreview.barrio}
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400">Ningún punto seleccionado todavía</p>
          )}
        </div>

        <button
          type="button"
          onClick={handleConfirmLocation}
          disabled={!hasMarker}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-orange-500 disabled:opacity-50 transition"
        >
          <Check className="h-3.5 w-3.5" />
          <span>Fijar esta ubicación</span>
        </button>
      </div>
    </div>
  );
}
