import React, { ChangeEvent } from 'react';
import { Building2, Image as ImageIcon, UtensilsCrossed } from 'lucide-react';
import { IdentityPreviewCard } from './IdentityPreviewCard';
import { ColorPickerSection } from './ColorPickerSection';

interface Props {
  companyName: string;
  logoUrl: string;
  primaryColor: string;
  venueAddress: string;
  phone: string;
  onFieldChange: (field: any, val: any) => void;
}

export const IdentityTab: React.FC<Props> = ({
  companyName,
  logoUrl,
  primaryColor,
  venueAddress,
  phone,
  onFieldChange,
}) => {
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onFieldChange('logoUrl', reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
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
                onChange={(e) => onFieldChange('companyName', e.target.value)}
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
                    <img src={logoUrl} alt="Logo" className="max-h-full max-w-full object-contain rounded" />
                    <button
                      type="button"
                      onClick={() => onFieldChange('logoUrl', '')}
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
                    onChange={(e) => onFieldChange('logoUrl', e.target.value)}
                    placeholder="Pegar URL de imagen (https://...)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                  <label className="inline-flex text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-lg cursor-pointer items-center space-x-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Subir desde dispositivo</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            <ColorPickerSection
              primaryColor={primaryColor}
              onColorChange={(color) => onFieldChange('primaryColor', color)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Dirección de la Sede</label>
                <input
                  type="text"
                  value={venueAddress}
                  onChange={(e) => onFieldChange('venueAddress', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Teléfono de Contacto</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => onFieldChange('phone', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <IdentityPreviewCard
        companyName={companyName}
        logoUrl={logoUrl}
        primaryColor={primaryColor}
        venueAddress={venueAddress}
        phone={phone}
      />
    </div>
  );
};
