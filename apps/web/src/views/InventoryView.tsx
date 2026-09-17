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
  Receipt,
  Truck,
  Search,
  Building2,
  Clock,
  Eye,
} from 'lucide-react';
import { io } from 'socket.io-client';
import { toast } from '../components/ui/sonner';

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

interface Supplier {
  id: string;
  venueId: string;
  name: string;
  documentType: string;
  documentNumber: string;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  createdAt?: string;
}

interface PurchaseItemDetail {
  id: string;
  purchaseId: string;
  inventoryItemId: string;
  quantity: string;
  unitCost: string;
  totalCost: string;
  inventoryItem?: InventoryItem;
}

interface Purchase {
  id: string;
  venueId: string;
  supplierId: string;
  invoiceNumber: string;
  purchaseDate: string;
  totalAmount: string;
  status: 'draft' | 'received' | 'cancelled';
  notes?: string | null;
  createdAt: string;
  supplier?: Supplier;
  items?: PurchaseItemDetail[];
}

export const InventoryView: React.FC<{ venueId: string }> = ({ venueId }) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'stock' | 'purchases' | 'suppliers' | 'recipes' | 'movements'>('stock');

  // Purchases & Suppliers state
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchSupplier, setSearchSupplier] = useState('');
  const [selectedPurchaseDetail, setSelectedPurchaseDetail] = useState<Purchase | null>(null);

  // Modals state
  const [showItemModal, setShowItemModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const [selectedItemForMovement, setSelectedItemForMovement] = useState<InventoryItem | null>(null);
  const [movementType, setMovementType] = useState<'purchase' | 'waste' | 'adjustment'>('purchase');
  const [movementQty, setMovementQty] = useState('');
  const [movementNotes, setMovementNotes] = useState('');

  // New Item Form
  const [newItemName, setNewItemName] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('kg');
  const [newItemStock, setNewItemStock] = useState('10');
  const [newItemThreshold, setNewItemThreshold] = useState('2');
  const [newItemCost, setNewItemCost] = useState('5000');

  // New Supplier Form
  const [supplierName, setSupplierName] = useState('');
  const [supplierDocType, setSupplierDocType] = useState<'NIT' | 'RUT' | 'CC' | 'CE' | 'Passport'>('NIT');
  const [supplierDocNum, setSupplierDocNum] = useState('');
  const [supplierContact, setSupplierContact] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [supplierEmail, setSupplierEmail] = useState('');
  const [supplierAddress, setSupplierAddress] = useState('');
  const [supplierNotes, setSupplierNotes] = useState('');

  // New Purchase Form
  const [purchaseSupplierId, setPurchaseSupplierId] = useState('');
  const [purchaseInvoiceNumber, setPurchaseInvoiceNumber] = useState('');
  const [purchaseStatus, setPurchaseStatus] = useState<'received' | 'draft'>('received');
  const [purchaseNotes, setPurchaseNotes] = useState('');
  const [purchaseLines, setPurchaseLines] = useState<Array<{ inventoryItemId: string; quantity: string; unitCost: string }>>([
    { inventoryItemId: '', quantity: '1', unitCost: '0' },
  ]);

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

  const fetchSuppliers = async (query = '') => {
    if (!venueId) return;
    try {
      const url = query
        ? `/api/venues/${venueId}/purchases/suppliers?q=${encodeURIComponent(query)}`
        : `/api/venues/${venueId}/purchases/suppliers`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSuppliers(data);
      }
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    }
  };

  const fetchPurchases = async () => {
    if (!venueId) return;
    try {
      const res = await fetch(`/api/venues/${venueId}/purchases`);
      if (res.ok) {
        const data = await res.json();
        setPurchases(data);
      }
    } catch (err) {
      console.error('Error fetching purchases:', err);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchMovements();
    fetchProducts();
    fetchSuppliers();
    fetchPurchases();

    const socket = io();
    socket.on('stock:alert', () => {
      fetchItems();
    });
    socket.on('order:status_changed', () => {
      fetchItems();
      fetchMovements();
    });

    return () => {
      socket.disconnect();
    };
  }, [venueId]);

  // Load recipe when selectedProductForRecipe changes
  useEffect(() => {
    if (!selectedProductForRecipe || !venueId) return;
    const fetchRecipe = async () => {
      try {
        const res = await fetch(`/api/venues/${venueId}/inventory/recipes/${selectedProductForRecipe}`);
        if (res.ok) {
          const data = await res.json();
          setCurrentRecipe(
            data.map((r: any) => ({
              inventoryItemId: r.inventoryItemId,
              quantity: parseFloat(r.quantity),
            }))
          );
        } else {
          setCurrentRecipe([]);
        }
      } catch (err) {
        console.error('Error fetching recipe:', err);
      }
    };
    fetchRecipe();
  }, [selectedProductForRecipe, venueId]);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/venues/${venueId}/inventory/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newItemName,
          unit: newItemUnit,
          currentStock: parseFloat(newItemStock) || 0,
          alertThreshold: parseFloat(newItemThreshold) || 0,
          costPerUnit: parseFloat(newItemCost) || 0,
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

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/venues/${venueId}/purchases/suppliers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venueId,
          name: supplierName,
          documentType: supplierDocType,
          documentNumber: supplierDocNum,
          contactName: supplierContact || undefined,
          phone: supplierPhone || undefined,
          email: supplierEmail || undefined,
          address: supplierAddress || undefined,
          notes: supplierNotes || undefined,
        }),
      });

      if (res.ok) {
        setShowSupplierModal(false);
        setSupplierName('');
        setSupplierDocNum('');
        setSupplierContact('');
        setSupplierPhone('');
        setSupplierEmail('');
        setSupplierAddress('');
        setSupplierNotes('');
        fetchSuppliers();
        toast.success('Proveedor registrado correctamente');
      } else {
        const err = await res.json();
        toast.error(err.message || 'Error al registrar proveedor');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error de conexión al registrar proveedor');
    }
  };

  const handleCreatePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseSupplierId) {
      toast.warning('Por favor selecciona un proveedor');
      return;
    }
    const validLines = purchaseLines.filter((l) => l.inventoryItemId && parseFloat(l.quantity) > 0);
    if (validLines.length === 0) {
      toast.warning('Debes agregar al menos un insumo con cantidad válida');
      return;
    }

    try {
      const res = await fetch(`/api/venues/${venueId}/purchases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venueId,
          supplierId: purchaseSupplierId,
          invoiceNumber: purchaseInvoiceNumber,
          status: purchaseStatus,
          notes: purchaseNotes || undefined,
          items: validLines.map((l) => ({
            inventoryItemId: l.inventoryItemId,
            quantity: parseFloat(l.quantity),
            unitCost: parseFloat(l.unitCost) || 0,
          })),
        }),
      });

      if (res.ok) {
        setShowPurchaseModal(false);
        setPurchaseInvoiceNumber('');
        setPurchaseNotes('');
        setPurchaseLines([{ inventoryItemId: '', quantity: '1', unitCost: '0' }]);
        fetchPurchases();
        fetchItems();
        fetchMovements();
        toast.success('Orden de compra registrada');
      } else {
        const err = await res.json();
        toast.error(err.message || 'Error al crear compra');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al crear compra');
    }
  };

  const handleReceivePurchase = async (purchaseId: string) => {
    if (!window.confirm('¿Confirmas la recepción física de esta factura? Se ingresará el stock al inventario y se recalculará el Costo Promedio Ponderado (CPP).')) {
      return;
    }

    try {
      const res = await fetch(`/api/venues/${venueId}/purchases/${purchaseId}/receive`, {
        method: 'POST',
      });
      if (res.ok) {
        fetchPurchases();
        fetchItems();
        fetchMovements();
        toast.success('Compra recibida y stock actualizado');
      } else {
        const err = await res.json();
        toast.error(err.message || 'Error al recibir compra');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al recibir compra');
    }
  };

  const handleRegisterMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForMovement) return;

    try {
      const res = await fetch(`/api/venues/${venueId}/inventory/movements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventoryItemId: selectedItemForMovement.id,
          movementType,
          quantity: parseFloat(movementQty) || 0,
          notes: movementNotes,
        }),
      });

      if (res.ok) {
        setShowMovementModal(false);
        setMovementQty('');
        setMovementNotes('');
        setSelectedItemForMovement(null);
        fetchItems();
        fetchMovements();
      }
    } catch (err) {
      console.error('Error registering movement:', err);
    }
  };

  const handleAddIngredient = () => {
    if (!items.length) return;
    setCurrentRecipe([...currentRecipe, { inventoryItemId: items[0].id, quantity: 10 }]);
  };

  const handleRemoveIngredient = (index: number) => {
    setCurrentRecipe(currentRecipe.filter((_, i) => i !== index));
  };

  const handleUpdateIngredient = (index: number, field: 'inventoryItemId' | 'quantity', value: any) => {
    const updated = [...currentRecipe];
    updated[index] = {
      ...updated[index],
      [field]: field === 'quantity' ? parseFloat(value) || 0 : value,
    };
    setCurrentRecipe(updated);
  };

  const handleSaveRecipe = async () => {
    if (!selectedProductForRecipe || !venueId) return;
    setSavingRecipe(true);
    try {
      const res = await fetch(`/api/venues/${venueId}/inventory/recipes/${selectedProductForRecipe}`, {
        method: 'PUT',
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
            <span>Fase 7: Compras, Proveedores & Costo Promedio Ponderado (CPP)</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Gestión de Compras, Proveedores & Stock
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Control integral de insumos, facturas de compra con recálculo de CPP y directorio de proveedores.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {activeTab === 'stock' && (
            <button
              onClick={() => setShowItemModal(true)}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-purple-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Insumo</span>
            </button>
          )}

          {activeTab === 'purchases' && (
            <button
              onClick={() => setShowPurchaseModal(true)}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Factura de Compra</span>
            </button>
          )}

          {activeTab === 'suppliers' && (
            <button
              onClick={() => setShowSupplierModal(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-blue-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Proveedor</span>
            </button>
          )}
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
              Los siguientes insumos están por debajo de su umbral mínimo. Registra una factura de compra para reabastecerlos:
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
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-8">
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">Total Insumos</span>
          <div className="text-3xl font-black text-white mt-1">{items.length}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Insumos activos</span>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">Facturas Registradas</span>
          <div className="text-3xl font-black text-emerald-400 mt-1">{purchases.length}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {purchases.filter((p) => p.status === 'received').length} recibidas en bodega
          </span>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">Proveedores Activos</span>
          <div className="text-3xl font-black text-blue-400 mt-1">{suppliers.length}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Directorio comercial</span>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">Stock Crítico</span>
          <div className="text-3xl font-black text-rose-400 mt-1">{criticalItems.length}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {criticalItems.length > 0 ? 'Requieren compra inmediata' : 'Nivel óptimo'}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('stock')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'stock'
              ? 'bg-purple-600 text-white shadow'
              : 'bg-slate-800/60 text-slate-400 hover:text-white'
          }`}
        >
          Stock & CPP ({items.length})
        </button>

        <button
          onClick={() => setActiveTab('purchases')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'purchases'
              ? 'bg-emerald-600 text-white shadow'
              : 'bg-slate-800/60 text-slate-400 hover:text-white'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Facturas de Compra ({purchases.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'suppliers'
              ? 'bg-blue-600 text-white shadow'
              : 'bg-slate-800/60 text-slate-400 hover:text-white'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Proveedores ({suppliers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('recipes')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'recipes'
              ? 'bg-purple-600 text-white shadow'
              : 'bg-slate-800/60 text-slate-400 hover:text-white'
          }`}
        >
          <CookingPot className="w-4 h-4" />
          <span>Escandallo de Recetas</span>
        </button>

        <button
          onClick={() => setActiveTab('movements')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'movements'
              ? 'bg-purple-600 text-white shadow'
              : 'bg-slate-800/60 text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Historial ({movements.length})</span>
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
                <th className="p-4">Costo Unitario (CPP)</th>
                <th className="p-4">Umbral Mínimo</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {items.map((item) => {
                const stock = parseFloat(item.currentStock);
                const threshold = parseFloat(item.alertThreshold);
                const cost = parseFloat(item.costPerUnit || '0');
                const isLow = stock <= threshold;

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white text-sm">{item.name}</td>
                    <td className="p-4 font-mono text-slate-400 uppercase">{item.unit}</td>
                    <td className="p-4 font-mono font-bold text-slate-200">
                      {stock.toLocaleString()} {item.unit}
                    </td>
                    <td className="p-4 font-mono text-emerald-400 font-semibold">
                      ${cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / {item.unit}
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
                        className="bg-slate-700/60 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                      >
                        Ajuste Rápido
                      </button>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No hay insumos registrados aún. Haz clic en "Nuevo Insumo" para comenzar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: Facturas de Compra */}
      {activeTab === 'purchases' && (
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-4">Factura / Remisión</th>
                <th className="p-4">Proveedor</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">Total Factura</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {purchases.map((purchase) => {
                const total = parseFloat(purchase.totalAmount || '0');
                return (
                  <tr key={purchase.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white text-sm flex items-center space-x-2">
                      <Receipt className="w-4 h-4 text-emerald-400" />
                      <span>{purchase.invoiceNumber}</span>
                    </td>
                    <td className="p-4 text-slate-200">
                      <div className="font-medium">{purchase.supplier?.name || 'Proveedor no disponible'}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {purchase.supplier?.documentType}: {purchase.supplier?.documentNumber}
                      </div>
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(purchase.purchaseDate || purchase.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-400 text-sm">
                      ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-4">
                      {purchase.status === 'received' ? (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          <span>Recibida (Stock Actualizado)</span>
                        </span>
                      ) : purchase.status === 'draft' ? (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2.5 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" />
                          <span>Borrador (Pendiente)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-rose-400 bg-rose-950/60 border border-rose-800/40 px-2.5 py-0.5 rounded-full">
                          <span>Cancelada</span>
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedPurchaseDetail(purchase)}
                        className="bg-slate-700/60 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer inline-flex items-center space-x-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Ver Líneas</span>
                      </button>

                      {purchase.status === 'draft' && (
                        <button
                          onClick={() => handleReceivePurchase(purchase.id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer inline-flex items-center space-x-1 shadow-md shadow-emerald-600/20"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Recibir Stock</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {purchases.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No se han registrado facturas de compra aún. Haz clic en "Nueva Factura de Compra".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: Proveedores */}
      {activeTab === 'suppliers' && (
        <div>
          <div className="mb-4 flex items-center space-x-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar proveedor por nombre, NIT o contacto..."
                value={searchSupplier}
                onChange={(e) => {
                  setSearchSupplier(e.target.value);
                  fetchSuppliers(e.target.value);
                }}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-4">Razón Social / Proveedor</th>
                  <th className="p-4">Documento / NIT</th>
                  <th className="p-4">Contacto Directo</th>
                  <th className="p-4">Teléfono & Correo</th>
                  <th className="p-4">Dirección</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {suppliers.map((sup) => (
                  <tr key={sup.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white text-sm flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-blue-400" />
                      <span>{sup.name}</span>
                    </td>
                    <td className="p-4 font-mono font-medium text-slate-200">
                      <span className="text-slate-500 text-[10px] mr-1">{sup.documentType}</span>
                      <span>{sup.documentNumber}</span>
                    </td>
                    <td className="p-4 text-slate-300">{sup.contactName || '-'}</td>
                    <td className="p-4 text-slate-300">
                      <div>{sup.phone || '-'}</div>
                      <div className="text-[11px] text-slate-500">{sup.email || ''}</div>
                    </td>
                    <td className="p-4 text-slate-400 text-xs">{sup.address || '-'}</td>
                  </tr>
                ))}
                {suppliers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No se encontraron proveedores registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Recipes Editor */}
      {activeTab === 'recipes' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Products List */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-white mb-3">Platos & Bebidas</h3>
            <p className="text-xs text-slate-400 mb-4">
              Selecciona un producto para configurar los insumos que descuenta al venderse.
            </p>
            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
              {products.map((prod) => (
                <button
                  key={prod.id}
                  onClick={() => setSelectedProductForRecipe(prod.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                    selectedProductForRecipe === prod.id
                      ? 'bg-purple-600 text-white shadow'
                      : 'bg-slate-800/40 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">{prod.name}</span>
                  <span className="font-mono text-[11px] opacity-75">
                    ${parseFloat(prod.price).toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Recipe Details Editor */}
          <div className="md:col-span-2 bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Ingredientes de la Receta (Escandallo)
                </h3>
                <span className="text-xs text-slate-400">
                  {products.find((p) => p.id === selectedProductForRecipe)?.name || 'Selecciona un producto'}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleAddIngredient}
                  disabled={!selectedProductForRecipe || items.length === 0}
                  className="flex items-center space-x-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Insumo</span>
                </button>

                <button
                  onClick={handleSaveRecipe}
                  disabled={savingRecipe || !selectedProductForRecipe}
                  className="flex items-center space-x-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-purple-600/20"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingRecipe ? 'Guardando...' : 'Guardar Receta'}</span>
                </button>
              </div>
            </div>

            {recipeSavedSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>¡Receta guardada exitosamente! Se descontará en cada orden.</span>
              </div>
            )}

            <div className="space-y-3">
              {currentRecipe.map((ingredient, idx) => {
                const selectedItem = items.find((i) => i.id === ingredient.inventoryItemId);
                return (
                  <div
                    key={idx}
                    className="flex items-center space-x-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl"
                  >
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Insumo
                      </label>
                      <select
                        value={ingredient.inventoryItemId}
                        onChange={(e) => handleUpdateIngredient(idx, 'inventoryItemId', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                      >
                        {items.map((it) => (
                          <option key={it.id} value={it.id}>
                            {it.name} ({it.unit})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-32">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Cantidad ({selectedItem?.unit || 'ud'})
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={ingredient.quantity}
                        onChange={(e) => handleUpdateIngredient(idx, 'quantity', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none"
                      />
                    </div>

                    <div className="pt-5">
                      <button
                        onClick={() => handleRemoveIngredient(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1.5 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {currentRecipe.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                  Este producto no tiene ingredientes configurados en su receta.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Movements Log */}
      {activeTab === 'movements' && (
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-4">Fecha y Hora</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Insumo</th>
                <th className="p-4">Cantidad</th>
                <th className="p-4">Detalle / Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {movements.map((m) => (
                <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-mono text-slate-400">
                    {new Date(m.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4">
                    {m.movementType === 'sale' ? (
                      <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-rose-400 bg-rose-950/60 border border-rose-800/40 px-2 py-0.5 rounded-full">
                        <ArrowUpRight className="w-3 h-3" />
                        <span>Venta (Automático)</span>
                      </span>
                    ) : m.movementType === 'purchase' ? (
                      <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                        <ArrowDownRight className="w-3 h-3" />
                        <span>Compra / Recepción</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded-full">
                        <span>Ajuste / Merma</span>
                      </span>
                    )}
                  </td>
                  <td className="p-4 font-bold text-white">{m.inventoryItem?.name || m.inventoryItemId}</td>
                  <td className="p-4 font-mono font-bold text-slate-200">
                    {m.movementType === 'sale' ? '-' : '+'}
                    {parseFloat(m.quantity).toLocaleString()} {m.inventoryItem?.unit || ''}
                  </td>
                  <td className="p-4 text-slate-400 font-mono text-xs">{m.notes || '-'}</td>
                </tr>
              ))}
              {movements.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No se han registrado movimientos de inventario todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL 1: Nuevo Insumo */}
      {showItemModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-base font-bold text-white">Nuevo Insumo de Inventario</h3>
              <button
                onClick={() => setShowItemModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre del Insumo:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Carne de Res, Queso Mozzarella"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
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
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="kg">kg (Kilogramos)</option>
                    <option value="g">g (Gramos)</option>
                    <option value="l">l (Litros)</option>
                    <option value="ml">ml (Mililitros)</option>
                    <option value="und">und (Unidades)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Stock Inicial:
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newItemStock}
                    onChange={(e) => setNewItemStock(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Costo Unitario Inicial ($):
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newItemCost}
                    onChange={(e) => setNewItemCost(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Umbral de Alerta:
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newItemThreshold}
                    onChange={(e) => setNewItemThreshold(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Crear Insumo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Nuevo Proveedor */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Truck className="w-5 h-5 text-blue-400" />
                <span>Registrar Nuevo Proveedor</span>
              </h3>
              <button
                onClick={() => setShowSupplierModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre o Razón Social: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Distribuidora de Carnes La Sabana S.A.S"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tipo Doc: *
                  </label>
                  <select
                    value={supplierDocType}
                    onChange={(e: any) => setSupplierDocType(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="NIT">NIT</option>
                    <option value="RUT">RUT</option>
                    <option value="CC">Cédula (CC)</option>
                    <option value="CE">Cédula Extranjería (CE)</option>
                    <option value="Passport">Pasaporte</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Número de Documento / NIT: *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="901234567-1"
                    value={supplierDocNum}
                    onChange={(e) => setSupplierDocNum(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Contacto Comercial:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Carlos Mendoza"
                    value={supplierContact}
                    onChange={(e) => setSupplierContact(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Teléfono / WhatsApp:
                  </label>
                  <input
                    type="text"
                    placeholder="3101234567"
                    value={supplierPhone}
                    onChange={(e) => setSupplierPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Correo Electrónico:
                  </label>
                  <input
                    type="email"
                    placeholder="facturacion@proveedor.com"
                    value={supplierEmail}
                    onChange={(e) => setSupplierEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Dirección Física:
                  </label>
                  <input
                    type="text"
                    placeholder="Calle 100 # 15-20"
                    value={supplierAddress}
                    onChange={(e) => setSupplierAddress(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notas de Despacho / Condiciones:
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej. Días de entrega martes y jueves, crédito a 15 días"
                  value={supplierNotes}
                  onChange={(e) => setSupplierNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSupplierModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Guardar Proveedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Nueva Factura de Compra */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <span>Registrar Factura de Compra de Insumos</span>
              </h3>
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePurchase} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Proveedor: *
                  </label>
                  <select
                    required
                    value={purchaseSupplierId}
                    onChange={(e) => setPurchaseSupplierId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="">-- Seleccionar Proveedor --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.documentNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Número Factura / Remisión: *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="FAC-99214"
                    value={purchaseInvoiceNumber}
                    onChange={(e) => setPurchaseInvoiceNumber(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Acción de Recepción:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPurchaseStatus('received')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center space-x-1.5 ${
                      purchaseStatus === 'received'
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Recibir Ahora (Actualiza Stock & CPP)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPurchaseStatus('draft')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center space-x-1.5 ${
                      purchaseStatus === 'draft'
                        ? 'bg-amber-600 border-amber-500 text-white shadow'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Guardar Borrador (Pendiente)</span>
                  </button>
                </div>
              </div>

              {/* Items Lines */}
              <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/40">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Insumos Comprados (Líneas de Detalle)
                  </h4>
                  <button
                    type="button"
                    onClick={() =>
                      setPurchaseLines([
                        ...purchaseLines,
                        { inventoryItemId: items[0]?.id || '', quantity: '1', unitCost: '0' },
                      ])
                    }
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Fila</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {purchaseLines.map((line, idx) => {
                    const subtotal = (parseFloat(line.quantity) || 0) * (parseFloat(line.unitCost) || 0);
                    return (
                      <div key={idx} className="flex items-center space-x-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-xs">
                        <div className="flex-1">
                          <select
                            value={line.inventoryItemId}
                            onChange={(e) => {
                              const updated = [...purchaseLines];
                              updated[idx].inventoryItemId = e.target.value;
                              setPurchaseLines(updated);
                            }}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none"
                          >
                            <option value="">-- Seleccionar Insumo --</option>
                            {items.map((it) => (
                              <option key={it.id} value={it.id}>
                                {it.name} ({it.unit})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="w-24">
                          <input
                            type="number"
                            step="any"
                            placeholder="Cantidad"
                            value={line.quantity}
                            onChange={(e) => {
                              const updated = [...purchaseLines];
                              updated[idx].quantity = e.target.value;
                              setPurchaseLines(updated);
                            }}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-mono"
                          />
                        </div>

                        <div className="w-28">
                          <input
                            type="number"
                            step="any"
                            placeholder="Costo Unit"
                            value={line.unitCost}
                            onChange={(e) => {
                              const updated = [...purchaseLines];
                              updated[idx].unitCost = e.target.value;
                              setPurchaseLines(updated);
                            }}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-mono"
                          />
                        </div>

                        <div className="w-28 text-right font-mono font-bold text-emerald-400">
                          ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>

                        {purchaseLines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setPurchaseLines(purchaseLines.filter((_, i) => i !== idx))}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-800">
                  <span className="text-xs font-semibold text-slate-400">Total Factura:</span>
                  <span className="text-lg font-mono font-black text-emerald-400">
                    ${purchaseLines
                      .reduce((sum, l) => sum + (parseFloat(l.quantity) || 0) * (parseFloat(l.unitCost) || 0), 0)
                      .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Observaciones / Notas de Entrega:
                </label>
                <input
                  type="text"
                  placeholder="Ej. Entregado por camión refrigerado placas XYZ-123"
                  value={purchaseNotes}
                  onChange={(e) => setPurchaseNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPurchaseModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-lg shadow-emerald-600/20"
                >
                  Guardar Factura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Detalle de Factura de Compra */}
      {selectedPurchaseDetail && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Receipt className="w-5 h-5 text-emerald-400" />
                  <span>Factura #{selectedPurchaseDetail.invoiceNumber}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Proveedor: {selectedPurchaseDetail.supplier?.name} (NIT: {selectedPurchaseDetail.supplier?.documentNumber})
                </p>
              </div>
              <button
                onClick={() => setSelectedPurchaseDetail(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 mb-5 max-h-64 overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Insumo</th>
                    <th className="p-3">Cantidad</th>
                    <th className="p-3">Costo Unitario</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {selectedPurchaseDetail.items?.map((it) => (
                    <tr key={it.id}>
                      <td className="p-3 font-semibold text-white">
                        {it.inventoryItem?.name || 'Insumo'}
                      </td>
                      <td className="p-3 font-mono">
                        {parseFloat(it.quantity).toLocaleString()} {it.inventoryItem?.unit}
                      </td>
                      <td className="p-3 font-mono">
                        ${parseFloat(it.unitCost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-400 text-right">
                        ${parseFloat(it.totalCost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
              <div>
                <span className="text-slate-400">Estado: </span>
                <span className="font-bold text-white uppercase">{selectedPurchaseDetail.status}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 mr-2">Total Compra:</span>
                <span className="font-mono font-black text-emerald-400 text-sm">
                  ${parseFloat(selectedPurchaseDetail.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex justify-end mt-5">
              <button
                onClick={() => setSelectedPurchaseDetail(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Ajuste Manual de Inventario */}
      {showMovementModal && selectedItemForMovement && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div>
                <h3 className="text-base font-bold text-white">Ajuste de Stock</h3>
                <p className="text-xs text-purple-400 font-semibold mt-0.5">
                  {selectedItemForMovement.name} (Actual: {parseFloat(selectedItemForMovement.currentStock).toLocaleString()} {selectedItemForMovement.unit})
                </p>
              </div>
              <button
                onClick={() => setShowMovementModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterMovement} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tipo de Operación:
                </label>
                <div className="grid grid-cols-2 gap-3">
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
                    <span>Entrada / Ajuste +</span>
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
                    <span>Merma / Desperdicio -</span>
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
                  placeholder="Ej. Corrección de pesaje o insumo vencido"
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
