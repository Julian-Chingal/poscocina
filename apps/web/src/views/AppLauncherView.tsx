import React from 'react';
import {
  LayoutGrid,
  ShoppingBag,
  ChefHat,
  Utensils,
  Boxes,
  ReceiptText,
  BarChart3,
  Settings,
  Search,
} from 'lucide-react';
import { useBrandingStore } from '../stores/branding.store';

interface AppItem {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ElementType;
  gradient: string;
  badge?: string;
  badgeColor?: string;
  category: 'operacion' | 'gestion' | 'config';
}

const APPS: AppItem[] = [
  {
    id: 'salon',
    name: 'Salón y Mesas',
    subtitle: 'Mapa interactivo y estados',
    icon: LayoutGrid,
    gradient: 'from-emerald-400 to-teal-600',
    badge: 'En vivo',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    category: 'operacion',
  },
  {
    id: 'pos',
    name: 'Punto de Venta',
    subtitle: 'Comandero, caja y modificadores',
    icon: ShoppingBag,
    gradient: 'from-amber-400 to-orange-600',
    category: 'operacion',
  },
  {
    id: 'kds',
    name: 'Cocina KDS',
    subtitle: 'Pantalla de preparación en tiempo real',
    icon: ChefHat,
    gradient: 'from-rose-500 to-red-600',
    badge: 'KDS',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    category: 'operacion',
  },
  {
    id: 'catalog',
    name: 'Menú y Catálogo',
    subtitle: 'Productos, categorías y variantes',
    icon: Utensils,
    gradient: 'from-blue-400 to-indigo-600',
    category: 'gestion',
  },
  {
    id: 'inventory',
    name: 'Inventario & Recetas',
    subtitle: 'Descuento automático de insumos',
    icon: Boxes,
    gradient: 'from-violet-400 to-purple-600',
    badge: 'Fase 2',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    category: 'gestion',
  },
  {
    id: 'shifts',
    name: 'Caja & Facturación',
    subtitle: 'Arqueos, pagos y tickets',
    icon: ReceiptText,
    gradient: 'from-cyan-400 to-blue-600',
    badge: 'Fase 2',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    category: 'gestion',
  },
  {
    id: 'reports',
    name: 'Reportes & Métricas',
    subtitle: 'Ventas, mermas y tiempos',
    icon: BarChart3,
    gradient: 'from-fuchsia-400 to-pink-600',
    badge: 'Fase 3',
    badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    category: 'gestion',
  },
  {
    id: 'settings',
    name: 'Ajustes y Marca',
    subtitle: 'Logo, datos fiscales y colores',
    icon: Settings,
    gradient: 'from-slate-500 to-slate-700',
    category: 'config',
  },
];

interface AppLauncherViewProps {
  onSelectApp: (appId: string) => void;
  searchQuery: string;
}

export const AppLauncherView: React.FC<AppLauncherViewProps> = ({ onSelectApp, searchQuery }) => {
  const { name: companyName, settings } = useBrandingStore();

  const filteredApps = APPS.filter(
    (app) =>
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-48px)] flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Decorative background gradients like Odoo aesthetic */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header presentation */}
      <div className="text-center mb-10 z-10 max-w-xl">
        <div className="flex items-center justify-center space-x-3 mb-3">
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt="Logo"
              className="w-12 h-12 object-contain rounded-xl p-1 bg-slate-800 border border-slate-700 shadow"
            />
          ) : (
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg"
              style={{ backgroundColor: settings.primaryColor || '#f97316' }}
            >
              <Utensils className="w-6 h-6" />
            </div>
          )}
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {settings.companyName || companyName}
          </h1>
        </div>
        <p className="text-slate-400 text-sm">
          Plataforma modular de gestión gastronómica. Selecciona un módulo para comenzar.
        </p>
      </div>

      {/* Grid of Odoo-style App tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-w-4xl w-full z-10">
        {filteredApps.map((app) => {
          const Icon = app.icon;
          return (
            <button
              key={app.id}
              onClick={() => onSelectApp(app.id)}
              className="group flex flex-col items-center text-center p-5 rounded-2xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 hover:border-slate-600 transition-all duration-200 hover:-translate-y-1.5 hover:shadow-2xl cursor-pointer relative"
            >
              {/* Badge if any */}
              {app.badge && (
                <span
                  className={`absolute top-2.5 right-2.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    app.badgeColor || 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {app.badge}
                </span>
              )}

              {/* Icon Container with glossy Odoo look */}
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${app.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-105 group-hover:shadow-xl transition-all mb-3.5`}
              >
                <Icon className="w-8 h-8 drop-shadow" />
              </div>

              {/* Title & Subtitle */}
              <span className="font-bold text-sm text-slate-100 group-hover:text-white transition-colors">
                {app.name}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                {app.subtitle}
              </span>
            </button>
          );
        })}
      </div>

      {filteredApps.length === 0 && (
        <div className="text-center py-16 text-slate-400 z-10">
          <Search className="w-10 h-10 mx-auto text-slate-600 mb-2" />
          <p>No se encontraron módulos con el término "{searchQuery}".</p>
        </div>
      )}
    </div>
  );
};
