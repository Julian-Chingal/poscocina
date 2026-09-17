import React, { useState, useEffect } from 'react';
import { Layers, X, AlertTriangle } from 'lucide-react';
import { Category, CategoryFormData } from '../types/catalog.types';
import { PRESET_COLORS, PRINTER_STATION_OPTIONS } from '../constants/catalog.constants';

interface Props {
  isOpen: boolean;
  editingCategory: Category | null;
  totalCategories: number;
  submitting: boolean;
  formError: string | null;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => Promise<void>;
}

export const CategoryModal: React.FC<Props> = ({
  isOpen,
  editingCategory,
  totalCategories,
  submitting,
  formError,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState<CategoryFormData>({
    name: '',
    color: '#3b82f6',
    printerStation: 'kitchen',
    sortOrder: 0,
  });

  useEffect(() => {
    if (editingCategory) {
      setForm({
        name: editingCategory.name,
        color: editingCategory.color || '#3b82f6',
        printerStation: editingCategory.printerStation || 'kitchen',
        sortOrder: editingCategory.sortOrder || 0,
      });
    } else {
      setForm({
        name: '',
        color: '#3b82f6',
        printerStation: 'kitchen',
        sortOrder: totalCategories,
      });
    }
  }, [editingCategory, totalCategories, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</span>
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre de la categoría *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej. Entradas, Platos Fuertes, Bebidas..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Color distintivo</label>
            <div className="flex items-center space-x-2 mb-2">
              {PRESET_COLORS.map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setForm({ ...form, color: col })}
                  className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                    form.color === col ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: col }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Estación de Preparación Predeterminada</label>
            <select
              value={form.printerStation}
              onChange={(e) => setForm({ ...form, printerStation: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              {PRINTER_STATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl">Cancelar</button>
            <button type="submit" disabled={submitting} className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow cursor-pointer disabled:opacity-50">
              {submitting ? 'Guardando...' : 'Guardar Categoría'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
