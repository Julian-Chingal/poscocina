import React, { useState, lazy, Suspense } from 'react';
import { useBrandingStore } from '@/stores/branding.store';
import { useReportsData } from './hooks/useReportsData';
import { useAuditLogs } from './hooks/useAuditLogs';
import { ReportsHeader } from './components/ReportsHeader';
import { KpiCardsGrid } from './components/KpiCardsGrid';
import { HourlySalesChart } from './components/HourlySalesChart';
import { PaymentMethodsBreakdown } from './components/PaymentMethodsBreakdown';
import { TopProductsTable } from './components/TopProductsTable';
import { KitchenVelocityCard } from './components/KitchenVelocityCard';

const AuditTrailTab = lazy(() => import('./components/AuditTrailTab'));

interface ReportsViewProps {
  venueId?: string | null;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ venueId }) => {
  const { settings, name: venueName } = useBrandingStore();
  const [activeTab, setActiveTab] = useState<'metrics' | 'audit'>('metrics');

  const {
    period,
    isLoading,
    overview,
    hourly,
    topProducts,
    kdsMetrics,
    cogsMetrics,
    setPeriod,
    refreshData,
    exportCSV,
  } = useReportsData(venueId, settings.companyName || venueName);

  const {
    auditLogs,
    auditFilterAction,
    setAuditFilterAction,
    auditLoading,
    loadAuditLogs,
  } = useAuditLogs(venueId, activeTab);

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto p-6 space-y-6 text-foreground print:p-0 print:text-black">
      <ReportsHeader
        period={period}
        onPeriodChange={setPeriod}
        isLoading={isLoading}
        onRefresh={refreshData}
        onExportCSV={exportCSV}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === 'metrics' && (
        <>
          <KpiCardsGrid overview={overview} cogsMetrics={cogsMetrics} />

          <div className="w-full min-w-0 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="w-full min-w-0 lg:col-span-2">
              <HourlySalesChart hourly={hourly} />
            </div>
            <div className="w-full min-w-0">
              <PaymentMethodsBreakdown overview={overview} />
            </div>
          </div>

          <div className="w-full min-w-0 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <TopProductsTable topProducts={topProducts} />
            <KitchenVelocityCard kdsMetrics={kdsMetrics} />
          </div>
        </>
      )}

      {activeTab === 'audit' && (
        <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Cargando auditoría...</div>}>
          <AuditTrailTab
            auditLogs={auditLogs}
            auditFilterAction={auditFilterAction}
            auditLoading={auditLoading}
            onFilterChange={setAuditFilterAction}
            onRefresh={loadAuditLogs}
          />
        </Suspense>
      )}
    </div>
  );
};

export default ReportsView;
