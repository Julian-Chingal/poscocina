import React from 'react';
import { Wifi, Play, Edit2, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { PrinterDevice, TestPrintResult } from '../types/settings.types';
import { STATION_LABELS } from '../constants/settings.constants';
import { Button } from '@/components/ui/button';
import { Card, CardFooter } from '@/components/ui/card';

interface Props {
  printer: PrinterDevice;
  isTesting: boolean;
  testResult: TestPrintResult | null;
  onTest: (p: PrinterDevice) => void;
  onEdit: (p: PrinterDevice) => void;
  onDelete: (printer: PrinterDevice) => void;
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
    <Card className="p-4 flex flex-col justify-between space-y-3 relative group">
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-bold text-foreground text-sm">{printer.name}</h4>
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 mt-1 rounded-md bg-primary/15 border border-primary/30 text-primary">
              {STATION_LABELS[printer.station] || printer.station}
            </span>
          </div>
          <span className="text-[10px] font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded border border-border">
            {printer.paperWidth}mm
          </span>
        </div>

        <div className="mt-3 space-y-1.5 text-xs text-muted-foreground font-mono">
          <div className="flex items-center space-x-1.5">
            <Wifi className="w-3.5 h-3.5 text-muted-foreground/70" />
            <span>
              {printer.connectionType === 'network_tcp'
                ? `TCP: ${printer.ipAddress || 'Sin IP'}:${printer.port}`
                : 'Navegador Web / USB'}
            </span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1 text-[10px]">
          {printer.autoPrintOnOrder && (
            <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded">
              Comandas Auto
            </span>
          )}
          {printer.autoPrintOnPayment && (
            <span className="bg-blue-500/15 border border-blue-500/30 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded">
              Facturas Auto
            </span>
          )}
          {printer.openDrawerOnPrint && (
            <span className="bg-purple-500/15 border border-purple-500/30 text-purple-700 dark:text-purple-400 px-1.5 py-0.5 rounded">
              Pulso Gaveta
            </span>
          )}
        </div>
      </div>

      {result && (
        <div
          className={`p-2 rounded-xl text-[11px] flex items-center space-x-1.5 ${
            result.success
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
              : 'bg-destructive/10 text-destructive border border-destructive/30'
          }`}
        >
          {result.success ? (
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-destructive" />
          )}
          <span className="truncate">{result.msg}</span>
        </div>
      )}

      <CardFooter className="p-0 flex items-center justify-between pt-3 border-t border-border mt-0">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isTesting}
          onClick={() => onTest(printer)}
          className="px-2.5 py-1.5 h-auto rounded-lg text-xs font-semibold flex items-center space-x-1 transition cursor-pointer"
        >
          <Play className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
          <span>{isTesting ? 'Enviando...' : 'Test Impresión'}</span>
        </Button>

        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={() => onEdit(printer)}
            className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-lg transition cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={() => onDelete(printer)}
            className="h-7 w-7 text-muted-foreground hover:text-destructive rounded-lg transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
