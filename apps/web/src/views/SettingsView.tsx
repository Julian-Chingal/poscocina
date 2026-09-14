import React, { useState } from 'react';
import {
  Building2,
  Receipt,
  Image as ImageIcon,
  Save,
  Check,
  UtensilsCrossed,
  Printer,
  Sparkles,
} from 'lucide-react';
import { useBrandingStore, VenueSettings } from '../stores/branding.store';

const COLOR_PRESETS = [
  { name: 'Naranja Gourmet', hex: '#ea580c' },
  { name: 'Rojo Fuego', hex: '#dc2626' },
  { name: 'Verde Orgánico', hex: '#16a34a' },
  { name: 'Azul Bistro', hex: '#2563eb' },
  { name: 'Púrpura Lounge', hex: '#9333ea' },
  { name: 'Ámbar Clásico', hex: '#d97706' },
  { name: 'Grafito Minimalista', hex: '#475569' },
];

export const SettingsView: React.FC = () => {
  const { name, address, settings, updateBranding } = useBrandingStore();

  const [companyName, setCompanyName] = useState(settings.companyName || name);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor || '#ea580c');
  const [venueAddress, setVenueAddress] = useState(address || '');
  const [taxId, setTaxId] = useState(settings.taxId || '900.123.456-7');
  const [phone, setPhone] = useState(settings.phone || '+57 300 123 4567');
  const [currency, setCurrency] = useState(settings.currency || 'COP');
  const [taxRate, setTaxRate] = useState(settings.taxRate ? (settings.taxRate * 100).toString() : '19');
  const [receiptHeader, setReceiptHeader] = useState(
    settings.receiptHeader || 'Sabor tradicional & Alta cocina'
  );
  const [receiptFooter, setReceiptFooter] = useState(
    settings.receiptFooter || '¡Gracias por su visita! Síguenos en @poscocina'
  );

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

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

    const updatedSettings: Partial<VenueSettings> = {
      companyName,
      logoUrl,
      primaryColor,
      taxId,
      phone,
      currency,
      taxRate: parseFloat(taxRate) / 100,
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
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 sm:p-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-8 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-orange-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personalización & Marca Blanca</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Ajustes de la Empresa
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Configura el logo, colores corporativos e información para comandas y facturas.
          </p>
        </div>

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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Logo & Brand Identity */}
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

              {/* Logo Config */}
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

              {/* Color Theme */}
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
            </div>
          </div>

          {/* Card 2: Legal & Ticket Info */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-700/60 mb-5">
              <Receipt className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-white text-base">Datos Fiscales y Comprobantes</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Identificación Fiscal (NIT / RFC / RUT)
                </label>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
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

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Dirección del Local
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
                  Moneda
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

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tasa de Impuesto / IVA (%)
                </label>
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Encabezado de Comprobante / Lema
                </label>
                <input
                  type="text"
                  value={receiptHeader}
                  onChange={(e) => setReceiptHeader(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Pie de Página de Ticket
                </label>
                <textarea
                  rows={2}
                  value={receiptFooter}
                  onChange={(e) => setReceiptFooter(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Thermal Ticket Preview */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Printer className="w-4 h-4" />
            <span>Previsualización Ticket ESC/POS</span>
          </div>

          {/* Ticket representation */}
          <div className="bg-amber-50 text-slate-900 rounded-2xl p-6 shadow-2xl border border-amber-200/60 font-mono text-xs space-y-3 select-none">
            {/* Ticket Header */}
            <div className="text-center border-b border-dashed border-slate-400 pb-4">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Receipt Logo"
                  className="w-12 h-12 object-contain mx-auto mb-2"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
              )}
              <div className="font-black text-sm uppercase">{companyName || 'MI RESTAURANTE'}</div>
              <div className="text-[11px] text-slate-600 mt-0.5">NIT: {taxId}</div>
              <div className="text-[10px] text-slate-500">{venueAddress}</div>
              <div className="text-[10px] text-slate-500">Tel: {phone}</div>
              {receiptHeader && (
                <div className="text-[10px] italic text-slate-600 mt-2">"{receiptHeader}"</div>
              )}
            </div>

            {/* Ticket Details */}
            <div className="text-[11px] space-y-1 py-1 border-b border-dashed border-slate-400">
              <div className="flex justify-between">
                <span>Comprobante: #00451</span>
                <span>Mesa: M-02</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Fecha: 14/09/2026 11:30</span>
                <span>Mesero: Juan M.</span>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-1.5 py-2 border-b border-dashed border-slate-400 text-[11px]">
              <div className="flex justify-between">
                <span>1x Hamburguesa Clásica</span>
                <span>$28.000</span>
              </div>
              <div className="text-[10px] text-slate-500 pl-3">- Término 3/4</div>
              <div className="flex justify-between">
                <span>2x Limonada Natural</span>
                <span>$16.000</span>
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-1 pt-1 text-[11px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>$36.974</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>IVA ({taxRate}%):</span>
                <span>$7.026</span>
              </div>
              <div className="flex justify-between font-black text-sm pt-1 border-t border-slate-400">
                <span>TOTAL:</span>
                <span>$44.000 {currency}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-4 border-t border-dashed border-slate-400 text-[10px] text-slate-600">
              <p>{receiptFooter}</p>
              <p className="mt-2 text-[9px] text-slate-400">Software: poscocina POS</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
