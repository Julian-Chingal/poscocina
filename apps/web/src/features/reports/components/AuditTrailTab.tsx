import React from 'react';
import { RefreshCw } from 'lucide-react';
import { AuditLogItem } from '../types/reports.types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

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
      <Card className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/80 border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Filtrar por evento:</span>
          <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
            {ACTION_FILTERS.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => onFilterChange(item.id)}
                className={`h-7 px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                  auditFilterAction === item.id
                    ? 'bg-rose-600 text-white shadow hover:bg-rose-500'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          title="Recargar eventos"
          className="p-2 h-9 w-9 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${auditLoading ? 'animate-spin' : ''}`} />
        </Button>
      </Card>

      {/* Audit Logs Table */}
      <Card className="overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha / Hora</TableHead>
              <TableHead>Evento de Seguridad</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>IP / Origen</TableHead>
              <TableHead>Detalles / Causa</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-slate-500">
                  Cargando registro de auditoría...
                </TableCell>
              </TableRow>
            ) : auditLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-slate-500">
                  No se registran eventos de seguridad para este local.
                </TableCell>
              </TableRow>
            ) : (
              auditLogs.map((log) => {
                const dt = new Date(log.createdAt).toLocaleString('es-CO');
                return (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {dt}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {log.action === 'billing:discount_applied' && (
                        <Badge variant="outline" className="gap-1 text-[11px] font-bold bg-amber-500/20 text-amber-300 border-amber-500/30">
                          🏷️ Descuento Aplicado
                        </Badge>
                      )}
                      {log.action === 'order:item_cancelled' && (
                        <Badge variant="destructive" className="gap-1 text-[11px] font-bold bg-rose-500/20 text-rose-300 border-rose-500/30">
                          ❌ Plato Cancelado
                        </Badge>
                      )}
                      {log.action === 'cash_drawer:manual_open' && (
                        <Badge variant="outline" className="gap-1 text-[11px] font-bold bg-purple-500/20 text-purple-300 border-purple-500/30">
                          🔓 Gaveta Manual
                        </Badge>
                      )}
                      {log.action === 'cash_shift:discrepancy' && (
                        <Badge variant="destructive" className="gap-1 text-[11px] font-bold bg-red-500/20 text-red-300 border-red-500/30">
                          ⚠️ Diferencia en Arqueo
                        </Badge>
                      )}
                      {!['billing:discount_applied', 'order:item_cancelled', 'cash_drawer:manual_open', 'cash_shift:discrepancy'].includes(log.action) && (
                        <Badge variant="outline" className="gap-1 text-[11px] font-bold bg-slate-800 text-slate-300 border-slate-700">
                          {log.action}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-white">
                        {log.user?.name || (log.userId ? log.userId.slice(0, 8) : 'Sistema / POS')}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {log.ipAddress || '127.0.0.1'}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-slate-300">
                      {log.payload ? (
                        <pre className="max-w-md truncate whitespace-pre-wrap font-sans text-[11px] text-slate-400">
                          {JSON.stringify(log.payload, null, 1).replace(/[{}]/g, '')}
                        </pre>
                      ) : (
                        '--'
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default AuditTrailTab;
