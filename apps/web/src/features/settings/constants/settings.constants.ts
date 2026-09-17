import { PrinterStation } from '../types/settings.types';

export const COLOR_PRESETS = [
  { name: 'Naranja Gourmet', hex: '#ea580c' },
  { name: 'Rojo Fuego', hex: '#dc2626' },
  { name: 'Verde Orgánico', hex: '#16a34a' },
  { name: 'Azul Bistro', hex: '#2563eb' },
  { name: 'Púrpura Lounge', hex: '#9333ea' },
  { name: 'Ámbar Clásico', hex: '#d97706' },
  { name: 'Grafito Minimalista', hex: '#475569' },
] as const;

export const STATION_LABELS: Record<PrinterStation, string> = {
  cashier: 'Caja Principal',
  kitchen: 'Cocina Caliente',
  bar: 'Barra / Bebidas',
  dessert: 'Postres / Café',
  expediter: 'Expedición',
};

export const CURRENCY_OPTIONS = [
  { code: 'COP', label: 'COP ($ Peso Colombiano)' },
  { code: 'MXN', label: 'MXN ($ Peso Mexicano)' },
  { code: 'USD', label: 'USD ($ Dólar)' },
  { code: 'EUR', label: 'EUR (€ Euro)' },
  { code: 'CLP', label: 'CLP ($ Peso Chileno)' },
] as const;
