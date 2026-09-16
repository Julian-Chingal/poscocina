import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  Users,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Phone,
  Utensils,
  UserCheck,
  RefreshCw,
  X,
} from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';

interface Customer {
  id: string;
  name: string;
  documentNumber?: string;
  phone?: string;
  email?: string;
  loyaltyPoints?: number;
}

interface TableItem {
  id: string;
  label: string;
  capacity: number;
  status: string;
}

interface Reservation {
  id: string;
  venueId: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  tableId?: string;
  reservationTime: string;
  guestCount: number;
  status: 'pending' | 'confirmed' | 'seated' | 'cancelled' | 'no_show';
  notes?: string;
  createdAt: string;
  table?: TableItem;
  customer?: Customer;
}

interface ReservationsViewProps {
  venueId: string;
  onNavigateToTable?: (table: TableItem) => void;
}

export const ReservationsView: React.FC<ReservationsViewProps> = ({ venueId, onNavigateToTable }) => {
  const { token, currentUser } = useAuthStore();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<TableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formCustomerPhone, setFormCustomerPhone] = useState('');
  const [formCustomerEmail, setFormCustomerEmail] = useState('');
  const [formTableId, setFormTableId] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formTime, setFormTime] = useState('19:00');
  const [formGuestCount, setFormGuestCount] = useState(2);
  const [formNotes, setFormNotes] = useState('');

  // Customer Autocomplete in Modal
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerSearchResults, setCustomerSearchResults] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const fetchReservations = async () => {
    if (!venueId) return;
    try {
      setLoading(true);
      const url = selectedDate
        ? `/api/reservations?venueId=${venueId}&date=${selectedDate}`
        : `/api/reservations?venueId=${venueId}`;
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setReservations(data);
      }
    } catch (err) {
      console.error('Error fetching reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTables = async () => {
    if (!venueId) return;
    try {
      const res = await fetch(`/api/venues/${venueId}/tables`);
      if (res.ok) {
        const data = await res.json();
        setTables(data);
      }
    } catch (err) {
      console.error('Error fetching tables:', err);
    }
  };

  useEffect(() => {
    fetchReservations();
    fetchTables();
  }, [venueId, selectedDate]);

  // Customer search debounced
  useEffect(() => {
    if (!customerSearchQuery || customerSearchQuery.length < 2) {
      setCustomerSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/customers/search?venueId=${venueId}&query=${encodeURIComponent(customerSearchQuery)}`
        );
        if (res.ok) {
          const data = await res.json();
          setCustomerSearchResults(data);
        }
      } catch (err) {
        console.error('Customer search error:', err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [customerSearchQuery, venueId]);

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustomerName.trim()) {
      setErrorMessage('El nombre del comensal es obligatorio');
      return;
    }
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const reservationDateTime = new Date(`${formDate}T${formTime}:00`);
      const payload: any = {
        venueId,
        customerName: formCustomerName.trim(),
        customerPhone: formCustomerPhone.trim() || undefined,
        customerEmail: formCustomerEmail.trim() || undefined,
        customerId: selectedCustomer?.id || undefined,
        tableId: formTableId || undefined,
        reservationTime: reservationDateTime.toISOString(),
        guestCount: Number(formGuestCount),
        notes: formNotes.trim() || undefined,
      };

      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al registrar reserva');
      }

      setShowModal(false);
      resetForm();
      fetchReservations();
      fetchTables();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (
    reservationId: string,
    status: 'confirmed' | 'cancelled' | 'no_show'
  ) => {
    try {
      const res = await fetch(`/api/reservations/${reservationId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchReservations();
        fetchTables();
      }
    } catch (err) {
      console.error('Error updating reservation status:', err);
    }
  };

  const handleSeatReservation = async (reservation: Reservation) => {
    try {
      const res = await fetch(`/api/reservations/${reservation.id}/seat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          waiterId: currentUser?.id,
        }),
      });

      if (res.ok) {
        fetchReservations();
        fetchTables();
        if (reservation.table && onNavigateToTable) {
          onNavigateToTable(reservation.table);
        }
      }
    } catch (err) {
      console.error('Error seating reservation:', err);
    }
  };

  const resetForm = () => {
    setFormCustomerName('');
    setFormCustomerPhone('');
    setFormCustomerEmail('');
    setFormTableId('');
    setFormDate(selectedDate);
    setFormTime('19:00');
    setFormGuestCount(2);
    setFormNotes('');
    setSelectedCustomer(null);
    setCustomerSearchQuery('');
    setErrorMessage(null);
  };

  const filteredReservations = reservations.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = r.customerName.toLowerCase().includes(term);
      const matchPhone = r.customerPhone?.includes(term);
      const matchTable = r.table?.label?.toLowerCase().includes(term);
      return matchName || matchPhone || matchTable;
    }
    return true;
  });

  const getStatusBadge = (status: Reservation['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Clock className="w-3 h-3" /> Pendiente
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <CheckCircle2 className="w-3 h-3" /> Confirmada
          </span>
        );
      case 'seated':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <UserCheck className="w-3 h-3" /> Sentados
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <XCircle className="w-3 h-3" /> Cancelada
          </span>
        );
      case 'no_show':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 border border-slate-600">
            <AlertCircle className="w-3 h-3" /> No Asistió
          </span>
        );
    }
  };

  const pendingCount = reservations.filter((r) => r.status === 'pending').length;
  const confirmedCount = reservations.filter((r) => r.status === 'confirmed').length;
  const seatedCount = reservations.filter((r) => r.status === 'seated').length;
  const totalGuests = reservations
    .filter((r) => r.status !== 'cancelled' && r.status !== 'no_show')
    .reduce((sum, r) => sum + r.guestCount, 0);

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b border-slate-800 gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <Calendar className="w-7 h-7 text-pink-500" />
            <span>Reservas de Mesas</span>
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Gestión de reservas anticipadas, asignación de mesas y bienvenida a comensales.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Reserva</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium">Total Comensales</span>
          <div className="text-2xl font-black text-white mt-1 flex items-center gap-1.5">
            <Users className="w-5 h-5 text-pink-400" />
            {totalGuests}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-amber-400 font-medium">Pendientes</span>
          <div className="text-2xl font-black text-amber-300 mt-1">{pendingCount}</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-blue-400 font-medium">Confirmadas</span>
          <div className="text-2xl font-black text-blue-300 mt-1">{confirmedCount}</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-emerald-400 font-medium">En Mesa (Sentados)</span>
          <div className="text-2xl font-black text-emerald-300 mt-1">{seatedCount}</div>
        </div>
      </div>

      {/* Controls Bar: Date picker, Status filter, Search, Refresh */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Picker */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-slate-200 outline-none cursor-pointer"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
            {(['all', 'pending', 'confirmed', 'seated', 'cancelled'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg capitalize font-medium transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-pink-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st === 'all'
                  ? 'Todas'
                  : st === 'pending'
                  ? 'Pendientes'
                  : st === 'confirmed'
                  ? 'Confirmadas'
                  : st === 'seated'
                  ? 'Sentados'
                  : 'Canceladas'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por cliente o mesa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-pink-500 w-52"
            />
          </div>
          <button
            onClick={fetchReservations}
            title="Recargar"
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Reservations List */}
      {loading && reservations.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
          Cargando reservas...
        </div>
      ) : filteredReservations.length === 0 ? (
        <div className="text-center py-16 text-slate-500 border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
          <Calendar className="w-10 h-10 mx-auto text-slate-600 mb-2" />
          <p className="font-semibold text-slate-400">No hay reservas para los filtros seleccionados.</p>
          <p className="text-xs text-slate-500 mt-1">
            Usa el botón "Nueva Reserva" para agendar una reserva anticipada.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReservations.map((res) => {
            const timeStr = new Date(res.reservationTime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={res.id}
                className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h4 className="font-bold text-white text-base leading-tight">
                        {res.customerName}
                      </h4>
                      {res.customer?.loyaltyPoints ? (
                        <span className="text-[10px] text-pink-400 font-semibold">
                          💎 {res.customer.loyaltyPoints} pts de fidelidad
                        </span>
                      ) : null}
                    </div>
                    {getStatusBadge(res.status)}
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-pink-300">{timeStr} hrs</span>
                      <span className="text-slate-500">•</span>
                      <Users className="w-4 h-4 text-slate-400" />
                      <span>{res.guestCount} personas</span>
                    </div>

                    {res.table && (
                      <div className="flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-200 font-semibold">{res.table.label}</span>
                      </div>
                    )}

                    {res.customerPhone && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{res.customerPhone}</span>
                      </div>
                    )}

                    {res.notes && (
                      <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-300 italic mt-2">
                        "{res.notes}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  {res.status === 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus(res.id, 'confirmed')}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Confirmar
                    </button>
                  )}

                  {(res.status === 'pending' || res.status === 'confirmed') && (
                    <button
                      onClick={() => handleSeatReservation(res)}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5" /> Sentar Mesa
                    </button>
                  )}

                  {(res.status === 'pending' || res.status === 'confirmed') && (
                    <button
                      onClick={() => handleUpdateStatus(res.id, 'cancelled')}
                      title="Cancelar reserva"
                      className="p-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800 text-rose-300 text-xs transition cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Nueva Reserva */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-pink-500" />
                <span>Nueva Reserva de Mesa</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 mb-4 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateReservation} className="space-y-4">
              {/* Customer Autocomplete / Input */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Buscar Cliente Habitual (Cédula o Nombre)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar por cédula/NIT, nombre o tel..."
                    value={customerSearchQuery}
                    onChange={(e) => setCustomerSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-pink-500"
                  />
                  {customerSearchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 max-h-40 overflow-y-auto">
                      {customerSearchResults.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => {
                            setSelectedCustomer(c);
                            setFormCustomerName(c.name);
                            if (c.phone) setFormCustomerPhone(c.phone);
                            if (c.email) setFormCustomerEmail(c.email);
                            setCustomerSearchQuery('');
                            setCustomerSearchResults([]);
                          }}
                          className="px-3 py-2 text-xs hover:bg-slate-700 cursor-pointer border-b border-slate-700/50 last:border-0"
                        >
                          <div className="font-bold text-slate-100">{c.name}</div>
                          <div className="text-[11px] text-slate-400">
                            Doc: {c.documentNumber || 'S/N'} • Tel: {c.phone || 'S/N'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Nombre del Comensal *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCustomerName}
                    onChange={(e) => setFormCustomerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="tel"
                    value={formCustomerPhone}
                    onChange={(e) => setFormCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Hora</label>
                  <input
                    type="time"
                    required
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Comensales (Personas)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={formGuestCount}
                    onChange={(e) => setFormGuestCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Mesa Sugerida (Opcional)
                  </label>
                  <select
                    value={formTableId}
                    onChange={(e) => setFormTableId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-pink-500"
                  >
                    <option value="">-- Sin asignar / Cualquiera --</option>
                    {tables.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label} (Capacidad: {t.capacity}p - {t.status})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Notas Especiales / Ocasión
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Cumpleaños, aniversario, alérgico a nueces..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-pink-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Registrando...' : 'Confirmar Reserva'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
