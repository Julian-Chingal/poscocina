import { create } from 'zustand';

export interface VenueSettings {
  companyName?: string;
  logoUrl?: string;
  primaryColor?: string;
  currency?: string;
  taxRate?: number;
  taxId?: string;
  phone?: string;
  receiptHeader?: string;
  receiptFooter?: string;
}

interface BrandingState {
  venueId: string;
  name: string;
  address: string;
  settings: VenueSettings;
  isLoading: boolean;
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
  settings: {
    companyName: 'poscocina Gourmet',
    logoUrl: '',
    primaryColor: '#f97316', // Orange default
    currency: 'COP',
    taxRate: 0.19,
    taxId: '900.123.456-7',
    phone: '+57 300 123 4567',
    receiptHeader: 'Deliciosos momentos a tu mesa',
    receiptFooter: '¡Gracias por su visita! Vuelva pronto.',
  },
  isLoading: false,

  loadBranding: async (venueId: string) => {
    if (!venueId) return;
    set({ isLoading: true, venueId });
    try {
      const res = await fetch(`/api/venues/${venueId}`);
      if (res.ok) {
        const data = await res.json();
        set({
          name: data.name || 'poscocina Restaurante',
          address: data.address || '',
          settings: {
            companyName: data.name,
            logoUrl: '',
            primaryColor: '#f97316',
            currency: 'COP',
            taxRate: 0.19,
            taxId: '900.123.456-7',
            phone: '+57 300 123 4567',
            receiptHeader: 'Deliciosos momentos a tu mesa',
            receiptFooter: '¡Gracias por su visita! Vuelva pronto.',
            ...(data.settings || {}),
          },
        });
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

      const res = await fetch(`/api/venues/${venueId}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updated = await res.json();
        set({
          name: updated.name,
          address: updated.address,
          settings: {
            ...currentSettings,
            ...(updated.settings || {}),
          },
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating branding:', err);
      return false;
    }
  },
}));
