import React from 'react';
import { Wifi, Play, Edit2, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { PrinterDevice, TestPrintResult } from '../types/settings.types';
import { STATION_LABELS } from '../constants/settings.constants';

interface Props {
  printer: PrinterDevice;
  isTesting: boolean;
  testResult: TestPrintResult | null;
  onTest: (p: PrinterDevice) => void;
  onEdit: (p: PrinterDevice) => void;
  onDelete: (id: string) => void;
}

export const PrinterCard: React.FC<Props> = ({
  printer,
  isTesting,
  testResult,
  onTest,
  onEdit,
  onDelete,
}) => {
  const result = testResult?.id === printer.id ? testResult : null;

  return (
    <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between space-y-3 relative group">
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-bold text-white text-sm">{printer.name}</h4>
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 mt-1 rounded-md bg-orange-950/60 border border-orange-800/60 text-orange-300">
              {STATION_LABELS[printer.station] || printer.station}
            </span>
          </div>
          <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
            {printer.paperWidth}mm
          </span>
        </div>

        <div className="mt-3 space-y-1.5 text-xs text-slate-300 font-mono">
          <div className="flex items-center space-x-1.5">
            <Wifi className="w-3.5 h-3.5 text-slate-500" />
            <span>
              {printer.connectionType === 'network_tcp'
                ? `TCP: ${printer.ipAddress || 'Sin IP'}:${printer.port}`
                : 'Navegador Web / USB'}
            </span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1 text-[10px]">
          {printer.autoPrintOnOrder && (
            <span className="bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 px-1.5 py-0.5 rounded">
              Comandas Auto
            </span>
          )}
          {printer.autoPrintOnPayment && (
            <span className="bg-blue-950/60 border border-blue-800/40 text-blue-300 px-1.5 py-0.5 rounded">
              Facturas Auto
            </span>
          )}
          {printer.openDrawerOnPrint && (
            <span className="bg-purple-950/60 border border-purple-800/40 text-purple-300 px-1.5 py-0.5 rounded">
              Pulso Gaveta
            </span>
          )}
        </div>
      </div>

      {result && (
        <div
          className={`p-2 rounded-xl text-[11px] flex items-center space-x-1.5 ${
            result.success
              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
          }`}
        >
          {result.success ? (
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-rose-400" />
          )}
          <span className="truncate">{result.msg}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-800">
        <button
          type="button"
          disabled={isTesting}
          onClick={() => onTest(printer)}
          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1 transition cursor-pointer border border-slate-700"
        >
          <Play className="w-3 h-3 text-emerald-400" />
          <span>{isTesting ? 'Enviando...' : 'Test Impresión'}</span>
        </button>

        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => onEdit(printer)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(printer.id)}
            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
