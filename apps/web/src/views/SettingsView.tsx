import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Trash2,
  Edit2,
  Play,
  AlertTriangle,
  Building2,
  Receipt,
  Image as ImageIcon,
  Save,
  Check,
  UtensilsCrossed,
  Printer,
  Sparkles,
  Store,
  Plus,
  Layers,
  Users,
  Wallet,
  MapPin,
  Phone,
  Percent,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useBrandingStore, VenueSettings, VenueItem } from '../stores/branding.store';
import { useAuthStore } from '../stores/auth.store';
import { toast } from '../components/ui/sonner';

const COLOR_PRESETS = [
  { name: 'Naranja Gourmet', hex: '#ea580c' },
  { name: 'Rojo Fuego', hex: '#dc2626' },
  { name: 'Verde Orgánico', hex: '#16a34a' },
  { name: 'Azul Bistro', hex: '#2563eb' },
  { name: 'Púrpura Lounge', hex: '#9333ea' },
  { name: 'Ámbar Clásico', hex: '#d97706' },
  { name: 'Grafito Minimalista', hex: '#475569' },
];

type SettingsTab = 'identity' | 'tax' | 'printer' | 'venues';

interface VenueSummaryData {
  venue: VenueItem;
  stats: {
    tables: { total: number; free: number; occupied: number };
    activeOrders: number;
    activeStaff: number;
    openShift: { id: string; openedAt: string; cashierName: string } | null;
  };
}

