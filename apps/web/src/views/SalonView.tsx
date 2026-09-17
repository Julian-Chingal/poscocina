import React, { useEffect, useState } from 'react';
import {
  Users,
  Clock,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  Settings2,
  X,
  Square,
  Circle as CircleIcon,
  RectangleHorizontal,
  Layers,
  AlertTriangle,
  ArrowRightLeft,
  GitMerge,
} from 'lucide-react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../stores/auth.store';
import { api } from '../services/api';
import { toast } from '../components/ui/sonner';
import { TableStatusBadge } from '../components/ui/status-badge';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../components/ui/dialog';

interface FloorPlanItem {
  id: string;
  name: string;
}

interface TableItem {
  id: string;
  floorPlanId?: string;
  label: string;
  capacity: number;
  positionX?: string | number;
  positionY?: string | number;
  shape?: 'rect' | 'circle' | 'square';
  status: 'free' | 'occupied' | 'check_requested' | 'reserved' | 'blocked';
  currentOrderId?: string | null;
}

interface SalonViewProps {
  venueId: string;
  onSelectTable: (table: TableItem) => void;
}

export const SalonView: React.FC<SalonViewProps> = ({ venueId, onSelectTable }) => {
  const { currentUser } = useAuthStore();
  const [floorPlans, setFloorPlans] = useState<FloorPlanItem[]>([]);
  const [activeFloorPlanId, setActiveFloorPlanId] = useState<string>('all');
  const [tables, setTables] = useState<TableItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Mode state (Manager only)
  const [isEditMode, setIsEditMode] = useState(false);

  // Table Modal
  const [showTableModal, setShowTableModal] = useState(false);
  const [editingTable, setEditingTable] = useState<TableItem | null>(null);
  const [tableForm, setTableForm] = useState({
    label: '',
    floorPlanId: '',
    capacity: 4,
    shape: 'rect' as 'rect' | 'circle' | 'square',
    status: 'free' as TableItem['status'],
  });

  // Floor Plan Modal
  const [showFloorPlanModal, setShowFloorPlanModal] = useState(false);
  const [newFloorPlanName, setNewFloorPlanName] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<TableItem | null>(null);

  // Transfer & Merge Modals
  const [transferSourceTable, setTransferSourceTable] = useState<TableItem | null>(null);
  const [transferTargetZone, setTransferTargetZone] = useState<string>('all');
  const [mergeSourceTable, setMergeSourceTable] = useState<TableItem | null>(null);
  const [selectedTargetTableId, setSelectedTargetTableId] = useState<string>('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isManager =
    currentUser?.roleName === 'manager' ||
    currentUser?.roleName === 'super_admin' ||
    (currentUser?.hierarchy && currentUser.hierarchy >= 80);

  const fetchData = async () => {
    if (!venueId) return;
    try {
      setLoading(true);

      const [tablesData, plansData] = await Promise.all([
        api.get(`/venues/${venueId}/tables`),
        api.get(`/venues/${venueId}/floor-plans`),
      ]);

      setTables(tablesData || []);
      setFloorPlans(plansData || []);
    } catch (err) {
      console.error('Error fetching salon data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // WebSockets for real-time table status and catalog updates
    const socket = io();
    const handleUpdate = () => fetchData();

    socket.on('table:created', handleUpdate);
    socket.on('table:updated', (updated: TableItem) => {
      setTables((prev) => prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)));
    });
    socket.on('table:deleted', ({ id }: { id: string }) => {
      setTables((prev) => prev.filter((t) => t.id !== id));
    });
    socket.on('table:status_changed', (payload: { tableId: string; status: TableItem['status'] }) => {
      setTables((prev) =>
        prev.map((t) => (t.id === payload.tableId ? { ...t, status: payload.status } : t))
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [venueId]);

  const openCreateTable = () => {
    setEditingTable(null);
    setTableForm({
      label: `Mesa ${tables.length + 1}`,
      floorPlanId: activeFloorPlanId !== 'all' ? activeFloorPlanId : floorPlans[0]?.id || '',
      capacity: 4,
      shape: 'rect',
      status: 'free',
    });
    setFormError(null);
    setShowTableModal(true);
  };

  const openEditTable = (table: TableItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingTable(table);
    setTableForm({
      label: table.label,
      floorPlanId: table.floorPlanId || floorPlans[0]?.id || '',
      capacity: table.capacity || 4,
      shape: table.shape || 'rect',
      status: table.status,
    });
    setFormError(null);
    setShowTableModal(true);
  };

  const handleSaveTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableForm.label.trim()) {
      setFormError('La etiqueta o número de mesa es obligatoria.');
      return;
    }
    if (!editingTable && !tableForm.floorPlanId) {
      setFormError('Debes seleccionar o tener al menos una zona/plano de salón.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      const payload = editingTable
        ? {
            floorPlanId: tableForm.floorPlanId || undefined,
            label: tableForm.label.trim(),
            capacity: Number(tableForm.capacity),
            shape: tableForm.shape,
            status: tableForm.status,
          }
        : {
            floorPlanId: tableForm.floorPlanId,
            label: tableForm.label.trim(),
            capacity: Number(tableForm.capacity),
            shape: tableForm.shape,
          };

      if (editingTable) {
        await api.patch(`/tables/${editingTable.id}`, payload);
        toast.success('Mesa actualizada correctamente');
      } else {
        await api.post('/tables', payload);
        toast.success('Mesa creada correctamente');
      }

      setShowTableModal(false);
      fetchData();
    } catch (err: any) {
      const msg = err.data?.message || err.message || 'Ocurrió un error al guardar mesa';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateFloorPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFloorPlanName.trim()) return;

    try {
      setSubmitting(true);
      const created = await api.post(`/venues/${venueId}/floor-plans`, {
        name: newFloorPlanName.trim(),
      });

      setFloorPlans((prev) => [...prev, created]);
      setActiveFloorPlanId(created.id);
      setShowFloorPlanModal(false);
      setNewFloorPlanName('');
      toast.success('Zona o salón creado exitosamente');
    } catch (err: any) {
      const msg = err.data?.message || err.message || 'Error al crear zona';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeleteTable = async () => {
    if (!deleteTarget) return;
    try {
      setSubmitting(true);
      await api.delete(`/tables/${deleteTarget.id}`);
      toast.success('Mesa eliminada correctamente');
      setDeleteTarget(null);
      fetchData();
    } catch (err: any) {
      const msg = err.data?.message || err.message || 'No se pudo eliminar mesa';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransferTable = async () => {
    if (!transferSourceTable || !selectedTargetTableId) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const targetTable = tables.find((t) => t.id === selectedTargetTableId);
      const targetPlan = floorPlans.find((p) => p.id === targetTable?.floorPlanId);
      const zoneName = targetPlan?.name || 'otra zona';

      await api.post('/tables/transfer', {
        sourceTableId: transferSourceTable.id,
        targetTableId: selectedTargetTableId,
      });

      toast.success(`Mesa movida con éxito a ${zoneName}`);
      setTransferSourceTable(null);
      setSelectedTargetTableId('');
      fetchData();
    } catch (err: any) {
      const msg = err.data?.message || err.message || 'Error al transferir mesa';
      setActionError(msg);
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMergeTables = async () => {
    if (!mergeSourceTable || !selectedTargetTableId) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await api.post('/tables/merge', {
        sourceTableId: mergeSourceTable.id,
        targetTableId: selectedTargetTableId,
      });

      toast.success('Mesas unidas exitosamente');
      setMergeSourceTable(null);
      setSelectedTargetTableId('');
      fetchData();
    } catch (err: any) {
      const msg = err.data?.message || err.message || 'Error al unir mesas';
      setActionError(msg);
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: TableItem['status']) => {
    switch (status) {
      case 'free':
        return 'bg-emerald-950/40 border-emerald-500/60 text-emerald-400 hover:border-emerald-400';
      case 'occupied':
        return 'bg-amber-950/40 border-amber-500/60 text-amber-400 hover:border-amber-400';
      case 'check_requested':
        return 'bg-purple-950/40 border-purple-500/60 text-purple-400 hover:border-purple-400 animate-pulse';
      case 'reserved':
        return 'bg-blue-950/40 border-blue-500/60 text-blue-400 hover:border-blue-400';
      case 'blocked':
        return 'bg-rose-950/40 border-rose-500/60 text-rose-400 hover:border-rose-400 opacity-60';
      default:
        return 'bg-slate-800 border-slate-700 text-slate-400';
    }
  };

  const filteredTables = tables.filter((t) => {
    if (activeFloorPlanId === 'all') return true;
    return t.floorPlanId === activeFloorPlanId;
  });

  if (loading && tables.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-400 animate-spin text-2xl">⏳</div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b border-slate-800 gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <span>Mapa de Salón y Mesas</span>
            {isEditMode && (
              <span className="text-xs font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full">
                Modo Edición
              </span>
            )}
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">
            {isEditMode
              ? 'Agrega, edita capacidades o elimina mesas de la sala.'
              : 'Supervisa el estado de las mesas en tiempo real y asigna comandas.'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Status Legend */}
          <div className="hidden lg:flex items-center space-x-3 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-300">Libre</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-slate-300">Ocupada</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              <span className="text-slate-300">En Cuenta</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span className="text-slate-300">Reservada</span>
            </div>
          </div>

          {/* Edit Mode Toggle & Add buttons (Manager only) */}
          {isManager && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border transition cursor-pointer ${
                  isEditMode
                    ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-600/20'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>{isEditMode ? 'Finalizar Edición' : 'Editar Salón'}</span>
              </button>

              {isEditMode && (
                <button
                  onClick={openCreateTable}
                  className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow cursor-pointer transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nueva Mesa</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floor Plans / Zones Bar */}
      {floorPlans.length > 0 && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-6">
          <button
            onClick={() => setActiveFloorPlanId('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeFloorPlanId === 'all'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            Todas las zonas ({tables.length})
          </button>

          {floorPlans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setActiveFloorPlanId(plan.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeFloorPlanId === plan.id
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {plan.name} ({tables.filter((t) => t.floorPlanId === plan.id).length})
            </button>
          ))}

          {isEditMode && (
            <button
              onClick={() => setShowFloorPlanModal(true)}
              className="flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Zona</span>
            </button>
          )}
        </div>
      )}

      {/* Tables Grid */}
      {filteredTables.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <AlertCircle className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <p className="text-base font-semibold text-slate-300">No hay mesas configuradas en esta zona.</p>
          {isManager && (
            <button
              onClick={openCreateTable}
              className="mt-4 inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow cursor-pointer transition"
            >
              <Plus className="w-4 h-4" />
              <span>Crear la primera mesa</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredTables.map((table) => {
            const ShapeIcon =
              table.shape === 'circle'
                ? CircleIcon
                : table.shape === 'square'
                ? Square
                : RectangleHorizontal;

            return (
              <div
                key={table.id}
                onClick={() => {
                  if (isEditMode) {
                    openEditTable(table);
                  } else {
                    onSelectTable(table);
                  }
                }}
                className={`relative flex flex-col justify-between p-6 rounded-2xl border-2 transition-all cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-1 ${getStatusColor(
                  table.status
                )} ${isEditMode ? 'ring-2 ring-amber-500/50 hover:border-amber-400' : ''}`}
              >
                {/* Table Header */}
                <div className="flex items-start justify-between w-full">
                  <div className="flex items-center space-x-1.5">
                    <ShapeIcon className="w-4 h-4 opacity-70" />
                    <span className="text-xl font-black tracking-tight text-white">
                      {table.label}
                    </span>
                  </div>

                  {isEditMode ? (
                    <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openEditTable(table)}
                        title="Editar mesa"
                        className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-200 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(table)}
                        title="Eliminar mesa"
                        className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-rose-950 text-rose-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <TableStatusBadge status={table.status} />
                  )}
                </div>

                {/* Table Details */}
                <div className="mt-8 flex items-center justify-between w-full text-xs text-slate-300">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>{table.capacity} comensales</span>
                  </div>
                  {table.status === 'occupied' && !isEditMode && (
                    <div className="flex items-center space-x-1 text-amber-300">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Activa</span>
                    </div>
                  )}
                </div>

                {/* Table Quick Actions when occupied (Transfer / Merge) */}
                {(table.status === 'occupied' || table.status === 'check_requested') && !isEditMode && (
                  <div
                    className="mt-3 pt-2.5 border-t border-slate-700/50 flex items-center justify-between text-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setTransferSourceTable(table);
                        setSelectedTargetTableId('');
                        setActionError(null);
                      }}
                      title="Cambiar a otra mesa libre"
                      className="px-2 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center space-x-1 cursor-pointer transition text-[11px] border border-slate-700/60"
                    >
                      <ArrowRightLeft className="w-3 h-3 text-cyan-400" />
                      <span>Cambiar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMergeSourceTable(table);
                        setSelectedTargetTableId('');
                        setActionError(null);
                      }}
                      title="Unir comanda con otra mesa ocupada"
                      className="px-2 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center space-x-1 cursor-pointer transition text-[11px] border border-slate-700/60"
                    >
                      <GitMerge className="w-3 h-3 text-amber-400" />
                      <span>Unir</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Table Create / Edit Modal */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>{editingTable ? 'Editar Mesa' : 'Nueva Mesa'}</span>
              </h3>
              <button
                onClick={() => setShowTableModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveTable} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Número o Identificador de Mesa *
                </label>
                <input
                  type="text"
                  value={tableForm.label}
                  onChange={(e) => setTableForm({ ...tableForm, label: e.target.value })}
                  placeholder="Ej. Mesa 5, Barra 2, Terraza 1..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {!editingTable && floorPlans.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Zona o Salón *
                  </label>
                  <select
                    value={tableForm.floorPlanId}
                    onChange={(e) => setTableForm({ ...tableForm, floorPlanId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    required
                  >
                    {floorPlans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Capacidad (comensales)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={tableForm.capacity}
                    onChange={(e) =>
                      setTableForm({ ...tableForm, capacity: parseInt(e.target.value) || 1 })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Forma Geométrica
                  </label>
                  <select
                    value={tableForm.shape}
                    onChange={(e) =>
                      setTableForm({
                        ...tableForm,
                        shape: e.target.value as 'rect' | 'circle' | 'square',
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="rect">Rectangular</option>
                    <option value="square">Cuadrada</option>
                    <option value="circle">Redonda</option>
                  </select>
                </div>
              </div>

              {editingTable && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Estado Actual
                  </label>
                  <select
                    value={tableForm.status}
                    onChange={(e) =>
                      setTableForm({
                        ...tableForm,
                        status: e.target.value as TableItem['status'],
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="free">Libre</option>
                    <option value="occupied">Ocupada</option>
                    <option value="check_requested">Pidiendo Cuenta</option>
                    <option value="reserved">Reservada</option>
                    <option value="blocked">Bloqueada / Mantenimiento</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTableModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : 'Guardar Mesa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floor Plan Create Modal */}
      {showFloorPlanModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Nueva Zona o Salón</span>
              </h3>
              <button
                onClick={() => setShowFloorPlanModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFloorPlan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre del Área / Salón *
                </label>
                <input
                  type="text"
                  value={newFloorPlanName}
                  onChange={(e) => setNewFloorPlanName(e.target.value)}
                  placeholder="Ej. Terraza Exterior, Segundo Piso, Zona VIP..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowFloorPlanModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl"
                >
                  Cancelar
                </button>
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
      )}

      {/* Delete Table Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in-95 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">¿Eliminar Mesa?</h3>
            <p className="text-xs text-slate-400 mb-6">
              Estás a punto de eliminar <span className="text-white font-semibold">"{deleteTarget.label}"</span>. Esta acción quitará la mesa del salón.
            </p>

            <div className="flex space-x-3 justify-center">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteTable}
                disabled={submitting}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Table Modal */}
      <Dialog
        open={Boolean(transferSourceTable)}
        onOpenChange={(open) => !open && setTransferSourceTable(null)}
      >
        {transferSourceTable && (
          <DialogContent
            maxWidth="md"
            onClose={() => setTransferSourceTable(null)}
          >
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase mb-1">
              <ArrowRightLeft className="w-4 h-4" />
              <span>Operación de Sala</span>
            </div>
            <DialogTitle>Cambiar de Mesa</DialogTitle>
            <DialogDescription className="mb-5">
              Trasladar la orden activa de <strong className="text-white">{transferSourceTable.label}</strong> hacia una mesa disponible.
            </DialogDescription>

            {actionError && (
              <div className="p-3 bg-rose-950/50 border border-rose-800 text-rose-300 text-xs rounded-xl mb-4">
                {actionError}
              </div>
            )}

            {(() => {
              const freeTables = tables.filter(
                (t) =>
                  t.id !== transferSourceTable.id &&
                  t.status === 'free' &&
                  (transferTargetZone === 'all' || t.floorPlanId === transferTargetZone)
              );

              return (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Filtrar por Zona o Salón:
                    </label>
                    <select
                      value={transferTargetZone}
                      onChange={(e) => {
                        setTransferTargetZone(e.target.value);
                        setSelectedTargetTableId('');
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 mb-3"
                    >
                      <option value="all">Todas las Zonas ({floorPlans.length})</option>
                      {floorPlans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {freeTables.length === 0 ? (
                    <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 text-center text-slate-400 text-xs">
                      <AlertTriangle className="w-6 h-6 mx-auto mb-1.5 text-amber-400" />
                      <span>No hay mesas libres disponibles en la zona seleccionada.</span>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Selecciona la Mesa Destino (Libre):
                      </label>
                      <select
                        value={selectedTargetTableId}
                        onChange={(e) => setSelectedTargetTableId(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="">-- Elige una mesa libre --</option>
                        {freeTables.map((t) => {
                          const plan = floorPlans.find((p) => p.id === t.floorPlanId);
                          return (
                            <option key={t.id} value={t.id}>
                              [{plan ? plan.name : 'Zona'}] {t.label} (Cap: {t.capacity} personas)
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setTransferSourceTable(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={!selectedTargetTableId || actionLoading}
                      onClick={handleTransferTable}
                      className="px-5 py-2.5 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl shadow cursor-pointer disabled:bg-slate-800 disabled:text-slate-600 flex items-center space-x-1.5"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>{actionLoading ? 'Trasladando...' : 'Confirmar Traslado'}</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </DialogContent>
        )}
      </Dialog>

      {/* Merge Tables Modal */}
      {mergeSourceTable && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setMergeSourceTable(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase mb-1">
              <GitMerge className="w-4 h-4" />
              <span>Operación de Sala</span>
            </div>
            <h3 className="text-xl font-black text-white">Unir Mesas (Fusión)</h3>
            <p className="text-xs text-slate-400 mb-5">
              Todos los ítems de <strong className="text-white">{mergeSourceTable.label}</strong> se transferirán a la mesa seleccionada, liberando luego la mesa origen.
            </p>

            {actionError && (
              <div className="p-3 bg-rose-950/50 border border-rose-800 text-rose-300 text-xs rounded-xl mb-4">
                {actionError}
              </div>
            )}

            {(() => {
              const occupiedTables = tables.filter(
                (t) =>
                  t.id !== mergeSourceTable.id &&
                  (t.status === 'occupied' || t.status === 'check_requested')
              );

              if (occupiedTables.length === 0) {
                return (
                  <div className="p-6 bg-slate-800/60 rounded-2xl border border-slate-700/60 text-center text-slate-400 text-xs">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-amber-400" />
                    <span>No hay otras mesas ocupadas para fusionar.</span>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Selecciona la Mesa Destino Principal:
                    </label>
                    <select
                      value={selectedTargetTableId}
                      onChange={(e) => setSelectedTargetTableId(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="">-- Elige la mesa receptora --</option>
                      {occupiedTables.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label} (Orden activa)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setMergeSourceTable(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={!selectedTargetTableId || actionLoading}
                      onClick={handleMergeTables}
                      className="px-5 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow cursor-pointer disabled:bg-slate-800 disabled:text-slate-600 flex items-center space-x-1.5"
                    >
                      <GitMerge className="w-3.5 h-3.5" />
                      <span>{actionLoading ? 'Uniendo...' : 'Confirmar Fusión'}</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
