import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  KeyRound,
  Shield,
  Edit2,
  CheckCircle,
  XCircle,
  Search,
  X,
  Lock,
  Mail,
  AlertCircle,
} from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';

interface RoleItem {
  id: string;
  name: string;
  label: string;
  hierarchy: number;
}

interface UserItem {
  id: string;
  name: string;
  email?: string | null;
  avatarUrl?: string | null;
  isActive: boolean;
  roleId: string;
  roleName: string;
  roleLabel: string;
  roleHierarchy: number;
  createdAt: string;
}

interface UsersViewProps {
  venueId: string;
}

export const UsersView: React.FC<UsersViewProps> = ({ venueId }) => {
  const { token, currentUser } = useAuthStore();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('active');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [resetPinUser, setResetPinUser] = useState<UserItem | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    roleId: '',
    pin: '',
    password: '',
    avatarUrl: '',
  });

  const [resetPinValue, setResetPinValue] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const authHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const loadData = async () => {
    if (!venueId) return;
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        fetch(`/api/venues/${venueId}/users`, { headers: authHeaders }),
        fetch('/api/roles', { headers: authHeaders }),
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }
      if (rolesRes.ok) {
        const rolesData = await rolesRes.json();
        setRoles(rolesData);
        if (rolesData.length > 0 && !formData.roleId) {
          const waiterRole = rolesData.find((r: RoleItem) => r.name === 'waiter');
          setFormData((prev) => ({ ...prev, roleId: waiterRole ? waiterRole.id : rolesData[0].id }));
        }
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [venueId]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/venues/${venueId}/users`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          name: formData.name,
          email: formData.email || undefined,
          roleId: formData.roleId,
          pin: formData.pin,
          password: formData.password || undefined,
          avatarUrl: formData.avatarUrl || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setActionError(err.message || 'Error al registrar el empleado');
        setSubmitting(false);
        return;
      }

      setActionSuccess('Empleado registrado exitosamente');
      setShowCreateModal(false);
      setFormData({
        name: '',
        email: '',
        roleId: roles[0]?.id || '',
        pin: '',
        password: '',
        avatarUrl: '',
      });
      loadData();
    } catch (err) {
      setActionError('Error de red al registrar el empleado');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setActionError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/venues/${venueId}/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({
          name: editingUser.name,
          email: editingUser.email || undefined,
          roleId: editingUser.roleId,
          isActive: editingUser.isActive,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setActionError(err.message || 'Error al actualizar el empleado');
        setSubmitting(false);
        return;
      }

      setActionSuccess('Datos de empleado actualizados');
      setEditingUser(null);
      loadData();
    } catch (err) {
      setActionError('Error de red al actualizar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPinUser) return;
    setActionError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/venues/${venueId}/users/${resetPinUser.id}/reset-pin`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ newPin: resetPinValue }),
      });

      if (!res.ok) {
        const err = await res.json();
        setActionError(err.message || 'Error al restablecer el PIN');
        setSubmitting(false);
        return;
      }

      setActionSuccess(`PIN de ${resetPinUser.name} restablecido correctamente`);
      setResetPinUser(null);
      setResetPinValue('');
    } catch (err) {
      setActionError('Error de red al restablecer el PIN');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (user: UserItem) => {
    try {
      if (user.isActive) {
        if (!confirm(`¿Está seguro de desactivar al empleado "${user.name}"? No podrá ingresar al sistema.`)) return;
        await fetch(`/api/venues/${venueId}/users/${user.id}`, {
          method: 'DELETE',
          headers: authHeaders,
        });
      } else {
        await fetch(`/api/venues/${venueId}/users/${user.id}`, {
          method: 'PATCH',
          headers: authHeaders,
          body: JSON.stringify({ isActive: true }),
        });
      }
      loadData();
    } catch (err) {
      console.error('Error toggling active status:', err);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      u.roleLabel.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === 'active') return matchesSearch && u.isActive;
    if (filterStatus === 'inactive') return matchesSearch && !u.isActive;
    return matchesSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Gestión de Empleados y Personal</h1>
              <p className="text-xs text-slate-400">
                Administración de accesos, roles operativos (meseros, cajeros, cocina) y credenciales PIN
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setActionError(null);
            setShowCreateModal(true);
          }}
          className="py-3 px-5 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Nuevo Empleado</span>
        </button>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex justify-between items-center animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-2xl w-full sm:w-auto">
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterStatus === 'active'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Activos ({users.filter((u) => u.isActive).length})
          </button>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todos ({users.length})
          </button>
          <button
            onClick={() => setFilterStatus('inactive')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterStatus === 'inactive'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Inactivos ({users.filter((u) => !u.isActive).length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nombre, rol o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
        </div>
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm">Cargando nómina de empleados...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-3xl text-slate-400 text-sm">
          No se encontraron empleados con los filtros actuales.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((u) => {
            const isManager = u.roleHierarchy >= 80;
            const isSelf = currentUser?.id === u.id;

            return (
              <div
                key={u.id}
                className={`bg-slate-900 border rounded-3xl p-5 shadow-sm transition flex flex-col justify-between ${
                  u.isActive ? 'border-slate-800 hover:border-slate-700' : 'border-slate-800/40 opacity-60 bg-slate-950'
                }`}
              >
                <div>
                  {/* Header with Avatar & Role */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black uppercase ${
                          isManager
                            ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                            : 'bg-slate-800 border border-slate-700 text-slate-200'
                        }`}
                      >
                        {u.name.slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                          <span>{u.name}</span>
                          {isSelf && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-normal">
                              Tú
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Shield className="w-3 h-3 text-amber-400" />
                          <span>{u.roleLabel}</span>
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                        u.isActive
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {u.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="bg-slate-950/60 rounded-2xl p-3 border border-slate-800/80 space-y-1.5 text-xs text-slate-400 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Email:</span>
                      <span className="font-mono text-slate-300 truncate max-w-[180px]">
                        {u.email || '— Sin correo (Solo PIN) —'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Acceso PIN:</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <KeyRound className="w-3 h-3" />
                        <span>Habilitado (••••)</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setActionError(null);
                        setEditingUser(u);
                      }}
                      title="Editar empleado"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        setActionError(null);
                        setResetPinValue('');
                        setResetPinUser(u);
                      }}
                      title="Restablecer PIN"
                      className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {!isSelf && (
                    <button
                      onClick={() => handleToggleActive(u)}
                      className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1 text-[11px] ${
                        u.isActive
                          ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {u.isActive ? (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Desactivar</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Reactivar</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-white">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Nuevo Empleado</h2>
                <p className="text-xs text-slate-400">Asigne nombre, rol y clave PIN de acceso</p>
              </div>
            </div>

            {actionError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Laura Sánchez"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Rol en el Restaurante *</label>
                <select
                  value={formData.roleId}
                  onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label} ({r.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">PIN Numérico (4-6 dígitos) *</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-500" />
                  <input
                    type="password"
                    required
                    maxLength={6}
                    placeholder="ej. 4567"
                    value={formData.pin}
                    onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition font-mono tracking-widest"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Clave táctil para comandas y terminales</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">
                  Correo Electrónico <span className="text-slate-500 font-normal">(Opcional para meseros/cocina)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-500" />
                  <input
                    type="email"
                    placeholder="laura@poscocina.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">
                  Contraseña Maestra <span className="text-slate-500 font-normal">(Obligatorio si tiene correo)</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-500" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition cursor-pointer"
                >
                  {submitting ? 'Guardando...' : 'Guardar Empleado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-white">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Edit2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Editar Empleado</h2>
                <p className="text-xs text-slate-400">{editingUser.name}</p>
              </div>
            </div>

            {actionError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Rol Asignado *</label>
                <select
                  value={editingUser.roleId}
                  onChange={(e) => setEditingUser({ ...editingUser, roleId: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label} ({r.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Correo Electrónico</label>
                <input
                  type="email"
                  value={editingUser.email || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition cursor-pointer"
                >
                  {submitting ? 'Actualizando...' : 'Actualizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PIN MODAL */}
      {resetPinUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-white">
            <button
              onClick={() => setResetPinUser(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-3">
                <KeyRound className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold">Cambiar PIN</h2>
              <p className="text-xs text-slate-400">
                Nuevo código PIN de 4 a 6 dígitos para <strong>{resetPinUser.name}</strong>
              </p>
            </div>

            {actionError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleResetPin} className="space-y-4">
              <div>
                <input
                  type="password"
                  required
                  maxLength={6}
                  autoFocus
                  placeholder="••••"
                  value={resetPinValue}
                  onChange={(e) => setResetPinValue(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-3 text-center text-xl text-white font-mono tracking-widest focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setResetPinUser(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || resetPinValue.length < 4}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : 'Asignar PIN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