export const SettingsView: React.FC = () => {
  const { name, address, settings, venueId, venues, loadAllVenues, switchVenue, updateBranding } =
    useBrandingStore();
  const { currentUser, setVenueId } = useAuthStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>('identity');

  // Form State
  const [companyName, setCompanyName] = useState(settings.companyName || name);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor || '#ea580c');
  const [venueAddress, setVenueAddress] = useState(address || '');
  const [taxId, setTaxId] = useState(settings.taxId || '900.123.456-7');
  const [phone, setPhone] = useState(settings.phone || '+57 300 123 4567');
  const [currency, setCurrency] = useState(settings.currency || 'COP');
  const [taxType, setTaxType] = useState<'INC_8' | 'IVA_19' | 'EXENTO'>(settings.taxType || 'INC_8');
  const [taxRate, setTaxRate] = useState(
    settings.taxRate !== undefined ? (settings.taxRate * 100).toString() : '8'
  );
  const [defaultTipPct, setDefaultTipPct] = useState(
    settings.defaultTipPct !== undefined ? settings.defaultTipPct.toString() : '10'
  );
  const [paperWidth, setPaperWidth] = useState<58 | 80>(settings.paperWidth || 80);
  const [autoPrintReceipt, setAutoPrintReceipt] = useState<boolean>(
    settings.autoPrintReceipt !== undefined ? settings.autoPrintReceipt : true
  );
  const [receiptHeader, setReceiptHeader] = useState(
    settings.receiptHeader || 'Sabor tradicional & Alta cocina'
  );
  const [receiptFooter, setReceiptFooter] = useState(
    settings.receiptFooter || '¡Gracias por su visita! Síguenos en @poscocina'
  );

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);


  // Hardware Printers State
  const [printers, setPrinters] = useState<any[]>([]);
  const [showPrinterModal, setShowPrinterModal] = useState(false);
  const [editingPrinterId, setEditingPrinterId] = useState<string | null>(null);
  const [testingPrinterId, setTestingPrinterId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; msg: string } | null>(null);

  // Form State for Printer
  const [pName, setPName] = useState('');
  const [pStation, setPStation] = useState<'cashier' | 'kitchen' | 'bar' | 'dessert' | 'expediter'>('kitchen');
  const [pConn, setPConn] = useState<'network_tcp' | 'browser_raw' | 'disabled'>('network_tcp');
  const [pIp, setPIp] = useState('');
  const [pPort, setPPort] = useState(9100);
  const [pWidth, setPWidth] = useState<'58' | '80'>('80');
  const [pAutoOrder, setPAutoOrder] = useState(true);
  const [pAutoPayment, setPAutoPayment] = useState(false);
  const [pOpenDrawer, setPOpenDrawer] = useState(false);

  const fetchPrinters = async () => {
    if (!venueId) return;
    try {
      const res = await fetch(`/api/hardware/printers?venueId=${venueId}`);
      if (res.ok) {
        const data = await res.json();
        setPrinters(data);
      }
    } catch (e) {
      console.error('Error fetching printers:', e);
    }
  };

  const handleOpenNewPrinterModal = () => {
    setEditingPrinterId(null);
    setPName('');
    setPStation('kitchen');
    setPConn('network_tcp');
    setPIp('');
    setPPort(9100);
    setPWidth('80');
    setPAutoOrder(true);
    setPAutoPayment(false);
    setPOpenDrawer(false);
    setShowPrinterModal(true);
  };

  const handleEditPrinter = (printer: any) => {
    setEditingPrinterId(printer.id);
    setPName(printer.name);
    setPStation(printer.station);
    setPConn(printer.connectionType);
    setPIp(printer.ipAddress || '');
    setPPort(printer.port || 9100);
    setPWidth(printer.paperWidth || '80');
    setPAutoOrder(printer.autoPrintOnOrder ?? true);
    setPAutoPayment(printer.autoPrintOnPayment ?? false);
    setPOpenDrawer(printer.openDrawerOnPrint ?? false);
    setShowPrinterModal(true);
  };

  const handleSavePrinter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim()) return;

    try {
      const url = editingPrinterId
        ? `/api/hardware/printers/${editingPrinterId}`
        : '/api/hardware/printers';
      const method = editingPrinterId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venueId,
          name: pName,
          station: pStation,
          connectionType: pConn,
          ipAddress: pIp.trim() || undefined,
          port: Number(pPort) || 9100,
          paperWidth: pWidth,
          autoPrintOnOrder: pAutoOrder,
          autoPrintOnPayment: pAutoPayment,
          openDrawerOnPrint: pOpenDrawer,
        }),
      });

      if (res.ok) {
        setShowPrinterModal(false);
        fetchPrinters();
        toast.success(editingPrinterId ? 'Impresora actualizada' : 'Impresora guardada');
      } else {
        const err = await res.json();
        toast.error(err.message || 'Error al guardar impresora');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error de conexión al guardar impresora');
    }
  };

  const handleDeletePrinter = async (id: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta impresora?')) return;
    try {
      const res = await fetch(`/api/hardware/printers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchPrinters();
        toast.success('Impresora eliminada');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar impresora');
    }
  };

  const handleTestPrint = async (printer: any) => {
    setTestingPrinterId(printer.id);
    setTestResult(null);
    try {
      const res = await fetch(`/api/hardware/test-print?venueId=${venueId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ printerId: printer.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setTestResult({
          id: printer.id,
          success: true,
          msg: data.networkSent
            ? `¡Ticket enviado con éxito por red TCP a ${printer.ipAddress}!`
            : 'Ticket generado exitosamente (Modo navegador/emulado)',
        });
      } else {
        setTestResult({
          id: printer.id,
          success: false,
          msg: data.networkError || data.message || 'Error en prueba de impresión',
        });
      }
    } catch (err: any) {
      setTestResult({ id: printer.id, success: false, msg: err.message });
    } finally {
      setTestingPrinterId(null);
      setTimeout(() => setTestResult(null), 5000);
    }
  };

  // Multi-venue summaries & modal state
  const [summaries, setSummaries] = useState<Record<string, VenueSummaryData>>({});
  const [isNewVenueModalOpen, setIsNewVenueModalOpen] = useState(false);
  const [newVenueName, setNewVenueName] = useState('');
  const [newVenueSlug, setNewVenueSlug] = useState('');
  const [newVenueAddress, setNewVenueAddress] = useState('');
  const [newVenuePhone, setNewVenuePhone] = useState('');
  const [creatingVenue, setCreatingVenue] = useState(false);
  const [venueError, setVenueError] = useState('');

  // Sync state if settings change from store
  useEffect(() => {
    setCompanyName(settings.companyName || name);
    setLogoUrl(settings.logoUrl || '');
    setPrimaryColor(settings.primaryColor || '#ea580c');
    setVenueAddress(address || '');
    setTaxId(settings.taxId || '900.123.456-7');
    setPhone(settings.phone || '+57 300 123 4567');
    setCurrency(settings.currency || 'COP');
    setTaxType(settings.taxType || 'INC_8');
    setTaxRate(settings.taxRate !== undefined ? (settings.taxRate * 100).toString() : '8');
    setDefaultTipPct(settings.defaultTipPct !== undefined ? settings.defaultTipPct.toString() : '10');
    setPaperWidth(settings.paperWidth || 80);
    setAutoPrintReceipt(settings.autoPrintReceipt !== undefined ? settings.autoPrintReceipt : true);
    setReceiptHeader(settings.receiptHeader || 'Sabor tradicional & Alta cocina');
    setReceiptFooter(settings.receiptFooter || '¡Gracias por su visita! Síguenos en @poscocina');
  }, [settings, name, address]);

  // Load venues & summaries
  useEffect(() => {
    loadAllVenues();
    fetchPrinters();
  }, [loadAllVenues, venueId]);

  useEffect(() => {
    const fetchSummaries = async () => {
      if (venues.length === 0) return;
      const resMap: Record<string, VenueSummaryData> = {};
      await Promise.all(
        venues.map(async (v) => {
          try {
            const res = await fetch(`/api/venues/${v.id}/summary`);
            if (res.ok) {
              const data = await res.json();
              resMap[v.id] = data;
            }
          } catch (e) {
            // Ignore error per venue
          }
        })
      );
      setSummaries(resMap);
    };

    if (activeTab === 'venues') {
      fetchSummaries();
    }
  }, [venues, activeTab]);

  const handleTaxTypeChange = (type: 'INC_8' | 'IVA_19' | 'EXENTO') => {
    setTaxType(type);
    if (type === 'INC_8') setTaxRate('8');
    else if (type === 'IVA_19') setTaxRate('19');
    else if (type === 'EXENTO') setTaxRate('0');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const numericTaxRate = parseFloat(taxRate) / 100;
    const updatedSettings: Partial<VenueSettings> = {
      companyName,
      logoUrl,
      primaryColor,
      taxId,
      phone,
      currency,
      taxType,
      taxRate: numericTaxRate,
      defaultTaxRate: numericTaxRate,
      defaultTipPct: parseFloat(defaultTipPct) || 0,
      paperWidth,
      autoPrintReceipt,
      receiptHeader,
      receiptFooter,
    };

    const success = await updateBranding({
      name: companyName,
      address: venueAddress,
      settings: updatedSettings,
    });

    setSaving(false);
    if (success) {
      setSavedSuccess(true);
      toast.success('Ajustes guardados correctamente');
      setTimeout(() => setSavedSuccess(false), 3000);
    } else {
      toast.error('Error al guardar ajustes de configuración');
    }
  };

  const handleCreateVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVenueName.trim() || !newVenueSlug.trim()) {
      setVenueError('Nombre y Slug son requeridos');
      return;
    }

    setCreatingVenue(true);
    setVenueError('');

    try {
      const res = await fetch('/api/venues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newVenueName.trim(),
          slug: newVenueSlug.trim().toLowerCase(),
          address: newVenueAddress.trim() || undefined,
          phone: newVenuePhone.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Error al crear la sede');
      }

      await loadAllVenues();
      setIsNewVenueModalOpen(false);
      setNewVenueName('');
      setNewVenueSlug('');
      setNewVenueAddress('');
      setNewVenuePhone('');
    } catch (err: any) {
      setVenueError(err.message || 'No se pudo crear la sucursal');
    } finally {
      setCreatingVenue(false);
    }
  };

  const handleSwitchToVenue = async (targetVenueId: string) => {
    setVenueId(targetVenueId);
    await switchVenue(targetVenueId);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 sm:p-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-orange-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personalización & Marca Blanca</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Ajustes del Sistema
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Configuración fiscal, marca corporativa, tickets ESC/POS y multi-sucursal.
          </p>
        </div>

        {activeTab !== 'venues' && (
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer shadow-lg ${
              savedSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-600/20'
            }`}
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>¡Guardado con éxito!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-2 border-b border-slate-800 pb-3 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('identity')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
            activeTab === 'identity'
              ? 'bg-orange-600/20 text-orange-400 border border-orange-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>1. Identidad & Marca</span>
        </button>

        <button
          onClick={() => setActiveTab('tax')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
            activeTab === 'tax'
              ? 'bg-orange-600/20 text-orange-400 border border-orange-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>2. Facturación & Impuestos</span>
        </button>

        <button
          onClick={() => setActiveTab('printer')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
            activeTab === 'printer'
              ? 'bg-orange-600/20 text-orange-400 border border-orange-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>3. Impresión Térmica ESC/POS</span>
        </button>

        <button
          onClick={() => setActiveTab('venues')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
            activeTab === 'venues'
              ? 'bg-orange-600/20 text-orange-400 border border-orange-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>4. Gestión de Sedes (Multi-Sucursal)</span>
          <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300">
            {venues.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Identidad Corporativa */}
      {activeTab === 'identity' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-700/60 mb-5">
                <Building2 className="w-5 h-5 text-orange-400" />
                <h3 className="font-bold text-white text-base">Identidad Corporativa</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nombre Comercial del Restaurante / Empresa
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ej. La Brasa Roja Gourmet"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Logo del Sistema y Tickets
                  </label>
                  <div className="flex items-center space-x-4">
                    {logoUrl ? (
                      <div className="w-16 h-16 rounded-xl border border-slate-700 bg-slate-900 p-1 flex items-center justify-center relative group">
                        <img
                          src={logoUrl}
                          alt="Logo Preview"
                          className="max-h-full max-w-full object-contain rounded"
                        />
                        <button
                          type="button"
                          onClick={() => setLogoUrl('')}
                          className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <UtensilsCrossed className="w-8 h-8" />
                      </div>
                    )}

                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="Pegar URL de imagen (https://...)"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                      <div className="flex items-center space-x-2">
                        <label className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-lg cursor-pointer flex items-center space-x-1.5">
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Subir desde dispositivo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                        <span className="text-[11px] text-slate-500">PNG o JPG recomendado</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Color Primario Corporativo
                  </label>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() => setPrimaryColor(preset.hex)}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                          primaryColor === preset.hex
                            ? 'border-white bg-slate-700 text-white shadow'
                            : 'border-slate-700/80 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: preset.hex }}
                        />
                        <span>{preset.name}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Dirección de la Sede
                    </label>
                    <input
                      type="text"
                      value={venueAddress}
                      onChange={(e) => setVenueAddress(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Teléfono de Contacto
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Preview Badge */}
          <div className="space-y-4">
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 text-center space-y-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Previsualización de Encabezado
              </span>
              <div
                className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white shadow-xl"
                style={{ backgroundColor: primaryColor }}
              >
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-12 h-12 object-contain" />
                ) : (
                  <UtensilsCrossed className="w-8 h-8" />
                )}
              </div>
              <div>
                <h4 className="font-bold text-white text-lg">{companyName || 'Nombre Empresa'}</h4>
                <p className="text-xs text-slate-400 mt-1">{venueAddress}</p>
                <p className="text-xs text-slate-400">{phone}</p>
              </div>
              <div className="pt-2">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40">
                  Estilo Visual Activo
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Facturación & Impuestos */}
      {activeTab === 'tax' && (
        <div className="max-w-3xl space-y-6">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-700/60">
              <Receipt className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="font-bold text-white text-base">Régimen Fiscal y Políticas de Cobro</h3>
                <p className="text-xs text-slate-400">
                  Aplica las normas de la DIAN para restaurantes y bares (INC 8% vs IVA 19%).
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Identificación Fiscal (NIT / RUT / RFC)
                </label>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  placeholder="900.123.456-7"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Régimen Tributario para Alimentos y Bebidas
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => handleTaxTypeChange('INC_8')}
                    className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                      taxType === 'INC_8'
                        ? 'border-orange-500 bg-orange-500/10 text-white'
                        : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>INC 8% (Restaurantes)</span>
                      {taxType === 'INC_8' && <CheckCircle2 className="w-4 h-4 text-orange-400" />}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Impuesto Nacional al Consumo estándar Colombia.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTaxTypeChange('IVA_19')}
                    className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                      taxType === 'IVA_19'
                        ? 'border-orange-500 bg-orange-500/10 text-white'
                        : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>IVA 19% (General)</span>
                      {taxType === 'IVA_19' && <CheckCircle2 className="w-4 h-4 text-orange-400" />}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Para establecimientos bajo franquicia o régimen común IVA.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTaxTypeChange('EXENTO')}
                    className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                      taxType === 'EXENTO'
                        ? 'border-orange-500 bg-orange-500/10 text-white'
                        : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>Exento (0%)</span>
                      {taxType === 'EXENTO' && <CheckCircle2 className="w-4 h-4 text-orange-400" />}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Sin cobro de impuesto en comandas.
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Tasa de Impuesto (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                    <Percent className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Propina Voluntaria Sugerida (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={defaultTipPct}
                      onChange={(e) => setDefaultTipPct(e.target.value)}
                      placeholder="10"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                    <Percent className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3.5" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Por defecto 10% voluntario</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Moneda Operativa
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="COP">COP ($ Peso Colombiano)</option>
                    <option value="MXN">MXN ($ Peso Mexicano)</option>
                    <option value="USD">USD ($ Dólar)</option>
                    <option value="EUR">EUR (€ Euro)</option>
                    <option value="CLP">CLP ($ Peso Chileno)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Impresión Térmica ESC/POS */}
      {activeTab === 'printer' && (
        <div className="space-y-8">
          {/* HARDWARE PRINTERS MANAGEMENT */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-700/60 gap-4 mb-5">
              <div>
                <div className="flex items-center space-x-2">
                  <Printer className="w-5 h-5 text-orange-400" />
                  <h3 className="font-bold text-white text-base">
                    Dispositivos e Impresoras Térmicas de la Sede
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Ruteo directo por red TCP (puerto 9100) para comandas en cocina/barra y recibos en caja.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenNewPrinterModal}
                className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-orange-600/20 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Impresora</span>
              </button>
            </div>

            {/* Printers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {printers.map((printer) => {
                const isTesting = testingPrinterId === printer.id;
                const result = testResult?.id === printer.id ? testResult : null;

                const stationLabel =
                  printer.station === 'cashier'
                    ? 'Caja Principal'
                    : printer.station === 'kitchen'
                    ? 'Cocina Caliente'
                    : printer.station === 'bar'
                    ? 'Barra / Bebidas'
                    : printer.station === 'dessert'
                    ? 'Postres / Café'
                    : 'Expedición';

                return (
                  <div
                    key={printer.id}
                    className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between space-y-3 relative group"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-white text-sm">{printer.name}</h4>
                          <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 mt-1 rounded-md bg-orange-950/60 border border-orange-800/60 text-orange-300">
                            {stationLabel}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                          {printer.paperWidth}mm
                        </span>
                      </div>

                      <div className="mt-3 space-y-1.5 text-xs text-slate-300 font-mono">
                        <div className="flex items-center space-x-1.5">
                          <Wifi className="w-3.5 h-3.5 text-slate-500" />
                          <span>
                            {printer.connectionType === 'network_tcp'
                              ? `TCP: ${printer.ipAddress || 'Sin IP'}:${printer.port}`
                              : 'Navegador Web / USB'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1 text-[10px]">
                        {printer.autoPrintOnOrder && (
                          <span className="bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 px-1.5 py-0.5 rounded">
                            Comandas Auto
                          </span>
                        )}
                        {printer.autoPrintOnPayment && (
                          <span className="bg-blue-950/60 border border-blue-800/40 text-blue-300 px-1.5 py-0.5 rounded">
                            Facturas Auto
                          </span>
                        )}
                        {printer.openDrawerOnPrint && (
                          <span className="bg-purple-950/60 border border-purple-800/40 text-purple-300 px-1.5 py-0.5 rounded">
                            Pulso Gaveta
                          </span>
                        )}
                      </div>
                    </div>

                    {result && (
                      <div
                        className={`p-2 rounded-xl text-[11px] flex items-center space-x-1.5 ${
                          result.success
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {result.success ? (
                          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-rose-400" />
                        )}
                        <span className="truncate">{result.msg}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                      <button
                        type="button"
                        disabled={isTesting}
                        onClick={() => handleTestPrint(printer)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1 transition cursor-pointer border border-slate-700"
                      >
                        <Play className="w-3 h-3 text-emerald-400" />
                        <span>{isTesting ? 'Enviando...' : 'Test Impresión'}</span>
                      </button>

                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => handleEditPrinter(printer)}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePrinter(printer.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {printers.length === 0 && (
                <div className="col-span-full p-8 text-center text-slate-500 text-xs border border-dashed border-slate-700 rounded-2xl">
                  No hay impresoras térmicas configuradas para esta sede. Haz clic en "Nueva Impresora" para agregar una impresora de caja o cocina.
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-700/60">
                <Printer className="w-5 h-5 text-orange-400" />
                <div>
                  <h3 className="font-bold text-white text-base">Configuración de Ticket Térmico</h3>
                  <p className="text-xs text-slate-400">
                    Formato estándar compatible con impresoras de 58mm y 80mm vía USB, Red o Bluetooth.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Ancho de Papel
                  </label>
                  <div className="grid grid-cols-2 gap-3 max-w-sm">
                    <button
                      type="button"
                      onClick={() => setPaperWidth(80)}
                      className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                        paperWidth === 80
                          ? 'border-orange-500 bg-orange-500/10 text-white font-bold'
                          : 'border-slate-700 bg-slate-900/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="block text-sm">80 mm (Estándar POS)</span>
                      <span className="text-[10px] text-slate-400">42-48 columnas</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaperWidth(58)}
                      className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                        paperWidth === 58
                          ? 'border-orange-500 bg-orange-500/10 text-white font-bold'
                          : 'border-slate-700 bg-slate-900/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="block text-sm">58 mm (Compacto)</span>
                      <span className="text-[10px] text-slate-400">32 columnas</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoPrintReceipt}
                      onChange={(e) => setAutoPrintReceipt(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 text-orange-600 focus:ring-orange-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-white block">
                        Impresión automática al cobrar comanda
                      </span>
                      <span className="text-xs text-slate-400 block">
                        Lanza la orden de impresión inmediatamente tras registrar el pago exitoso.
                      </span>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Encabezado / Lema de Ticket
                  </label>
                  <input
                    type="text"
                    value={receiptHeader}
                    onChange={(e) => setReceiptHeader(e.target.value)}
                    placeholder="Sabor tradicional & Alta cocina"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Pie de Página / Agradecimiento
                  </label>
                  <textarea
                    rows={3}
                    value={receiptFooter}
                    onChange={(e) => setReceiptFooter(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Ticket representation */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <Printer className="w-4 h-4" />
              <span>Vista Previa {paperWidth}mm</span>
            </div>

            <div
              className={`bg-amber-50 text-slate-900 rounded-2xl p-5 shadow-2xl border border-amber-200/60 font-mono text-xs space-y-3 select-none mx-auto ${
                paperWidth === 58 ? 'max-w-[260px] text-[10px]' : 'max-w-sm'
              }`}
            >
              <div className="text-center border-b border-dashed border-slate-400 pb-3">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Receipt Logo"
                    className="w-10 h-10 object-contain mx-auto mb-1.5"
                  />
                ) : (
                  <div
                    className="w-8 h-8 rounded-lg mx-auto mb-1.5 flex items-center justify-center text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <UtensilsCrossed className="w-4 h-4" />
                  </div>
                )}
                <div className="font-black text-xs uppercase">{companyName || 'MI RESTAURANTE'}</div>
                <div className="text-[10px] text-slate-600">NIT: {taxId}</div>
                <div className="text-[9px] text-slate-500">{venueAddress}</div>
                <div className="text-[9px] text-slate-500">Tel: {phone}</div>
                {receiptHeader && (
                  <div className="text-[9px] italic text-slate-600 mt-1">"{receiptHeader}"</div>
                )}
              </div>

              <div className="space-y-0.5 py-1 border-b border-dashed border-slate-400 text-[10px]">
                <div className="flex justify-between">
                  <span>Factura: #00452</span>
                  <span>Mesa: M-01</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Fecha: 16/09/2026 12:45</span>
                  <span>Turno: #12</span>
                </div>
              </div>

              <div className="space-y-1 py-1.5 border-b border-dashed border-slate-400 text-[10px]">
                <div className="flex justify-between">
                  <span>1x Lomo al Trapo 300g</span>
                  <span>$38.000</span>
                </div>
                <div className="flex justify-between">
                  <span>2x Copa de Vino Tinto</span>
                  <span>$28.000</span>
                </div>
              </div>

              <div className="space-y-0.5 pt-1 text-[10px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>$61.111</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{taxType === 'INC_8' ? 'INC (8%)' : `Impuesto (${taxRate}%)`}:</span>
                  <span>$4.889</span>
                </div>
                {parseFloat(defaultTipPct) > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Propina Sugerida ({defaultTipPct}%):</span>
                    <span>$6.600</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-xs pt-1 border-t border-slate-400">
                  <span>TOTAL:</span>
                  <span>$72.600 {currency}</span>
                </div>
              </div>

              <div className="text-center pt-3 border-t border-dashed border-slate-400 text-[9px] text-slate-600">
                <p>{receiptFooter}</p>
                <p className="mt-1 text-[8px] text-slate-400">poscocina POS • Impreso en {paperWidth}mm</p>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL: Nueva / Editar Impresora */}
        {showPrinterModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Printer className="w-5 h-5 text-orange-400" />
                  <span>{editingPrinterId ? 'Editar Impresora Térmica' : 'Configurar Nueva Impresora'}</span>
                </h3>
                <button
                  onClick={() => setShowPrinterModal(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSavePrinter} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nombre o Etiqueta: *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Epson TM-T20 Cocina o Xprinter Barra"
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Estación Asignada: *
                    </label>
                    <select
                      value={pStation}
                      onChange={(e: any) => setPStation(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="kitchen">Cocina Caliente</option>
                      <option value="bar">Barra / Bebidas</option>
                      <option value="dessert">Postres / Café</option>
                      <option value="cashier">Caja Principal (Recibos)</option>
                      <option value="expediter">Expedición / Despacho</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Ancho del Papel: *
                    </label>
                    <select
                      value={pWidth}
                      onChange={(e: any) => setPWidth(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="80">80 mm (Estándar POS)</option>
                      <option value="58">58 mm (Compacto)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Modo de Conexión: *
                    </label>
                    <select
                      value={pConn}
                      onChange={(e: any) => setPConn(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="network_tcp">Red LAN TCP (Socket Directo)</option>
                      <option value="browser_raw">Navegador Web / USB</option>
                      <option value="disabled">Deshabilitada</option>
                    </select>
                  </div>

                  {pConn === 'network_tcp' ? (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Dirección IP en Red:
                      </label>
                      <input
                        type="text"
                        placeholder="192.168.1.100"
                        value={pIp}
                        onChange={(e) => setPIp(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Puerto RAW:
                      </label>
                      <input
                        type="number"
                        value={pPort}
                        onChange={(e) => setPPort(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pAutoOrder}
                      onChange={(e) => setPAutoOrder(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-slate-300 font-medium">
                      Imprimir automáticamente al marchar comanda a esta estación
                    </span>
                  </label>

                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pAutoPayment}
                      onChange={(e) => setPAutoPayment(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-slate-300 font-medium">
                      Imprimir automáticamente factura final al registrar pago
                    </span>
                  </label>

                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pOpenDrawer}
                      onChange={(e) => setPOpenDrawer(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-slate-300 font-medium">
                      Disparar pulso eléctrico de apertura de gaveta de dinero
                    </span>
                  </label>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowPrinterModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-lg shadow-orange-600/20"
                  >
                    {editingPrinterId ? 'Guardar Cambios' : 'Registrar Impresora'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    )}

      {/* Tab 4: Gestión de Sedes (Multi-Sucursal) */}
      {activeTab === 'venues' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-lg">Sucursales del Negocio</h3>
              <p className="text-xs text-slate-400">
                Gestiona y monitorea en tiempo real todas las sedes asociadas a la cadena.
              </p>
            </div>

            {currentUser?.roleName === 'super_admin' && (
              <button
                onClick={() => setIsNewVenueModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs transition cursor-pointer shadow-lg shadow-orange-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Sede</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((v) => {
              const isCurrent = v.id === venueId;
              const summary = summaries[v.id]?.stats;

              return (
                <div
                  key={v.id}
                  className={`bg-slate-800/60 border rounded-2xl p-6 transition flex flex-col justify-between space-y-4 ${
                    isCurrent
                      ? 'border-orange-500/80 shadow-lg shadow-orange-500/10'
                      : 'border-slate-700/60 hover:border-slate-600'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow ${
                            isCurrent ? 'bg-orange-600' : 'bg-slate-700'
                          }`}
                        >
                          <Store className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm leading-snug">{v.name}</h4>
                          <span className="text-[11px] text-slate-400 font-mono">/{v.slug}</span>
                        </div>
                      </div>

                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                          Sede Activa
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-xs text-slate-400 border-t border-slate-700/60 pt-3">
                      {v.address && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{v.address}</span>
                        </div>
                      )}
                      {v.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{v.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Live Metrics Grid */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5">
                        <div className="flex items-center space-x-1.5 text-slate-400 text-[10px]">
                          <Layers className="w-3 h-3 text-orange-400" />
                          <span>Mesas</span>
                        </div>
                        <div className="text-sm font-bold text-white mt-1">
                          {summary ? `${summary.tables.occupied} / ${summary.tables.total} ocupadas` : '...'}
                        </div>
                      </div>

                      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5">
                        <div className="flex items-center space-x-1.5 text-slate-400 text-[10px]">
                          <Wallet className="w-3 h-3 text-emerald-400" />
                          <span>Caja</span>
                        </div>
                        <div className="text-xs font-bold mt-1">
                          {summary ? (
                            summary.openShift ? (
                              <span className="text-emerald-400">Turno Abierto</span>
                            ) : (
                              <span className="text-slate-500">Cerrada</span>
                            )
                          ) : (
                            '...'
                          )}
                        </div>
                      </div>

                      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5">
                        <div className="flex items-center space-x-1.5 text-slate-400 text-[10px]">
                          <UtensilsCrossed className="w-3 h-3 text-amber-400" />
                          <span>Comandas</span>
                        </div>
                        <div className="text-sm font-bold text-white mt-1">
                          {summary ? `${summary.activeOrders} activas` : '...'}
                        </div>
                      </div>

                      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5">
                        <div className="flex items-center space-x-1.5 text-slate-400 text-[10px]">
                          <Users className="w-3 h-3 text-blue-400" />
                          <span>Personal</span>
                        </div>
                        <div className="text-sm font-bold text-white mt-1">
                          {summary ? `${summary.activeStaff} asignados` : '...'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    {isCurrent ? (
                      <div className="w-full py-2 text-center text-xs font-semibold text-orange-400 bg-orange-500/10 rounded-xl">
                        Operando actualmente en este terminal
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSwitchToVenue(v.id)}
                        className="w-full py-2 text-center text-xs font-semibold text-slate-300 hover:text-white bg-slate-700/60 hover:bg-slate-700 rounded-xl transition cursor-pointer"
                      >
                        Cambiar a esta Sede
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Nueva Sede */}
      {isNewVenueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Store className="w-5 h-5 text-orange-400" />
                <h3 className="font-bold text-white text-base">Crear Nueva Sucursal</h3>
              </div>
              <button
                onClick={() => setIsNewVenueModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {venueError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {venueError}
              </div>
            )}

            <form onSubmit={handleCreateVenue} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre de la Sede *
                </label>
                <input
                  type="text"
                  required
                  value={newVenueName}
                  onChange={(e) => {
                    setNewVenueName(e.target.value);
                    if (!newVenueSlug) {
                      setNewVenueSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/\s+/g, '-')
                          .replace(/[^a-z0-9-]/g, '')
                      );
                    }
                  }}
                  placeholder="Ej. Sede El Poblado"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Slug URL Identificador *
                </label>
                <input
                  type="text"
                  required
                  value={newVenueSlug}
                  onChange={(e) => setNewVenueSlug(e.target.value.toLowerCase())}
                  placeholder="ej. sede-el-poblado"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  value={newVenueAddress}
                  onChange={(e) => setNewVenueAddress(e.target.value)}
                  placeholder="Cra. 43A # 1-50"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={newVenuePhone}
                  onChange={(e) => setNewVenuePhone(e.target.value)}
                  placeholder="+57 300 987 6543"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-3 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewVenueModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingVenue}
                  className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition shadow"
                >
                  {creatingVenue ? 'Creando Sede...' : 'Crear Sede'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
