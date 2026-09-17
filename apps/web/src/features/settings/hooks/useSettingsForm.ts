import { useReducer, useEffect, useCallback, useState } from 'react';
import { useBrandingStore, VenueSettings } from '@/stores/branding.store';
import { TaxType, PaperWidth } from '../types/settings.types';
import { toast } from '@/components/ui/sonner';

interface FormState {
  companyName: string;
  logoUrl: string;
  primaryColor: string;
  venueAddress: string;
  taxId: string;
  phone: string;
  currency: string;
  taxType: TaxType;
  taxRate: string;
  defaultTipPct: string;
  paperWidth: PaperWidth;
  autoPrintReceipt: boolean;
  receiptHeader: string;
  receiptFooter: string;
}

type FormAction =
  | { type: 'SET_FIELD'; field: keyof FormState; value: any }
  | { type: 'SET_TAX_TYPE'; taxType: TaxType }
  | { type: 'RESET'; payload: FormState };

const getInitialState = (settings: VenueSettings, name: string, address: string): FormState => ({
  companyName: settings.companyName || name || '',
  logoUrl: settings.logoUrl || '',
  primaryColor: settings.primaryColor || '#ea580c',
  venueAddress: address || '',
  taxId: settings.taxId || '900.123.456-7',
  phone: settings.phone || '+57 300 123 4567',
  currency: settings.currency || 'COP',
  taxType: (settings.taxType as TaxType) || 'INC_8',
  taxRate: settings.taxRate !== undefined ? (settings.taxRate * 100).toString() : '8',
  defaultTipPct: settings.defaultTipPct !== undefined ? settings.defaultTipPct.toString() : '10',
  paperWidth: (settings.paperWidth as PaperWidth) || 80,
  autoPrintReceipt: settings.autoPrintReceipt ?? true,
  receiptHeader: settings.receiptHeader || 'Sabor tradicional & Alta cocina',
  receiptFooter: settings.receiptFooter || '¡Gracias por su visita! Síguenos en @poscocina',
});

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_TAX_TYPE':
      return {
        ...state,
        taxType: action.taxType,
        taxRate: action.taxType === 'INC_8' ? '8' : action.taxType === 'IVA_19' ? '19' : '0',
      };
    case 'RESET':
      return action.payload;
    default:
      return state;
  }
}

export const useSettingsForm = () => {
  const { settings, name, address, updateBranding } = useBrandingStore();
  const [state, dispatch] = useReducer(formReducer, getInitialState(settings, name, address));
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    dispatch({ type: 'RESET', payload: getInitialState(settings, name, address) });
  }, [settings, name, address]);

  const setField = useCallback((field: keyof FormState, value: any) => {
    dispatch({ type: 'SET_FIELD', field, value });
  }, []);

  const setTaxType = useCallback((taxType: TaxType) => {
    dispatch({ type: 'SET_TAX_TYPE', taxType });
  }, []);

  const saveSettings = useCallback(async () => {
    setSaving(true);
    const numericRate = parseFloat(state.taxRate) / 100;
    const ok = await updateBranding({
      name: state.companyName,
      address: state.venueAddress,
      settings: {
        ...state,
        taxRate: numericRate,
        defaultTaxRate: numericRate,
        defaultTipPct: parseFloat(state.defaultTipPct) || 0,
      },
    });
    setSaving(false);
    if (ok) {
      setSavedSuccess(true);
      toast.success('Ajustes guardados correctamente');
      setTimeout(() => setSavedSuccess(false), 3000);
    } else {
      toast.error('Error al guardar ajustes de configuración');
    }
  }, [state, updateBranding]);

  return { form: state, setField, setTaxType, saveSettings, saving, savedSuccess };
};
