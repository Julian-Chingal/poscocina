import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, ZoomIn, ZoomOut, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface LocationPickerMapProps {
  latitude?: number | null;
  longitude?: number | null;
  departmentName?: string;
  municipalityName?: string;
  flyToCoords?: [number, number] | null;
  onChange: (coords: { latitude: number; longitude: number }) => void;
  className?: string;
}

// Custom crisp SVG Pin Icon to eliminate any missing png asset issues
const createCustomPinIcon = () => {
  return L.divIcon({
    className: 'custom-leaflet-pin',
    html: `
      <div style="position: relative; width: 34px; height: 42px; transform: translate(-50%, -100%);">
        <svg viewBox="0 0 24 24" width="34" height="42" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#ea580c" stroke="#ffffff" stroke-width="1.8"/>
          <circle cx="12" cy="9" r="3.2" fill="#ffffff"/>
        </svg>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  latitude,
  longitude,
  departmentName,
  municipalityName,
  flyToCoords,
  onChange,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [showCtrlPrompt, setShowCtrlPrompt] = useState(false);
  const ctrlTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  // Default initial coordinates: Colombia center or Bogota
  const defaultCenter: [number, number] = [4.7110, -74.0721];
  const hasCoords = typeof latitude === 'number' && typeof longitude === 'number' && !isNaN(latitude) && !isNaN(longitude);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      const initialLat = hasCoords ? latitude! : flyToCoords ? flyToCoords[0] : defaultCenter[0];
      const initialLng = hasCoords ? longitude! : flyToCoords ? flyToCoords[1] : defaultCenter[1];
      const initialZoom = hasCoords ? 16 : 13;

      const map = L.map(containerRef.current, {
        center: [initialLat, initialLng],
        zoom: initialZoom,
        zoomControl: false, // Custom controls to ensure Ctrl zoom enforcement
        scrollWheelZoom: false, // Crucial: disabled by default; zoom only with Ctrl key
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Attribution small at bottom right
      L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);

      // Handle map clicks to place / move marker
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        const roundedLat = parseFloat(lat.toFixed(6));
        const roundedLng = parseFloat(lng.toFixed(6));
        onChange({ latitude: roundedLat, longitude: roundedLng });
      });

      // Wheel event interceptor: enforce Ctrl + scroll
      const container = containerRef.current;
      const onWheel = (e: WheelEvent) => {
        if (e.ctrlKey) {
          e.preventDefault();
          if (e.deltaY < 0) {
            map.zoomIn(1);
          } else {
            map.zoomOut(1);
          }
        } else {
          // Notify user to hold Ctrl key
          setShowCtrlPrompt(true);
          if (ctrlTimeoutRef.current) clearTimeout(ctrlTimeoutRef.current);
          ctrlTimeoutRef.current = setTimeout(() => {
            setShowCtrlPrompt(false);
          }, 1600);
        }
      };

      container.addEventListener('wheel', onWheel, { passive: false });

      mapRef.current = map;

      // Invalidate size once modal animation stabilizes
      const resizeTimer = setTimeout(() => {
        map.invalidateSize();
      }, 250);

      return () => {
        clearTimeout(resizeTimer);
        container.removeEventListener('wheel', onWheel);
        map.remove();
        mapRef.current = null;
      };
    }
  }, []); // Run once on mount

  // Sync Marker when latitude or longitude changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (hasCoords) {
      const pos: L.LatLngExpression = [latitude!, longitude!];

      if (!markerRef.current) {
        const pinIcon = createCustomPinIcon();
        const marker = L.marker(pos, {
          icon: pinIcon,
          draggable: true,
          autoPan: true,
        }).addTo(map);

        marker.on('dragend', () => {
          const newPos = marker.getLatLng();
          onChange({
            latitude: parseFloat(newPos.lat.toFixed(6)),
            longitude: parseFloat(newPos.lng.toFixed(6)),
          });
        });

        markerRef.current = marker;
      } else {
        markerRef.current.setLatLng(pos);
      }
    } else if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  }, [latitude, longitude, hasCoords, onChange]);

  // Sync Map center when flyToCoords change (e.g. user selected another municipality or department)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !flyToCoords) return;
    map.flyTo(flyToCoords, 14, { duration: 1.2 });
  }, [flyToCoords]);

  // Recenter map on current coordinates if present
  const handleRecenterOnPin = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    if (hasCoords) {
      map.flyTo([latitude!, longitude!], 17, { duration: 1 });
    } else if (flyToCoords) {
      map.flyTo(flyToCoords, 14, { duration: 1 });
    }
  }, [hasCoords, latitude, longitude, flyToCoords]);

  const targetAreaName = [municipalityName, departmentName].filter(Boolean).join(', ');

  // GPS Geolocation detector
  const handleDetectGPS = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización.');
      return;
    }
    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingGps(false);
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        onChange({ latitude: lat, longitude: lng });
        if (mapRef.current) {
          mapRef.current.flyTo([lat, lng], 17, { duration: 1.2 });
        }
      },
      () => {
        setIsDetectingGps(false);
        alert('No se pudo obtener la ubicación GPS actual.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [onChange]);

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-border shadow-inner bg-muted/20 ${className}`}>
      {/* Map Container */}
      <div
        ref={containerRef}
        className="w-full h-[280px] sm:h-[320px] z-0 focus:outline-none"
        tabIndex={0}
      />

      {/* Ctrl + Scroll Warning Overlay (Google Maps Style) */}
      {showCtrlPrompt && (
        <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] z-20 flex items-center justify-center p-4 transition-all duration-200 pointer-events-none animate-in fade-in">
          <div className="bg-popover/95 text-popover-foreground px-4 py-2.5 rounded-xl shadow-xl border border-border flex items-center gap-2 text-xs font-semibold">
            <Info className="w-4 h-4 text-primary shrink-0" />
            <span>Presiona la tecla <kbd className="px-1.5 py-0.5 bg-muted rounded font-mono text-primary font-bold">Ctrl</kbd> para hacer zoom con la rueda</span>
          </div>
        </div>
      )}

      {/* Floating Header / Instructions Badge */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-wrap items-center gap-1.5 pointer-events-none">
        <Badge
          variant="secondary"
          className="bg-background/90 backdrop-blur-md border-border/80 shadow-sm text-[11px] font-medium gap-1 text-foreground pointer-events-auto"
        >
          <MapPin className="w-3 h-3 text-primary" />
          <span>{hasCoords ? 'Haz clic en el mapa para reubicar' : 'Haz clic en el mapa para fijar el punto'}</span>
        </Badge>

        {hasCoords && (
          <Badge
            variant="outline"
            className="bg-background/90 backdrop-blur-md font-mono text-[10px] text-foreground border-border/80 shadow-sm"
          >
            {latitude?.toFixed(5)}, {longitude?.toFixed(5)}
          </Badge>
        )}
      </div>

      {/* Custom Zoom & Location Controls (Top Right) */}
      <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1.5">
        <Button
          type="button"
          size="icon"
          variant="secondary"
          onClick={() => mapRef.current?.zoomIn(1)}
          className="w-8 h-8 rounded-xl bg-background/95 hover:bg-background border border-border/80 shadow-md text-foreground cursor-pointer"
          title="Acercar mapa (+)"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          size="icon"
          variant="secondary"
          onClick={() => mapRef.current?.zoomOut(1)}
          className="w-8 h-8 rounded-xl bg-background/95 hover:bg-background border border-border/80 shadow-md text-foreground cursor-pointer"
          title="Alejar mapa (-)"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          size="icon"
          variant="secondary"
          onClick={handleDetectGPS}
          disabled={isDetectingGps}
          className="w-8 h-8 rounded-xl bg-background/95 hover:bg-background border border-border/80 shadow-md text-primary cursor-pointer"
          title="Detectar mi ubicación actual (GPS)"
        >
          <Navigation className={`w-4 h-4 ${isDetectingGps ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Bottom Bar: Action buttons / Status */}
      <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1.5 pointer-events-auto">
        {hasCoords ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleRecenterOnPin}
            className="h-7 text-[11px] px-2.5 bg-background/90 backdrop-blur-md rounded-lg border-border/80 hover:bg-background text-foreground shadow-xs gap-1"
          >
            <MapPin className="w-3 h-3 text-primary" />
            <span>Centrar en Sede</span>
          </Button>
        ) : targetAreaName ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleRecenterOnPin}
            className="h-7 text-[11px] px-2.5 bg-background/90 backdrop-blur-md rounded-lg border-border/80 hover:bg-background text-foreground shadow-xs gap-1"
          >
            <span>Centrar en {targetAreaName}</span>
          </Button>
        ) : null}
      </div>
    </div>
  );
};
