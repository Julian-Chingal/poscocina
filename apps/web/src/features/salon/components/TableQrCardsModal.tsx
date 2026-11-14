import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Upload,
  Image as ImageIcon,
  Trash2,
  Palette,
  Store,
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
import { getDeliveryBaseUrl } from '@/lib/delivery-url';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Core identification state
  const [customRestaurantName, setCustomRestaurantName] = useState<string>('');
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [venueSlug, setVenueSlug] = useState<string>('');

  // Filtering & layout state
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
  const [qrColor, setQrColor] = useState('#090e17');
  const [includeQrLogo, setIncludeQrLogo] = useState(true);
  const [isCopiedSample, setIsCopiedSample] = useState(false);

  // Delivery base URL
  const defaultDeliveryBaseUrl = useMemo(() => {
    return getDeliveryBaseUrl();
  }, []);

  const [deliveryBaseUrl, setDeliveryBaseUrl] = useState<string>(defaultDeliveryBaseUrl);

  // Fetch venue and profile details
  useEffect(() => {
    if (!venueId) return;
    let isMounted = true;

    // Pre-populate with auth store data first
    const fallbackName = currentVenue?.name || accountProfile?.venueName || accountProfile?.companyName || '';
    if (fallbackName && !customRestaurantName) {
      setCustomRestaurantName(fallbackName);
    }
    if (accountProfile?.companyLogo && !customLogo) {
      setCustomLogo(accountProfile.companyLogo);
    }

    // Then fetch detailed venue data
    fetch(`/api/public/venues/${venueId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data) return;
        if (data.name) setCustomRestaurantName((prev) => prev || data.name);
        if (data.logoUrl) setCustomLogo((prev) => prev || data.logoUrl);
        if (data.slug) setVenueSlug(data.slug);
        if (data.primaryColor) setAccentColor((prev) => (prev === '#ea580c' ? data.primaryColor : prev));
      })
      .catch(() => {
        fetch(`/api/venues/${venueId}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (!isMounted || !data) return;
            if (data.name) setCustomRestaurantName((prev) => prev || data.name);
            if (data.slug) setVenueSlug(data.slug || venueId);
          })
          .catch(() => {
            if (isMounted) setVenueSlug(venueId);
          });
      });

    return () => {
      isMounted = false;
    };
  }, [venueId, currentVenue, accountProfile]);

  // Set initial table if provided
  useEffect(() => {
    if (initialTableId) {
      setSelectedScope('single');
      setSelectedTableId(initialTableId);
    } else {
      setSelectedScope('all');
    }
  }, [initialTableId, isOpen]);

  // Handle local logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('El logo no debe superar los 2 MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCustomLogo(result);
      setIncludeQrLogo(true);
      toast.success('Logo cargado e incrustado en el QR');
    };
    reader.readAsDataURL(file);
  };

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
    const base = deliveryBaseUrl.replace(/\/$/, '');
    return `${base}/r/${encodeURIComponent(cleanSlug)}?table=${encodeURIComponent(firstTable.label)}`;
  }, [deliveryBaseUrl, venueSlug, filteredTables]);

  const handleCopySampleUrl = () => {
    navigator.clipboard.writeText(sampleUrl);
    setIsCopiedSample(true);
    toast.success('Enlace copiado al portapapeles');
    setTimeout(() => setIsCopiedSample(false), 2000);
  };

  const activeRestaurantName = customRestaurantName || currentVenue?.name || 'Restaurante';

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
                Personalizá tu marca, logo y colores en las tarjetas de mesa y códigos QR de alta resolución.
              </DialogDescription>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-4 h-9 rounded-xl shadow-md transition"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / Guardar PDF</span>
              </Button>
              <span className="text-[10px] text-muted-foreground hidden sm:inline">
                Tip: Tildá &quot;Gráficos en segundo plano&quot; al imprimir
              </span>
            </div>
          </DialogHeader>

          {/* Main Grid: Controls (Left) + Live Preview (Right) */}
          <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
            {/* Left Column: Settings & Customization Controls */}
            <div className="md:col-span-5 p-6 border-b md:border-b-0 md:border-r border-border overflow-y-auto space-y-6 bg-muted/20">
              {/* 1. Brand Identity Customization */}
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-primary" />
                  <span>1. Identidad del Restaurante</span>
                </Label>

                {/* Restaurant Name Input */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Nombre del Restaurante</Label>
                  <Input
                    value={customRestaurantName}
                    onChange={(e) => setCustomRestaurantName(e.target.value)}
                    placeholder="Ej. Zogui Parrilla Gourmet"
                    className="h-8 text-xs font-bold"
                  />
                </div>

                {/* Logo Upload & Preview */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">Logo de la Marca</Label>
                    {customLogo && (
                      <button
                        type="button"
                        onClick={() => setCustomLogo(null)}
                        className="text-[11px] text-destructive hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Quitar</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded-xl bg-card border border-border">
                    {customLogo ? (
                      <div className="h-12 w-12 rounded-xl p-1 bg-white border border-border shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                        <img
                          src={customLogo}
                          alt="Logo del restaurante"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-xl bg-muted border border-dashed border-border flex items-center justify-center shrink-0 text-muted-foreground">
                        <ImageIcon className="w-5 h-5 opacity-40" />
                      </div>
                    )}

                    <div className="flex-1 space-y-1">
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/svg+xml, image/webp"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-8 text-xs w-full font-bold flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{customLogo ? 'Cambiar Logo' : 'Subir Imagen de Logo'}</span>
                      </Button>
                      <p className="text-[10px] text-muted-foreground text-center">
                        PNG, JPG o SVG (máx. 2 MB)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. QR Code Customization */}
              <div className="space-y-3 pt-2 border-t border-border">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-primary" />
                  <span>2. Personalización del Código QR</span>
                </Label>

                {/* Toggle Logo Inside QR */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border">
                  <div className="space-y-0.5 pr-2">
                    <Label className="text-xs font-bold text-foreground">
                      Incrustar Logo en el Centro del QR
                    </Label>
                    <p className="text-[10px] text-muted-foreground">
                      Inserta el logo del restaurante dentro del código QR con recorte nítido.
                    </p>
                  </div>
                  <Switch
                    checked={includeQrLogo && !!customLogo}
                    disabled={!customLogo}
                    onCheckedChange={setIncludeQrLogo}
                  />
                </div>

                {/* QR Color Selector */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">Color del Código QR</Label>
                    <span className="text-[10px] font-mono font-semibold text-muted-foreground">
                      {qrColor}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[
                      { label: 'Negro', value: '#090e17' },
                      { label: 'Color Acento', value: accentColor },
                      { label: 'Azul Marino', value: '#1e3a8a' },
                      { label: 'Vino Tinto', value: '#881337' },
                      { label: 'Esmeralda', value: '#065f46' },
                    ].map((item) => (
                      <button
                        key={item.label + item.value}
                        type="button"
                        onClick={() => setQrColor(item.value)}
                        className={`h-6 w-6 rounded-full border-2 transition ${
                          qrColor === item.value ? 'scale-125 border-foreground ring-2 ring-primary/40' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: item.value }}
                        title={item.label}
                      />
                    ))}
                    <div className="flex items-center gap-1 ml-auto">
                      <input
                        type="color"
                        value={qrColor}
                        onChange={(e) => setQrColor(e.target.value)}
                        className="w-6 h-6 p-0 border-0 rounded cursor-pointer"
                        title="Elegir color personalizado de QR"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Scope Selector */}
              <div className="space-y-3 pt-2 border-t border-border">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  3. Selección de Mesas ({filteredTables.length} seleccionadas)
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

              {/* 4. Layout Mode Selector */}
              <div className="space-y-3 pt-2 border-t border-border">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  4. Formato de Impresión
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

              {/* 5. Texts & Styling */}
              <div className="space-y-4 pt-2 border-t border-border">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-primary" />
                  <span>5. Textos & Color de Acento</span>
                </Label>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Mensaje superior</Label>
                  <Input
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="h-8 text-xs font-medium"
                    placeholder="¡Bienvenidos! Escaneá para ver el menú"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Instrucción al comensal</Label>
                  <Input
                    value={customSubtitle}
                    onChange={(e) => setCustomSubtitle(e.target.value)}
                    className="h-8 text-xs font-medium"
                    placeholder="Apuntá la cámara de tu celular al código QR"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Color de acento de la tarjeta</Label>
                  <div className="flex items-center gap-2">
                    {['#ea580c', '#0284c7', '#16a34a', '#8b5cf6', '#0f172a'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setAccentColor(c);
                          if (qrColor === accentColor) setQrColor(c);
                        }}
                        className={`w-5 h-5 rounded-full border-2 transition ${
                          accentColor === c ? 'scale-125 border-foreground' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => {
                        setAccentColor(e.target.value);
                        if (qrColor === accentColor) setQrColor(e.target.value);
                      }}
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

                {/* Target URL Info & Custom Domain */}
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
                  <div className="space-y-1 pt-1">
                    <Label className="text-[10px] text-muted-foreground">URL base del menú (editable si usas dominio personalizado)</Label>
                    <Input
                      value={deliveryBaseUrl}
                      onChange={(e) => setDeliveryBaseUrl(e.target.value)}
                      placeholder="https://menu.tudominio.com"
                      className="h-7 text-[11px] font-mono"
                    />
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
                  venueName={activeRestaurantName}
                  venueSlug={venueSlug}
                  venueLogo={customLogo}
                  deliveryBaseUrl={deliveryBaseUrl}
                  layoutMode={layoutMode}
                  customTitle={customTitle}
                  customSubtitle={customSubtitle}
                  includeWifi={includeWifi}
                  wifiSsid={wifiSsid}
                  wifiPassword={wifiPassword}
                  accentColor={accentColor}
                  qrColor={qrColor}
                  includeQrLogo={includeQrLogo}
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
              venueName={activeRestaurantName}
              venueSlug={venueSlug}
              venueLogo={customLogo}
              deliveryBaseUrl={deliveryBaseUrl}
              layoutMode={layoutMode}
              customTitle={customTitle}
              customSubtitle={customSubtitle}
              includeWifi={includeWifi}
              wifiSsid={wifiSsid}
              wifiPassword={wifiPassword}
              accentColor={accentColor}
              qrColor={qrColor}
              includeQrLogo={includeQrLogo}
              isPreview={false}
            />
          </div>,
          document.body
        )}
    </>
  );
};

export default TableQrCardsModal;
