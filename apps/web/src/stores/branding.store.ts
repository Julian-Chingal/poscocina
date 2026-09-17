import { create } from 'zustand';
import { api } from '../services/api';

export interface VenueItem {
  id: string;
  name: string;
  slug?: string;
  address?: string | null;
  phone?: string | null;
  isActive?: boolean;
  settings?: VenueSettings;
  createdAt?: string;
}

export interface VenueSettings {
  companyName?: string;
  logoUrl?: string;
  primaryColor?: string;
  currency?: string;
  taxType?: 'INC_8' | 'IVA_19' | 'EXENTO';
  taxRate?: number;
  defaultTaxRate?: number;
  taxId?: string;
  defaultTipPct?: number;
  phone?: string;
  paperWidth?: 58 | 80;
  autoPrintReceipt?: boolean;
  receiptHeader?: string;
  receiptFooter?: string;
}

interface BrandingState {
  venueId: string;
  name: string;
  address: string;
  settings: VenueSettings;
  venues: VenueItem[];
  isLoading: boolean;
  loadAllVenues: () => Promise<VenueItem[]>;
  switchVenue: (venueId: string) => Promise<void>;
  loadBranding: (venueId: string) => Promise<void>;
  updateBranding: (updates: {
    name?: string;
    address?: string;
    settings?: Partial<VenueSettings>;
  }) => Promise<boolean>;
}

export const useBrandingStore = create<BrandingState>((set, get) => ({
  venueId: '',
  name: 'poscocina Restaurante',
  address: 'Calle Principal # 123',
  venues: [],
  settings: {
    companyName: 'poscocina Gourmet',
    logoUrl: '',
    primaryColor: '#f97316', // Orange default
    currency: 'COP',
    taxType: 'INC_8',
    taxRate: 0.08,
    taxId: '900.123.456-7',
    defaultTipPct: 10,
    phone: '+57 300 123 4567',
    paperWidth: 80,
    autoPrintReceipt: true,
    receiptHeader: 'Deliciosos momentos a tu mesa',
    receiptFooter: '¡Gracias por su visita! Vuelva pronto.',
  },
  isLoading: false,

  loadAllVenues: async () => {
    try {
      const data = await api.get('/venues');
      const venuesList = Array.isArray(data) ? data : data?.venues || [];
      set({ venues: venuesList });
      return venuesList;
    } catch (err) {
      console.error('Error loading venues list:', err);
      return [];
    }
  },

  switchVenue: async (newVenueId: string) => {
    if (!newVenueId || newVenueId === get().venueId) return;
    localStorage.setItem('poscocina_venue_id', newVenueId);
    await get().loadBranding(newVenueId);
  },

  loadBranding: async (venueId: string) => {
    if (!venueId) return;
    set({ isLoading: true, venueId });
    try {
      const data = await api.get(`/venues/${venueId}`);
      if (data) {
        const serverSettings = data.settings || {};
        const resolvedTaxRate = typeof serverSettings.taxRate === 'number'
          ? serverSettings.taxRate
          : typeof serverSettings.defaultTaxRate === 'number'
          ? serverSettings.defaultTaxRate
          : typeof serverSettings.tax_rate === 'number'
          ? serverSettings.tax_rate
          : 0.08;

        const resolvedTaxType = serverSettings.taxType || (resolvedTaxRate === 0.19 ? 'IVA_19' : resolvedTaxRate === 0 ? 'EXENTO' : 'INC_8');

        set({
          name: data.name || 'poscocina Restaurante',
          address: data.address || '',
          settings: {
            companyName: data.name,
            logoUrl: '',
            primaryColor: '#f97316',
            currency: 'COP',
            taxType: resolvedTaxType,
            taxId: '900.123.456-7',
            defaultTipPct: 10,
            phone: '+57 300 123 4567',
            paperWidth: 80,
            autoPrintReceipt: true,
            receiptHeader: 'Deliciosos momentos a tu mesa',
            receiptFooter: '¡Gracias por su visita! Vuelva pronto.',
            ...serverSettings,
            taxRate: resolvedTaxRate,
            defaultTaxRate: resolvedTaxRate,
          },
        });

        // Apply dynamic brand color CSS variable
        if (serverSettings.primaryColor) {
          document.documentElement.style.setProperty('--primary-brand', serverSettings.primaryColor);
        }
      }
    } catch (err) {
      console.error('Error loading venue branding:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  updateBranding: async (updates) => {
    const { venueId, settings: currentSettings } = get();
    if (!venueId) return false;

    try {
      const payload = {
        name: updates.name,
        address: updates.address,
        settings: {
          ...currentSettings,
          ...(updates.settings || {}),
        },
      };

      const updated = await api.patch(`/venues/${venueId}/settings`, payload);
      if (updated) {
        const newSettings = {
          ...currentSettings,
          ...(updated.settings || {}),
        };
        set({
          name: updated.name,
          address: updated.address,
          settings: newSettings,
        });

        if (newSettings.primaryColor) {
          document.documentElement.style.setProperty('--primary-brand', newSettings.primaryColor);
        }

        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating branding:', err);
      return false;
    }
  },
}));
