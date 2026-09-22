import React, { useState, Suspense, lazy } from 'react';
import { useBrandingStore } from '@/stores/branding.store';
import { useSettingsForm } from './hooks/useSettingsForm';
import { SettingsTab } from './types/settings.types';
import { SettingsHeader } from './components/SettingsHeader';
import { SettingsTabsNav } from './components/SettingsTabsNav';
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

  return (
    <div className="max-w-6xl mx-auto p-6 sm:p-10">
      <SettingsHeader
        activeTab={activeTab}
        saving={saving}
        savedSuccess={savedSuccess}
        onSave={saveSettings}
      />

      <SettingsTabsNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        venuesCount={venues.length}
      />

      {activeTab === 'identity' && (
        <IdentityTab
          companyName={form.companyName}
          logoUrl={form.logoUrl}
          primaryColor={form.primaryColor}
          venueAddress={form.venueAddress}
          phone={form.phone}
          onFieldChange={setField}
        />
      )}

      {activeTab === 'tax' && (
        <TaxBillingTab
          taxId={form.taxId}
          taxType={form.taxType}
          taxRate={form.taxRate}
          defaultTipPct={form.defaultTipPct}
          currency={form.currency}
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
    </div>
  );
};

export default SettingsView;
