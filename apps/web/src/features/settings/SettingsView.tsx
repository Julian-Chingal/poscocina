import React, { useState, Suspense, lazy } from 'react';
import { Building2, Receipt, Store, Printer, Save, Check } from 'lucide-react';
import { useBrandingStore } from '@/stores/branding.store';
import { useSettingsForm } from './hooks/useSettingsForm';
import { SettingsTab } from './types/settings.types';
import { SubNavLayout, SubNavGroup } from '@/components/common/SubNavLayout';
import { Button } from '@/components/ui/button';
import { IdentityTab } from './components/IdentityTab';
import { TaxBillingTab } from './components/TaxBillingTab';

const PrintersTab = lazy(() => import('./components/PrintersTab'));
const VenuesTab = lazy(() => import('./components/VenuesTab'));

const TabSkeleton: React.FC = () => (
  <div className="w-full py-16 flex flex-col items-center justify-center space-y-3 text-muted-foreground">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    <span className="text-xs font-mono">Cargando módulo de configuración...</span>
  </div>
);

export const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('identity');
  const venues = useBrandingStore((s) => s.venues);
  const { form, setField, setTaxType, saveSettings, saving, savedSuccess } = useSettingsForm();

  const settingsGroups: SubNavGroup[] = [
    {
      id: 'global',
      heading: 'Global (Empresa)',
      items: [
        {
          id: 'identity',
          label: 'Identidad & Marca',
          icon: Building2,
        },
        {
          id: 'tax',
          label: 'Facturación & Impuestos',
          icon: Receipt,
        },
        {
          id: 'venues',
          label: 'Gestión de Sedes',
          icon: Store,
          badge: venues.length,
          badgeVariant: 'secondary',
        },
      ],
    },
    {
      id: 'local',
      heading: 'Local (Por Sede)',
      items: [
        {
          id: 'printer',
          label: 'Impresoras Térmicas ESC/POS',
          icon: Printer,
        },
      ],
    },
  ];

  const headerActions = activeTab !== 'venues' ? (
    <Button
      type="button"
      onClick={saveSettings}
      disabled={saving}
      className={`flex items-center space-x-2 px-6 py-2.5 h-auto rounded-xl font-bold text-sm transition-all cursor-pointer shadow-lg ${
        savedSuccess
          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
          : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20'
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
    </Button>
  ) : null;

  return (
    <SubNavLayout
      title="Ajustes del Sistema"
      subtitle="Configuración fiscal, marca corporativa, tickets ESC/POS y multi-sucursal."
      category="Personalización & Marca Blanca"
      headerActions={headerActions}
      groups={settingsGroups}
      activeItemId={activeTab}
      onSelectItem={(id) => setActiveTab(id as SettingsTab)}
    >
      {activeTab === 'identity' && (
        <IdentityTab
          legalName={form.legalName}
          companyName={form.companyName}
          logoUrl={form.logoUrl}
          primaryColor={form.primaryColor}
          venueAddress={form.venueAddress}
          phone={form.phone}
          email={form.email}
          onFieldChange={setField}
        />
      )}

      {activeTab === 'tax' && (
        <TaxBillingTab
          taxId={form.taxId}
          regime={form.regime}
          taxType={form.taxType}
          taxRate={form.taxRate}
          defaultTipPct={form.defaultTipPct}
          currency={form.currency}
          isInvoiceResolutionEnabled={form.isInvoiceResolutionEnabled}
          invoicePrefix={form.invoicePrefix}
          invoiceResolution={form.invoiceResolution}
          invoiceInitialNumber={form.invoiceInitialNumber}
          invoiceFinalNumber={form.invoiceFinalNumber}
          invoiceResolutionDate={form.invoiceResolutionDate}
          onFieldChange={setField}
          onTaxTypeChange={setTaxType}
        />
      )}

      {activeTab === 'printer' && (
        <Suspense fallback={<TabSkeleton />}>
          <PrintersTab
            paperWidth={form.paperWidth}
            autoPrintReceipt={form.autoPrintReceipt}
            receiptHeader={form.receiptHeader}
            receiptFooter={form.receiptFooter}
            logoUrl={form.logoUrl}
            primaryColor={form.primaryColor}
            companyName={form.companyName}
            taxId={form.taxId}
            venueAddress={form.venueAddress}
            phone={form.phone}
            taxType={form.taxType}
            taxRate={form.taxRate}
            defaultTipPct={form.defaultTipPct}
            currency={form.currency}
            onFieldChange={setField}
          />
        </Suspense>
      )}

      {activeTab === 'venues' && (
        <Suspense fallback={<TabSkeleton />}>
          <VenuesTab isActive={activeTab === 'venues'} />
        </Suspense>
      )}
    </SubNavLayout>
  );
};

export default SettingsView;
