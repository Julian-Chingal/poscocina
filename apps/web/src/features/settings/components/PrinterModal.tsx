import React, { useState, useEffect, FormEvent } from 'react';
import { Printer, X } from 'lucide-react';
import { PrinterDevice, PrinterFormData } from '../types/settings.types';
import { PrinterFlagsFields } from './PrinterFlagsFields';

interface Props {
  isOpen: boolean;
  editingPrinter: PrinterDevice | null;
  onClose: () => void;
  onSave: (data: PrinterFormData) => void;
}

const DEFAULT_FORM: PrinterFormData = {
  name: '',
  station: 'kitchen',
  connectionType: 'network_tcp',
  ipAddress: '',
  port: 9100,
  paperWidth: '80',
  autoPrintOnOrder: true,
  autoPrintOnPayment: false,
  openDrawerOnPrint: false,
};

export const PrinterModal: React.FC<Props> = ({ isOpen, editingPrinter, onClose, onSave }) => {
  const [formData, setFormData] = useState<PrinterFormData>(DEFAULT_FORM);

  useEffect(() => {
    setFormData(editingPrinter ? {
      name: editingPrinter.name,
      station: editingPrinter.station,
      connectionType: editingPrinter.connectionType,
      ipAddress: editingPrinter.ipAddress || '',
      port: editingPrinter.port || 9100,
      paperWidth: editingPrinter.paperWidth || '80',
      autoPrintOnOrder: editingPrinter.autoPrintOnOrder ?? true,
      autoPrintOnPayment: editingPrinter.autoPrintOnPayment ?? false,
      openDrawerOnPrint: editingPrinter.openDrawerOnPrint ?? false,
    } : DEFAULT_FORM);
  }, [editingPrinter, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Printer className="w-5 h-5 text-orange-400" />
            <span>{editingPrinter ? 'Editar Impresora' : 'Nueva Impresora'}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre: *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej. Epson Cocina o Xprinter Barra"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Estación: *</label>
              <select
                value={formData.station}
                onChange={(e: any) => setFormData({ ...formData, station: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="kitchen">Cocina Caliente</option>
                <option value="bar">Barra / Bebidas</option>
                <option value="dessert">Postres / Café</option>
                <option value="cashier">Caja Principal (Recibos)</option>
                <option value="expediter">Expedición</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Ancho Papel: *</label>
              <select
                value={formData.paperWidth}
                onChange={(e: any) => setFormData({ ...formData, paperWidth: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="80">80 mm (Estándar POS)</option>
                <option value="58">58 mm (Compacto)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Conexión: *</label>
              <select
                value={formData.connectionType}
                onChange={(e: any) => setFormData({ ...formData, connectionType: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="network_tcp">Red LAN TCP (Socket)</option>
                <option value="browser_raw">Navegador Web / USB</option>
                <option value="disabled">Deshabilitada</option>
              </select>
            </div>

            {formData.connectionType === 'network_tcp' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">IP en Red:</label>
                <input
                  type="text"
                  placeholder="192.168.1.100"
                  value={formData.ipAddress}
                  onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Puerto RAW:</label>
                <input
                  type="number"
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                />
              </div>
            )}
          </div>

          <PrinterFlagsFields
            formData={formData}
            onChange={(patch) => setFormData((prev) => ({ ...prev, ...patch }))}
          />

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white">
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition shadow-lg shadow-orange-600/20"
            >
              {editingPrinter ? 'Guardar Cambios' : 'Registrar Impresora'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
