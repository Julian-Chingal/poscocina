import React, { useEffect, useState } from 'react';
import {
  Boxes,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle,
  History,
  CookingPot,
  Save,
  Trash2,
} from 'lucide-react';
import { io } from 'socket.io-client';

interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  currentStock: string;
  alertThreshold: string;
  costPerUnit: string;
}

interface Product {
  id: string;
  name: string;
  price: string;
}

interface RecipeIngredient {
  inventoryItemId: string;
  quantity: number;
}

export const InventoryView: React.FC<{ venueId: string }> = ({ venueId }) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'stock' | 'recipes' | 'movements'>('stock');

  // Modals state
  const [showItemModal, setShowItemModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedItemForMovement, setSelectedItemForMovement] = useState<InventoryItem | null>(null);
  const [movementType, setMovementType] = useState<'purchase' | 'waste' | 'adjustment'>('purchase');
  const [movementQty, setMovementQty] = useState('');
  const [movementNotes, setMovementNotes] = useState('');

  // New Item Form
  const [newItemName, setNewItemName] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('g');
  const [newItemStock, setNewItemStock] = useState('1000');
  const [newItemThreshold, setNewItemThreshold] = useState('200');
  const [newItemCost, setNewItemCost] = useState('10');

  // Recipe Editor state
  const [selectedProductForRecipe, setSelectedProductForRecipe] = useState<string>('');
  const [currentRecipe, setCurrentRecipe] = useState<RecipeIngredient[]>([]);
  const [savingRecipe, setSavingRecipe] = useState(false);
  const [recipeSavedSuccess, setRecipeSavedSuccess] = useState(false);

  // Movements log
  const [movements, setMovements] = useState<any[]>([]);

  const fetchItems = async () => {
    if (!venueId) return;
    try {
      const res = await fetch(`/api/venues/${venueId}/inventory/items`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error('Error fetching inventory items:', err);
    }
  };

  const fetchMovements = async () => {
    if (!venueId) return;
    try {
      const res = await fetch(`/api/venues/${venueId}/inventory/movements`);
      if (res.ok) {
        const data = await res.json();
        setMovements(data);
      }
    } catch (err) {
      console.error('Error fetching movements:', err);
    }
  };

  const fetchProducts = async () => {
    if (!venueId) return;
    try {
      const res = await fetch(`/api/venues/${venueId}/catalog`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        if (data.products?.length > 0 && !selectedProductForRecipe) {
          setSelectedProductForRecipe(data.products[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchProducts();
    fetchMovements();

    const socket = io();
    socket.on('inventory:stock_updated', () => {
      fetchItems();
      fetchMovements();
    });

    socket.on('inventory:low_stock', () => {
      fetchItems();
      fetchMovements();
    });

    return () => {
      socket.disconnect();
    };
  }, [venueId]);

  // Load recipe when product changes
  useEffect(() => {
    if (!selectedProductForRecipe) return;
    fetch(`/api/products/${selectedProductForRecipe}/recipe`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setCurrentRecipe(
          data.map((r: any) => ({
            inventoryItemId: r.inventoryItemId,
            quantity: parseFloat(r.quantity),
          }))
        );
      });
  }, [selectedProductForRecipe]);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/venues/${venueId}/inventory/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newItemName,
          unit: newItemUnit,
          currentStock: parseFloat(newItemStock),
          alertThreshold: parseFloat(newItemThreshold),
          costPerUnit: parseFloat(newItemCost),
        }),
      });
      if (res.ok) {
        setShowItemModal(false);
        setNewItemName('');
        fetchItems();
      }
    } catch (err) {
      console.error('Error creating item:', err);
    }
  };

  const handleRegisterMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForMovement) return;

    try {
      const res = await fetch('/api/inventory/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventoryItemId: selectedItemForMovement.id,
          movementType,
          quantity: parseFloat(movementQty),
          notes: movementNotes,
        }),
      });
      if (res.ok) {
        setShowMovementModal(false);
        setMovementQty('');
        setMovementNotes('');
        fetchItems();
        fetchMovements();
      }
    } catch (err) {
      console.error('Error registering movement:', err);
    }
  };

  const handleSaveRecipe = async () => {
    if (!selectedProductForRecipe) return;
    setSavingRecipe(true);
    try {
      const res = await fetch(`/api/products/${selectedProductForRecipe}/recipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: currentRecipe }),
      });
      if (res.ok) {
        setRecipeSavedSuccess(true);
        setTimeout(() => setRecipeSavedSuccess(false), 2500);
      }
    } catch (err) {
      console.error('Error saving recipe:', err);
    } finally {
      setSavingRecipe(false);
    }
  };

  // Inventory stats
  const criticalItems = items.filter(
    (i) => parseFloat(i.currentStock) <= parseFloat(i.alertThreshold)
  );

  return (
    <div className="max-w-7xl mx-auto p-6 sm:p-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-8 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">
            <Boxes className="w-3.5 h-3.5" />
            <span>Fase 2: Cadena de Suministro & Cocina</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Inventario & Escandallo de Recetas
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Descuento automático de insumos en tiempo real por cada orden pagada.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowItemModal(true)}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-purple-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Insumo</span>
          </button>
        </div>
      </div>

      {/* Critical Stock Alert Banner */}
      {criticalItems.length > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-3 text-rose-300">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-rose-200 text-sm">
              ¡Alerta de Inventario Crítico ({criticalItems.length} insumo{criticalItems.length > 1 ? 's' : ''})!
            </h4>
            <p className="text-slate-300 mt-0.5">
              Los siguientes insumos han caído por debajo de su umbral mínimo de seguridad y requieren reabastecimiento urgente:
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {criticalItems.map((item) => (
                <span
                  key={item.id}
                  className="px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-200 font-mono text-[11px]"
                >
                  {item.name}: {parseFloat(item.currentStock).toLocaleString()} {item.unit} (Mín: {parseFloat(item.alertThreshold).toLocaleString()})
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">Total Insumos Controlados</span>
          <div className="text-3xl font-black text-white mt-1">{items.length}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Insumos activos en cocina y bar</span>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">Insumos en Alerta Crítica</span>
          <div className="text-3xl font-black text-rose-400 mt-1">{criticalItems.length}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {criticalItems.length > 0 ? 'Requieren compra inmediata' : 'Stock en niveles óptimos'}
          </span>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">Descuento Automático</span>
          <div className="text-3xl font-black text-emerald-400 mt-1">Activo</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Integrado al cobro de órdenes</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-3 border-b border-slate-800 pb-3 mb-6">
        <button
          onClick={() => setActiveTab('stock')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'stock'
              ? 'bg-purple-600 text-white shadow'
              : 'bg-slate-800/60 text-slate-400 hover:text-white'
          }`}
        >
          Stock de Insumos ({items.length})
        </button>

        <button
          onClick={() => setActiveTab('recipes')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'recipes'
              ? 'bg-purple-600 text-white shadow'
              : 'bg-slate-800/60 text-slate-400 hover:text-white'
          }`}
        >
          <CookingPot className="w-4 h-4" />
          <span>Editor de Recetas (Escandallos)</span>
        </button>

        <button
          onClick={() => setActiveTab('movements')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'movements'
              ? 'bg-purple-600 text-white shadow'
              : 'bg-slate-800/60 text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Historial de Movimientos ({movements.length})</span>
        </button>
      </div>

      {/* TAB 1: Stock Items Table */}
      {activeTab === 'stock' && (
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-4">Insumo</th>
                <th className="p-4">Unidad</th>
                <th className="p-4">Stock Actual</th>
                <th className="p-4">Umbral Mínimo</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {items.map((item) => {
                const stock = parseFloat(item.currentStock);
                const threshold = parseFloat(item.alertThreshold);
                const isLow = stock <= threshold;

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white text-sm">{item.name}</td>
                    <td className="p-4 font-mono text-slate-400 uppercase">{item.unit}</td>
                    <td className="p-4 font-mono font-bold text-slate-200">
                      {stock.toLocaleString()} {item.unit}
                    </td>
                    <td className="p-4 font-mono text-slate-400">
                      {threshold.toLocaleString()} {item.unit}
                    </td>
                    <td className="p-4">
                      {isLow ? (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-rose-400 bg-rose-950/60 border border-rose-800/40 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Stock Bajo</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          <span>Óptimo</span>
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedItemForMovement(item);
                          setShowMovementModal(true);
                        }}
                        className="bg-slate-700 hover:bg-slate-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer"
                      >
                        Ajustar / Comprar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: Recipe (Escandallo) Editor */}
      {activeTab === 'recipes' && (
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 shadow-sm">
          <div className="max-w-2xl space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Selecciona el Plato de la Carta:
              </label>
              <select
                value={selectedProductForRecipe}
                onChange={(e) => setSelectedProductForRecipe(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (${parseFloat(p.price).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Ingredients list for this product */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Insumos consumidos por porción vendida:
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    if (items.length > 0) {
                      setCurrentRecipe([...currentRecipe, { inventoryItemId: items[0].id, quantity: 1 }]);
                    }
                  }}
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Ingrediente</span>
                </button>
              </div>

              <div className="space-y-3">
                {currentRecipe.length === 0 ? (
                  <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl text-center text-slate-400 text-xs">
                    Este plato aún no tiene insumos configurados en su receta.
                  </div>
                ) : (
                  currentRecipe.map((rec, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 bg-slate-900 rounded-xl border border-slate-800"
                    >
                      <select
                        value={rec.inventoryItemId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCurrentRecipe((prev) =>
                            prev.map((r, i) => (i === index ? { ...r, inventoryItemId: val } : r))
                          );
                        }}
                        className="flex-1 bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-3 py-2"
                      >
                        {items.map((it) => (
                          <option key={it.id} value={it.id}>
                            {it.name} (en {it.unit})
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          step="any"
                          value={rec.quantity}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setCurrentRecipe((prev) =>
                              prev.map((r, i) => (i === index ? { ...r, quantity: val } : r))
                            );
                          }}
                          className="w-24 bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-3 py-2 font-mono text-right"
                        />
                        <span className="text-xs text-slate-400 font-mono w-10">
                          {items.find((it) => it.id === rec.inventoryItemId)?.unit || ''}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setCurrentRecipe(currentRecipe.filter((_, i) => i !== index))}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={handleSaveRecipe}
              disabled={savingRecipe}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                recipeSavedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20'
              }`}
            >
              {recipeSavedSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>¡Receta guardada!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{savingRecipe ? 'Guardando...' : 'Guardar Receta del Plato'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: Movements Log */}
      {activeTab === 'movements' && (
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-4">Fecha & Hora</th>
                <th className="p-4">Insumo</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Cantidad</th>
                <th className="p-4">Motivo / Orden</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No se han registrado movimientos de inventario todavía.
                  </td>
                </tr>
              ) : (
                movements.map((mov) => {
                  const isPositive = parseFloat(mov.quantity) > 0;
                  return (
                    <tr key={mov.id} className="hover:bg-slate-800/40">
                      <td className="p-4 font-mono text-slate-400">
                        {new Date(mov.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4 font-bold text-white">{mov.itemName}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            mov.movementType === 'purchase'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : mov.movementType === 'sale'
                              ? 'bg-blue-950 text-blue-400 border border-blue-800'
                              : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}
                        >
                          {mov.movementType === 'purchase'
                            ? 'Compra'
                            : mov.movementType === 'sale'
                            ? 'Venta (Auto)'
                            : 'Merma'}
                        </span>
                      </td>
                      <td
                        className={`p-4 font-mono font-bold ${
                          isPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {parseFloat(mov.quantity).toLocaleString()} {mov.itemUnit}
                      </td>
                      <td className="p-4 text-slate-400">{mov.notes || '—'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: New Insumo */}
      {showItemModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Crear Nuevo Insumo</h3>
            <form onSubmit={handleCreateItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre del Insumo:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Salsa BBQ especial"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Unidad de Medida:
                  </label>
                  <select
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  >
                    <option value="g">Gramos (g)</option>
                    <option value="ml">Mililitros (ml)</option>
                    <option value="unit">Unidades (unit)</option>
                    <option value="kg">Kilogramos (kg)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Stock Inicial:
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newItemStock}
                    onChange={(e) => setNewItemStock(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Umbral de Alerta de Stock:
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newItemThreshold}
                    onChange={(e) => setNewItemThreshold(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Costo por Unidad ($):
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newItemCost}
                    onChange={(e) => setNewItemCost(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors"
                >
                  Crear Insumo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Register Movement (Compra/Merma) */}
      {showMovementModal && selectedItemForMovement && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">
              Movimiento: {selectedItemForMovement.name}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Stock actual: {parseFloat(selectedItemForMovement.currentStock).toLocaleString()}{' '}
              {selectedItemForMovement.unit}
            </p>

            <form onSubmit={handleRegisterMovement} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tipo de Movimiento:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMovementType('purchase')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center space-x-1.5 ${
                      movementType === 'purchase'
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <ArrowDownRight className="w-3.5 h-3.5" />
                    <span>Entrada / Compra</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMovementType('waste')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center space-x-1.5 ${
                      movementType === 'waste'
                        ? 'bg-rose-600 border-rose-500 text-white shadow'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Merma / Desperdicio</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Cantidad ({selectedItemForMovement.unit}):
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0"
                  value={movementQty}
                  onChange={(e) => setMovementQty(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Motivo / Observación:
                </label>
                <input
                  type="text"
                  placeholder="Ej. Factura proveedor #9921 o producto vencido"
                  value={movementNotes}
                  onChange={(e) => setMovementNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowMovementModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors"
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
