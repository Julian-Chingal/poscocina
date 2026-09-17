import React, { useState, useEffect } from 'react';
import { Utensils, X, AlertTriangle } from 'lucide-react';
import { Product, Category, ProductFormData } from '../types/catalog.types';
import { ProductPricingFields } from './ProductPricingFields';
import { ProductStationFields } from './ProductStationFields';
import { ProductFlagsFields } from './ProductFlagsFields';

interface Props {
  isOpen: boolean;
  editingProduct: Product | null;
  categories: Category[];
  defaultCategoryId?: string;
  submitting: boolean;
  formError: string | null;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => Promise<void>;
}

export const ProductModal: React.FC<Props> = ({
  isOpen,
  editingProduct,
  categories,
  defaultCategoryId,
  submitting,
  formError,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState<ProductFormData>({
    name: '',
    categoryId: '',
    price: '',
    taxRate: 0.08,
    printerStation: 'kitchen',
    description: '',
    prepTimeMin: 15,
    trackInventory: false,
    isAvailable: true,
  });

  useEffect(() => {
    if (editingProduct) {
      setForm({
        name: editingProduct.name,
        categoryId: editingProduct.categoryId,
        price: editingProduct.price ? String(editingProduct.price) : '',
        taxRate: editingProduct.taxRate !== undefined && editingProduct.taxRate !== null ? Number(editingProduct.taxRate) : 0.08,
        printerStation: editingProduct.printerStation || 'kitchen',
        description: editingProduct.description || '',
        prepTimeMin: editingProduct.prepTimeMin || 15,
        trackInventory: editingProduct.trackInventory ?? false,
        isAvailable: editingProduct.isAvailable,
      });
    } else {
      setForm({
        name: '',
        categoryId: defaultCategoryId !== 'all' ? defaultCategoryId || categories[0]?.id || '' : categories[0]?.id || '',
        price: '',
        taxRate: 0.08,
        printerStation: 'kitchen',
        description: '',
        prepTimeMin: 15,
        trackInventory: false,
        isAvailable: true,
      });
    }
  }, [editingProduct, defaultCategoryId, categories, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Utensils className="w-4 h-4 text-blue-400" />
            <span>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</span>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre del Plato *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej. Hamburguesa Angus"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Categoría *</label>
              <select
                required
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Selecciona categoría</option>
                {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>
          </div>

          <ProductPricingFields
            price={form.price}
            taxRate={form.taxRate}
            onPriceChange={(price) => setForm({ ...form, price })}
            onTaxRateChange={(taxRate) => setForm({ ...form, taxRate })}
          />

          <ProductStationFields
            printerStation={form.printerStation}
            prepTimeMin={form.prepTimeMin}
            onPrinterStationChange={(printerStation) => setForm({ ...form, printerStation })}
            onPrepTimeMinChange={(prepTimeMin) => setForm({ ...form, prepTimeMin })}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Descripción / Ingredientes</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Ingredientes del plato o notas..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <ProductFlagsFields
            trackInventory={form.trackInventory}
            isAvailable={form.isAvailable}
            onTrackInventoryChange={(trackInventory) => setForm({ ...form, trackInventory })}
            onIsAvailableChange={(isAvailable) => setForm({ ...form, isAvailable })}
          />

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl">Cancelar</button>
            <button type="submit" disabled={submitting} className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow cursor-pointer disabled:opacity-50">
              {submitting ? 'Guardando...' : 'Guardar Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
