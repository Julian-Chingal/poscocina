import React, { useState } from 'react';
import { Layers, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<any>;
}

export const FloorPlanModal: React.FC<Props> = ({
  isOpen,
  submitting,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onSubmit(name.trim());
    setName('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Nueva Zona o Salón</span>
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre del Área / Salón *</label>
            <input
              type="text"
              required
              placeholder="Ej. Terraza Exterior, Segundo Piso, Zona VIP..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl">Cancelar</button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Creando...' : 'Crear Zona'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
