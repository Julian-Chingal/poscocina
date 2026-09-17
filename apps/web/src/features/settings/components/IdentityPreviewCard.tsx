import React from 'react';
import { UtensilsCrossed } from 'lucide-react';

interface Props {
  companyName: string;
  logoUrl: string;
  primaryColor: string;
  venueAddress: string;
  phone: string;
}

export const IdentityPreviewCard: React.FC<Props> = ({
  companyName,
  logoUrl,
  primaryColor,
  venueAddress,
  phone,
}) => (
  <aside className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 text-center space-y-4">
    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
      Previsualización de Encabezado
    </span>
    <div
      className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white shadow-xl overflow-hidden"
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
  </aside>
);
