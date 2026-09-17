import React from 'react';
import { RefreshCw } from 'lucide-react';
import { AuditLogItem } from '../types/reports.types';

interface AuditTrailTabProps {
  auditLogs: AuditLogItem[];
  auditFilterAction: string;
  auditLoading: boolean;
  onFilterChange: (action: string) => void;
  onRefresh: () => void;
}

const ACTION_FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'billing:discount_applied', label: 'Descuentos' },
  { id: 'order:item_cancelled', label: 'Platos Cancelados' },
  { id: 'cash_drawer:manual_open', label: 'Apertura Gaveta' },
  { id: 'cash_shift:discrepancy', label: 'Diferencia Caja' },
];

export const AuditTrailTab: React.FC<AuditTrailTabProps> = ({
  auditLogs,
  auditFilterAction,
  auditLoading,
  onFilterChange,
  onRefresh,
}) => {
  return (
    <div className="space-y-4">
      {/* Filter by action */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Filtrar por evento:</span>
          <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
            {ACTION_FILTERS.map((item) => (
              <button
                key={item.id}
                onClick={() => onFilterChange(item.id)}
                className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                  auditFilterAction === item.id
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onRefresh}
          title="Recargar eventos"
          className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${auditLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Fecha / Hora</th>
                <th className="py-3 px-4">Evento de Seguridad</th>
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-4">IP / Origen</th>
                <th className="py-3 px-4">Detalles / Causa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {auditLoading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">
                    Cargando registro de auditoría...
                  </td>
                </tr>
              ) : auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">
                    No se registran eventos de seguridad para este local.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => {
                  const dt = new Date(log.createdAt).toLocaleString('es-CO');
                  return (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {dt}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {log.action === 'billing:discount_applied' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            🏷️ Descuento Aplicado
                          </span>
                        )}
                        {log.action === 'order:item_cancelled' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            ❌ Plato Cancelado
                          </span>
                        )}
                        {log.action === 'cash_drawer:manual_open' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            🔓 Gaveta Manual
                          </span>
                        )}
                        {log.action === 'cash_shift:discrepancy' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                            ⚠️ Diferencia en Arqueo
                          </span>
                        )}
                        {!['billing:discount_applied', 'order:item_cancelled', 'cash_drawer:manual_open', 'cash_shift:discrepancy'].includes(log.action) && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                            {log.action}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">
                          {log.user?.name || (log.userId ? log.userId.slice(0, 8) : 'Sistema / POS')}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {log.ipAddress || '127.0.0.1'}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-slate-300">
                        {log.payload ? (
                          <pre className="max-w-md truncate whitespace-pre-wrap font-sans text-[11px] text-slate-400">
                            {JSON.stringify(log.payload, null, 1).replace(/[{}]/g, '')}
                          </pre>
                        ) : (
                          '--'
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditTrailTab;
