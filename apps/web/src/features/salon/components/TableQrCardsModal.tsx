import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  QrCode,
  Printer,
  Wifi,
  LayoutGrid,
  CreditCard,
  Maximize2,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { TableItem, FloorPlanItem } from '../types/salon.types';
import { TableQrCardPrintSheet, CardLayoutMode } from './TableQrCardPrintSheet';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';

interface TableQrCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tables: TableItem[];
  floorPlans: FloorPlanItem[];
  venueId: string;
  initialTableId?: string | null;
}

export const TableQrCardsModal: React.FC<TableQrCardsModalProps> = ({
  isOpen,
  onClose,
  tables,
  floorPlans,
  venueId,
  initialTableId,
}) => {
  const { accountProfile, availableVenues } = useAuthStore();
  const currentVenue = availableVenues.find((v) => v.id === venueId);

  const [venueSlug, setVenueSlug] = useState<string>('');
  const [selectedScope, setSelectedScope] = useState<'all' | 'floor_plan' | 'single'>('all');
  const [selectedFloorPlanId, setSelectedFloorPlanId] = useState<string>('all');
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [layoutMode, setLayoutMode] = useState<CardLayoutMode>('grid_a4');

  // Customization state
  const [customTitle, setCustomTitle] = useState('¡Bienvenidos! Escaneá para ver el menú');
  const [customSubtitle, setCustomSubtitle] = useState('Apuntá la cámara de tu celular al código QR');
  const [includeWifi, setIncludeWifi] = useState(false);
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [accentColor, setAccentColor] = useState('#ea580c');
  const [isCopiedSample, setIsCopiedSample] = useState(false);

  // Fetch venue details for slug
  useEffect(() => {
    if (!venueId) return;
    let isMounted = true;
    fetch(`/api/venues/${venueId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted) return;
        setVenueSlug(data?.slug || venueId);
      })
      .catch(() => {
        if (isMounted) setVenueSlug(venueId);
      });
    return () => {
      isMounted = false;
    };
  }, [venueId]);

  // Set initial table if provided
  useEffect(() => {
    if (initialTableId) {
      setSelectedScope('single');
      setSelectedTableId(initialTableId);
    } else {
      setSelectedScope('all');
    }
  }, [initialTableId, isOpen]);

  // Delivery base URL for customer QR codes
  const deliveryBaseUrl = useMemo(() => {
    const envUrl = import.meta.env.VITE_DELIVERY_URL;
    if (envUrl) {
      return envUrl.replace(/\/$/, '');
    }
    if (typeof window !== 'undefined') {
      return `${window.location.protocol}//${window.location.hostname}:3001`;
    }
    return 'http://localhost:3001';
  }, []);

  const venueName = currentVenue?.name || accountProfile?.venueName || 'Restaurante';
  const venueLogo = accountProfile?.companyLogo || null;

  // Filter tables according to scope
  const filteredTables = useMemo(() => {
    if (selectedScope === 'single' && selectedTableId) {
      return tables.filter((t) => t.id === selectedTableId);
    }
    if (selectedScope === 'floor_plan' && selectedFloorPlanId !== 'all') {
      return tables.filter((t) => t.floorPlanId === selectedFloorPlanId);
    }
    return tables;
  }, [tables, selectedScope, selectedTableId, selectedFloorPlanId]);

  // Print execution
  const handlePrint = () => {
    if (filteredTables.length === 0) {
      toast.error('No hay mesas para imprimir.');
      return;
    }

    document.body.classList.add('printing-qr-cards');
    const handleAfterPrint = () => {
      document.body.classList.remove('printing-qr-cards');
      window.removeEventListener('afterprint', handleAfterPrint);
    };

    window.addEventListener('afterprint', handleAfterPrint);
    window.print();

    // Fallback cleanup
    setTimeout(() => {
      document.body.classList.remove('printing-qr-cards');
    }, 2000);
  };

  const sampleUrl = useMemo(() => {
    const firstTable = filteredTables[0] || { label: '1' };
    const cleanSlug = venueSlug || 'menu';
    return `${deliveryBaseUrl}/r/${encodeURIComponent(cleanSlug)}?table=${encodeURIComponent(firstTable.label)}`;
  }, [deliveryBaseUrl, venueSlug, filteredTables]);

  const handleCopySampleUrl = () => {
    navigator.clipboard.writeText(sampleUrl);
    setIsCopiedSample(true);
    toast.success('Enlace de muestra copiado al portapapeles');
    setTimeout(() => setIsCopiedSample(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-5xl h-[92vh] flex flex-col p-0 overflow-hidden rounded-2xl bg-card border-border">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b border-border flex flex-row items-center justify-between space-y-0 shrink-0">
            <div>
              <DialogTitle className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
                <QrCode className="w-5 h-5 text-primary" />
                <span>Generador de Tarjetas QR para Mesas</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Personalizá e imprimí códigos QR de alta definición para colocar en las mesas de tu salón.
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-4 h-9 rounded-xl shadow-md transition"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / Guardar PDF</span>
              </Button>
            </div>
          </DialogHeader>

          {/* Main Grid: Controls (Left) + Live Preview (Right) */}
          <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
            {/* Left Column: Settings & Filter Controls */}
            <div className="md:col-span-5 p-6 border-b md:border-b-0 md:border-r border-border overflow-y-auto space-y-6 bg-muted/20">
              {/* Scope Selector */}
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  1. Selección de Mesas ({filteredTables.length} seleccionadas)
                </Label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-muted rounded-xl">
                  <button
                    type="button"
                    onClick={() => setSelectedScope('all')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition ${
                      selectedScope === 'all'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Todas ({tables.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedScope('floor_plan')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition ${
                      selectedScope === 'floor_plan'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Por Zona
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedScope('single');
                      if (!selectedTableId && tables.length > 0) {
                        setSelectedTableId(tables[0].id);
                      }
                    }}
                    className={`py-1.5 text-xs font-bold rounded-lg transition ${
                      selectedScope === 'single'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Individual
                  </button>
                </div>

                {/* Sub-selectors */}
                {selectedScope === 'floor_plan' && (
                  <div className="space-y-1.5 pt-1">
                    <Label className="text-xs text-muted-foreground">Seleccionar Zona / Salón</Label>
                    <select
                      value={selectedFloorPlanId}
                      onChange={(e) => setSelectedFloorPlanId(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary outline-none"
                    >
                      <option value="all">Todas las zonas</option>
                      {floorPlans.map((fp) => (
                        <option key={fp.id} value={fp.id}>
                          {fp.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedScope === 'single' && (
                  <div className="space-y-1.5 pt-1">
                    <Label className="text-xs text-muted-foreground">Seleccionar Mesa</Label>
                    <select
                      value={selectedTableId}
                      onChange={(e) => setSelectedTableId(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary outline-none"
                    >
                      {tables.map((t) => (
                        <option key={t.id} value={t.id}>
                          Mesa {t.label} (Capacidad: {t.capacity})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Layout Mode Selector */}
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  2. Formato de Impresión
                </Label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => setLayoutMode('grid_a4')}
                    className={`p-3 rounded-xl border text-left flex items-start gap-3 transition ${
                      layoutMode === 'grid_a4'
                        ? 'bg-primary/10 border-primary text-foreground shadow-sm'
                        : 'bg-card border-border hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    <LayoutGrid className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-foreground">
                        Cuadrícula A4 (4 tarjetas por hoja)
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        Económico y veloz. Con guías punteadas listas para recortar.
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLayoutMode('stand_10x15')}
                    className={`p-3 rounded-xl border text-left flex items-start gap-3 transition ${
                      layoutMode === 'stand_10x15'
                        ? 'bg-primary/10 border-primary text-foreground shadow-sm'
                        : 'bg-card border-border hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-foreground">
                        Display Acrílico / Carpa (10 x 15 cm)
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        Medida estándar para soportes de mesa acrílicos transparentes.
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLayoutMode('tent_fold')}
                    className={`p-3 rounded-xl border text-left flex items-start gap-3 transition ${
                      layoutMode === 'tent_fold'
                        ? 'bg-primary/10 border-primary text-foreground shadow-sm'
                        : 'bg-card border-border hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    <Maximize2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-foreground">
                        Carpa de Mesa Plegable (Tent Card)
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        Frente y dorso duplicados con línea de pliegue central.
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Customization Details */}
              <div className="space-y-4 pt-2 border-t border-border">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  3. Textos & Diseño
                </Label>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Mensaje superior</Label>
                  <Input
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="h-8 text-xs font-medium"
                    placeholder="¡Bienvenidos! Escaneá para ver el menú"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Instrucción al comensal</Label>
                  <Input
                    value={customSubtitle}
                    onChange={(e) => setCustomSubtitle(e.target.value)}
                    className="h-8 text-xs font-medium"
                    placeholder="Apuntá la cámara de tu celular al código QR"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Color de acento</Label>
                  <div className="flex items-center gap-2">
                    {['#ea580c', '#0284c7', '#16a34a', '#8b5cf6', '#0f172a'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setAccentColor(c)}
                        className={`w-5 h-5 rounded-full border-2 transition ${
                          accentColor === c ? 'scale-125 border-foreground' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-6 h-6 p-0 border-0 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* Wi-Fi Toggle */}
                <div className="pt-2 border-t border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Wifi className="w-4 h-4 text-primary" />
                      <Label className="text-xs font-bold text-foreground">Incluir Wi-Fi del local</Label>
                    </div>
                    <Switch
                      checked={includeWifi}
                      onCheckedChange={setIncludeWifi}
                    />
                  </div>

                  {includeWifi && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">Nombre de red (SSID)</Label>
                        <Input
                          value={wifiSsid}
                          onChange={(e) => setWifiSsid(e.target.value)}
                          placeholder="Ej. WiFi-Clientes"
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">Contraseña</Label>
                        <Input
                          value={wifiPassword}
                          onChange={(e) => setWifiPassword(e.target.value)}
                          placeholder="Clave123"
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Sample Target URL */}
                <div className="pt-2 border-t border-border space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-muted-foreground">Enlace destino generado:</span>
                    <button
                      type="button"
                      onClick={handleCopySampleUrl}
                      className="text-primary hover:underline flex items-center gap-1 text-[11px]"
                    >
                      {isCopiedSample ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-500 font-bold">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar URL</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-2 rounded-lg bg-background border border-border text-[10px] font-mono text-muted-foreground break-all select-all flex items-center justify-between gap-1">
                    <span className="truncate">{sampleUrl}</span>
                    <a
                      href={sampleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground shrink-0"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Live Preview */}
            <div className="md:col-span-7 bg-slate-100/70 dark:bg-slate-950/40 p-6 overflow-y-auto flex flex-col items-center">
              <div className="w-full max-w-xl flex items-center justify-between pb-4 text-xs font-semibold text-muted-foreground">
                <span>Vista Previa en Tiempo Real ({filteredTables.length} mesas)</span>
                <Badge variant="outline" className="bg-background text-foreground text-[10px]">
                  {layoutMode === 'grid_a4'
                    ? 'Hoja A4 (4 tarjetas por página)'
                    : layoutMode === 'stand_10x15'
                    ? '10 x 15 cm individual'
                    : 'Carpa plegable'}
                </Badge>
              </div>

              {/* Printable sheet container inside preview */}
              <div className="w-full max-w-xl shadow-lg rounded-2xl overflow-hidden">
                <TableQrCardPrintSheet
                  tables={filteredTables}
                  venueName={venueName}
                  venueSlug={venueSlug}
                  venueLogo={venueLogo}
                  deliveryBaseUrl={deliveryBaseUrl}
                  layoutMode={layoutMode}
                  customTitle={customTitle}
                  customSubtitle={customSubtitle}
                  includeWifi={includeWifi}
                  wifiSsid={wifiSsid}
                  wifiPassword={wifiPassword}
                  accentColor={accentColor}
                  isPreview={true}
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Actual Hidden Portal for window.print() */}
      {typeof document !== 'undefined' &&
        createPortal(
          <div id="printable-table-qr-root" className="hidden print:block">
            <TableQrCardPrintSheet
              tables={filteredTables}
              venueName={venueName}
              venueSlug={venueSlug}
              venueLogo={venueLogo}
              deliveryBaseUrl={deliveryBaseUrl}
              layoutMode={layoutMode}
              customTitle={customTitle}
              customSubtitle={customSubtitle}
              includeWifi={includeWifi}
              wifiSsid={wifiSsid}
              wifiPassword={wifiPassword}
              accentColor={accentColor}
              isPreview={false}
            />
          </div>,
          document.body
        )}
    </>
  );
};

export default TableQrCardsModal;
