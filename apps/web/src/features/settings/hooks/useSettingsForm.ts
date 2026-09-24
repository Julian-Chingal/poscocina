import { useReducer, useEffect, useCallback, useState } from 'react';
import { useBrandingStore, VenueSettings } from '@/stores/branding.store';
import { TaxType, PaperWidth } from '../types/settings.types';
import { settingsApi } from '../api/settings.api';
import { toast } from '@/components/ui/sonner';

export interface FormState {
  legalName: string;
  companyName: string; // tradeName
  logoUrl: string;
  primaryColor: string;
  venueAddress: string;
  taxId: string;
  phone: string;
  email: string;
  currency: string;
  regime: 'COMUN' | 'SIMPLIFICADO' | 'NO_RESPONSABLE_IVA' | 'ESPECIAL';
  taxType: TaxType;
  taxRate: string;
  defaultTipPct: string;
  isInvoiceResolutionEnabled: boolean;
  invoicePrefix: string;
  invoiceResolution: string;
  invoiceInitialNumber: string;
  invoiceFinalNumber: string;
  invoiceResolutionDate: string;
  paperWidth: PaperWidth;
  autoPrintReceipt: boolean;
  receiptHeader: string;
  receiptFooter: string;
}

type FormAction =
  | { type: 'SET_FIELD'; field: keyof FormState; value: any }
  | { type: 'SET_TAX_TYPE'; taxType: TaxType }
  | { type: 'RESET'; payload: FormState }
  | { type: 'MERGE_COMPANY'; payload: any };

const getInitialState = (settings: VenueSettings, name: string, address: string): FormState => ({
  legalName: 'poscocina S.A.S.',
  companyName: settings.companyName || name || 'poscocina Gourmet',
  logoUrl: settings.logoUrl || '',
  primaryColor: settings.primaryColor || '#ea580c',
  venueAddress: address || '',
  taxId: settings.taxId || '900.123.456-7',
  phone: settings.phone || '+57 300 123 4567',
  email: '',
  currency: settings.currency || 'COP',
  regime: 'SIMPLIFICADO',
  taxType: (settings.taxType as TaxType) || 'INC_8',
  taxRate: settings.taxRate !== undefined ? (settings.taxRate * 100).toString() : '8',
  defaultTipPct: settings.defaultTipPct !== undefined ? settings.defaultTipPct.toString() : '10',
  isInvoiceResolutionEnabled: false,
  invoicePrefix: 'POS',
  invoiceResolution: '',
  invoiceInitialNumber: '1',
  invoiceFinalNumber: '50000',
  invoiceResolutionDate: '',
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
    case 'MERGE_COMPANY': {
      const c = action.payload;
      const f = c.fiscal || {};
      const numRate = typeof f.taxRate === 'number' ? f.taxRate : parseFloat(f.taxRate) || 0.08;
      return {
        ...state,
        legalName: c.legalName || state.legalName,
        companyName: c.tradeName || state.companyName,
        taxId: c.taxId || state.taxId,
        logoUrl: c.logoUrl || state.logoUrl,
        primaryColor: c.primaryColor || state.primaryColor,
        phone: c.phone || state.phone,
        email: c.email || state.email,
        venueAddress: c.address || state.venueAddress,
        regime: f.regime || state.regime,
        taxType: f.taxType || state.taxType,
        taxRate: (numRate * 100).toString(),
        defaultTipPct: f.defaultTipPct !== undefined ? f.defaultTipPct.toString() : state.defaultTipPct,
        currency: f.currency || state.currency,
        isInvoiceResolutionEnabled: f.isInvoiceResolutionEnabled !== undefined ? Boolean(f.isInvoiceResolutionEnabled) : state.isInvoiceResolutionEnabled,
        invoicePrefix: f.invoicePrefix || state.invoicePrefix,
        invoiceResolution: f.invoiceResolution || state.invoiceResolution,
        invoiceInitialNumber: f.invoiceInitialNumber !== undefined && f.invoiceInitialNumber !== null ? f.invoiceInitialNumber.toString() : state.invoiceInitialNumber,
        invoiceFinalNumber: f.invoiceFinalNumber !== undefined && f.invoiceFinalNumber !== null ? f.invoiceFinalNumber.toString() : state.invoiceFinalNumber,
        invoiceResolutionDate: f.invoiceResolutionDate ? f.invoiceResolutionDate.substring(0, 10) : state.invoiceResolutionDate,
        receiptHeader: f.receiptHeader || state.receiptHeader,
        receiptFooter: f.receiptFooter || state.receiptFooter,
      };
    }
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
    let mounted = true;
    settingsApi
      .getCompany()
      .then((companyData) => {
        if (mounted && companyData) {
          dispatch({ type: 'MERGE_COMPANY', payload: companyData });
        }
      })
      .catch((err) => {
        console.warn('No se pudo cargar datos de empresa:', err);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const setField = useCallback((field: keyof FormState, value: any) => {
    dispatch({ type: 'SET_FIELD', field, value });
  }, []);

  const setTaxType = useCallback((taxType: TaxType) => {
    dispatch({ type: 'SET_TAX_TYPE', taxType });
  }, []);

  const saveSettings = useCallback(async () => {
    setSaving(true);
    try {
      const numericRate = parseFloat(state.taxRate) / 100;
      const initialNum = state.invoiceInitialNumber ? parseInt(state.invoiceInitialNumber, 10) : null;
      const finalNum = state.invoiceFinalNumber ? parseInt(state.invoiceFinalNumber, 10) : null;

      // Validación preventiva si la resolución fiscal está activa
      if (state.isInvoiceResolutionEnabled) {
        if (!state.invoicePrefix || state.invoicePrefix.trim() === '') {
          toast.error('El prefijo de factura es requerido al activar la resolución fiscal');
          setSaving(false);
          return;
        }
        if (!state.invoiceResolution || state.invoiceResolution.trim() === '') {
          toast.error('El número de resolución es requerido al activar la resolución fiscal');
          setSaving(false);
          return;
        }
        if (initialNum === null || isNaN(initialNum)) {
          toast.error('El rango inicial debe ser un número entero válido');
          setSaving(false);
          return;
        }
        if (finalNum === null || isNaN(finalNum)) {
          toast.error('El rango final debe ser un número entero válido');
          setSaving(false);
          return;
        }
        if (finalNum <= initialNum) {
          toast.error('El rango final debe ser estrictamente mayor que el rango inicial');
          setSaving(false);
          return;
        }
      }

      // 1. Guardar a nivel corporativo / Empresa
      await settingsApi.updateCompany({
        legalName: state.legalName,
        tradeName: state.companyName,
        taxId: state.taxId,
        logoUrl: state.logoUrl,
        primaryColor: state.primaryColor,
        phone: state.phone,
        email: state.email || null,
        address: state.venueAddress,
        fiscal: {
          regime: state.regime,
          taxType: state.taxType,
          taxRate: numericRate,
          defaultTipPct: parseFloat(state.defaultTipPct) || 0,
          currency: state.currency,
          isInvoiceResolutionEnabled: state.isInvoiceResolutionEnabled,
          invoicePrefix: state.isInvoiceResolutionEnabled ? (state.invoicePrefix || null) : null,
          invoiceResolution: state.isInvoiceResolutionEnabled ? (state.invoiceResolution || null) : null,
          invoiceInitialNumber: state.isInvoiceResolutionEnabled ? (isNaN(initialNum as number) ? null : initialNum) : null,
          invoiceFinalNumber: state.isInvoiceResolutionEnabled ? (isNaN(finalNum as number) ? null : finalNum) : null,
          invoiceResolutionDate: state.isInvoiceResolutionEnabled ? (state.invoiceResolutionDate || null) : null,
          receiptHeader: state.receiptHeader,
          receiptFooter: state.receiptFooter,
        },
      });

      // 2. Sincronizar store local y venue settings
      await updateBranding({
        name: state.companyName,
        address: state.venueAddress,
        settings: {
          ...state,
          taxRate: numericRate,
          defaultTaxRate: numericRate,
          defaultTipPct: parseFloat(state.defaultTipPct) || 0,
        },
      });

      // 3. Aplicar CSS variable
      if (state.primaryColor) {
        document.documentElement.style.setProperty('--primary-brand', state.primaryColor);
      }

      setSavedSuccess(true);
      toast.success('Configuración corporativa guardada con éxito');
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error guardando configuración:', err);
      toast.error(err?.message || 'Error al guardar configuración corporativa');
    } finally {
      setSaving(false);
    }
  }, [state, updateBranding]);

  return { form: state, setField, setTaxType, saveSettings, saving, savedSuccess };
};
