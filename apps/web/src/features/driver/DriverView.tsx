import React, { useState, useEffect, useCallback } from 'react';
import {
  Bike,
  MapPin,
  Phone,
  MessageSquare,
  Navigation,
  ShieldCheck,
  RefreshCw,
  LogOut,
  Wallet,
  Radar,
  Coins,
  Store,
  CheckCheck,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { driverApi } from './api/driver.api';
import { DriverProfile, DriverOrder, DriverWalletResponse } from './types/driver.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';

export const DriverView: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'radar' | 'active' | 'wallet'>('radar');

  // State
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [availableOrders, setAvailableOrders] = useState<DriverOrder[]>([]);
  const [myOrders, setMyOrders] = useState<DriverOrder[]>([]);
  const [walletData, setWalletData] = useState<DriverWalletResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  // Handshake 1: Pickup PIN Modal
  const [pickupOrder, setPickupOrder] = useState<DriverOrder | null>(null);
  const [enteredPickupPin, setEnteredPickupPin] = useState('');
  const [verifyingPickupPin, setVerifyingPickupPin] = useState(false);

  // Handshake 2: Delivery PIN Modal
  const [deliveryOrder, setDeliveryOrder] = useState<DriverOrder | null>(null);
  const [enteredDeliveryPin, setEnteredDeliveryPin] = useState('');
  const [verifyingDeliveryPin, setVerifyingDeliveryPin] = useState(false);

  // Onboarding Modal (if user has no driverProfile yet)
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regForm, setRegForm] = useState({
    name: user?.name || '',
    phone: '',
    documentNumber: '',
    documentType: 'CC',
    city: 'Popayán',
    vehicleType: 'motorcycle' as 'motorcycle' | 'bicycle' | 'car',
    licensePlate: '',
    payoutMethod: 'nequi',
    payoutAccount: '',
  });
  const [registering, setRegistering] = useState(false);

  // Load Driver Data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Load Profile
      const prof = await driverApi.getProfile().catch(() => null);
      if (prof) {
        setProfile(prof);
      } else {
        setShowRegisterModal(true);
      }

      // 2. Load Available City Orders
      const avail = await driverApi.getAvailableOrders().catch(() => []);
      setAvailableOrders(Array.isArray(avail) ? avail : []);

      // 3. Load My Active/Assigned Orders
      const mine = await driverApi.getMyOrders().catch(() => []);
      setMyOrders(Array.isArray(mine) ? mine : []);

      // 4. Load Wallet
      if (prof) {
        const wall = await driverApi.getWallet().catch(() => null);
        if (wall) setWalletData(wall);
      }
    } catch (err: any) {
      console.warn('Error loading driver data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000); // Polling every 15s
    return () => clearInterval(interval);
  }, [loadData]);

  // Toggle Availability
  const handleToggleStatus = async () => {
    if (!profile) return;
    const nextStatus = profile.status === 'available' ? 'offline' : 'available';
    try {
      const updated = await driverApi.updateStatus({ status: nextStatus });
      setProfile(updated);
      toast.success(
        nextStatus === 'available'
          ? '🟢 ¡Estás conectado y disponible para recibir pedidos!'
          : '⚪ Desconectado. No recibirás nuevos pedidos.'
      );
    } catch {
      toast.error('No se pudo actualizar tu estado');
    }
  };

  // Claim Order (Atomic Lock)
  const handleClaimOrder = async (orderId: string) => {
    setClaimingId(orderId);
    try {
      await driverApi.claimOrder(orderId);
      toast.success('¡Pedido aceptado exitosamente! Dirígete al restaurante.');
      setActiveTab('active');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Error al tomar el pedido');
    } finally {
      setClaimingId(null);
    }
  };

  // Step 1: Confirm Pickup with Restaurant PIN
  const handleConfirmPickupPin = async () => {
    if (!pickupOrder || !enteredPickupPin.trim()) return;
    setVerifyingPickupPin(true);
    try {
      await driverApi.confirmPickup(pickupOrder.id, enteredPickupPin.trim());
      toast.success('¡Paquete recogido en restaurante! Ahora dirígete al cliente.');
      setPickupOrder(null);
      setEnteredPickupPin('');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Código de recogida del restaurante incorrecto');
    } finally {
      setVerifyingPickupPin(false);
    }
  };

  // Step 2: Complete Delivery with Customer PIN (Triggers 3-Way Settlement)
  const handleCompleteDeliveryPin = async () => {
    if (!deliveryOrder || !enteredDeliveryPin.trim()) return;
    setVerifyingDeliveryPin(true);
    try {
      await driverApi.completeDelivery(deliveryOrder.id, enteredDeliveryPin.trim());
      toast.success('¡Entrega completada con éxito! Ganancia liquidada en tu billetera.');
      setDeliveryOrder(null);
      setEnteredDeliveryPin('');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Código de entrega del cliente incorrecto');
    } finally {
      setVerifyingDeliveryPin(false);
    }
  };

  // Freelance Courier Onboarding
  const handleRegisterCourier = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistering(true);
    try {
      await driverApi.register({
        ...regForm,
        email: user?.email || `${regForm.documentNumber}@driver.poscocina.com`,
        password: regForm.documentNumber, // Initial password
      });
      toast.success('¡Registro de domiciliario completado exitosamente!');
      setShowRegisterModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Error al registrarte como domiciliario');
    } finally {
      setRegistering(false);
    }
  };

  const formatCOP = (val: string | number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(
      typeof val === 'string' ? parseFloat(val || '0') : val
    );

  // Filter active in-course orders vs history
  const activeAssignedOrders = myOrders.filter(
    (o) => o.status !== 'closed' && o.kitchenStatus !== 'delivered' && o.dispatchStatus !== 'delivered'
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* 1. Header Bar */}
      <header className="sticky top-0 z-30 border-b bg-card/95 px-4 py-3 backdrop-blur shadow-sm">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white shadow-md shadow-orange-500/20">
              <Bike className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-bold text-foreground">
                  {profile ? `Hola, ${profile.phone}` : 'Portal Domiciliario'}
                </h1>
                {profile && (
                  <Badge variant="outline" className="text-[10px] bg-primary/10 border-primary/30 text-primary">
                    Nivel {profile.trustTier}
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {profile?.city || 'Popayán'} · Red Pallevar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {profile && (
              <Button
                variant={profile.status === 'available' ? 'default' : 'secondary'}
                size="sm"
                onClick={handleToggleStatus}
                className={
                  profile.status === 'available'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-2.5 shadow-sm'
                    : 'text-xs h-8 px-2.5'
                }
              >
                <span className="flex h-2 w-2 rounded-full bg-white mr-1.5 animate-pulse" />
                {profile.status === 'available' ? 'Disponible' : 'Desconectado'}
              </Button>
            )}

            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={loadData}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => logout()}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Balance Card Chip */}
        {profile && (
          <div className="mx-auto mt-2.5 flex max-w-lg items-center justify-between rounded-lg bg-muted/40 p-2 text-xs">
            <div className="flex items-center gap-1.5">
              <Wallet className="h-4 w-4 text-emerald-500" />
              <span className="text-muted-foreground">Mi Billetera:</span>
              <strong className={parseFloat(profile.walletBalance) < 0 ? 'text-rose-500' : 'text-emerald-600'}>
                {formatCOP(profile.walletBalance)}
              </strong>
            </div>
            <div className="text-[11px] text-muted-foreground">
              Cupo de confianza: <strong>{formatCOP(profile.creditLimit)}</strong>
            </div>
          </div>
        )}
      </header>

      {/* 2. Navigation Tabs */}
      <nav className="sticky top-[95px] z-20 border-b bg-background/80 px-4 backdrop-blur">
        <div className="mx-auto flex max-w-lg justify-around">
          <button
            onClick={() => setActiveTab('radar')}
            className={`flex items-center gap-1.5 border-b-2 py-2.5 text-xs font-semibold transition-colors ${
              activeTab === 'radar'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Radar className="h-4 w-4" />
            Radar de Pedidos
            {availableOrders.length > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] text-white font-bold">
                {availableOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-1.5 border-b-2 py-2.5 text-xs font-semibold transition-colors ${
              activeTab === 'active'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Bike className="h-4 w-4" />
            En Curso
            {activeAssignedOrders.length > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white font-bold">
                {activeAssignedOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('wallet')}
            className={`flex items-center gap-1.5 border-b-2 py-2.5 text-xs font-semibold transition-colors ${
              activeTab === 'wallet'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Wallet className="h-4 w-4" />
            Mi Billetera
          </button>
        </div>
      </nav>

      {/* 3. Main Content Panes */}
      <main className="mx-auto max-w-lg p-4">
        {/* TAB 1: RADAR DE PEDIDOS (Bolsa de Domicilios de la Ciudad) */}
        {activeTab === 'radar' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Radar className="h-3.5 w-3.5 text-orange-500 animate-spin" /> Pedidos Disponibles para Recoger
              </h2>
              <span className="text-xs text-muted-foreground">{availableOrders.length} disponibles</span>
            </div>

            {availableOrders.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-card p-8 text-center text-muted-foreground">
                <Radar className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm font-semibold">No hay pedidos pendientes en tu zona</p>
                <p className="text-xs text-muted-foreground/80 mt-1">
                  Mantente conectado. Te notificaremos en tiempo real cuando un restaurante despache un domicilio.
                </p>
              </div>
            ) : (
              availableOrders.map((ord) => {
                const driverFee = ord.driverPayout ? parseFloat(ord.driverPayout) : 4000;
                const isCash = ord.notes?.toLowerCase().includes('pago: cash') || ord.notes?.toLowerCase().includes('efectivo');

                return (
                  <div
                    key={ord.id}
                    className="overflow-hidden rounded-2xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between border-b pb-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Store className="h-4 w-4 text-orange-500" />
                          <h3 className="font-bold text-foreground text-sm">{ord.venue?.name || 'Restaurante'}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-muted-foreground/60" />
                          {ord.venue?.address || 'Dirección de recogida'}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-muted-foreground block">Tu Ganancia</span>
                        <span className="text-base font-extrabold text-emerald-600">{formatCOP(driverFee)}</span>
                      </div>
                    </div>

                    <div className="py-3 text-xs space-y-1.5">
                      <div className="flex items-start gap-1.5">
                        <span className="font-semibold text-foreground">Destino:</span>
                        <span className="text-muted-foreground">{ord.customer?.address || 'Dirección del cliente'}</span>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <Badge variant="secondary" className="text-[10px]">
                          {isCash ? '💵 Cobra en Efectivo' : '💳 Pago Digital (Ya pago)'}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          Total Pedido: {formatCOP(ord.total)}
                        </Badge>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs h-9 shadow-md shadow-orange-500/20"
                      disabled={claimingId === ord.id}
                      onClick={() => handleClaimOrder(ord.id)}
                    >
                      {claimingId === ord.id ? 'Aceptando...' : 'Tomar Pedido y Ganar ' + formatCOP(driverFee)}
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: PEDIDOS EN CURSO (Doble Handshake con PIN) */}
        {activeTab === 'active' && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Tus Entregas Asignadas ({activeAssignedOrders.length})
            </h2>

            {activeAssignedOrders.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-card p-8 text-center text-muted-foreground">
                <Bike className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm font-semibold">No tienes pedidos en curso</p>
                <p className="text-xs text-muted-foreground/80 mt-1">
                  Revisa la pestaña "Radar de Pedidos" para tomar domicilios disponibles.
                </p>
              </div>
            ) : (
              activeAssignedOrders.map((ord) => {
                const isPickedUp = ord.dispatchStatus === 'picked_up';
                const isCash = ord.notes?.toLowerCase().includes('pago: cash') || ord.notes?.toLowerCase().includes('efectivo');

                return (
                  <div key={ord.id} className="rounded-2xl border bg-card p-4 shadow-sm space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between border-b pb-2.5">
                      <div>
                        <span className="text-[10px] font-mono text-muted-foreground">ID: #{ord.id.slice(0, 8)}</span>
                        <h3 className="font-bold text-foreground text-sm">{ord.venue?.name || 'Restaurante'}</h3>
                      </div>
                      <Badge className={isPickedUp ? 'bg-blue-500 text-white' : 'bg-amber-500 text-white'}>
                        {isPickedUp ? 'En camino al cliente' : 'Recogiendo en local'}
                      </Badge>
                    </div>

                    {/* Stepper Status */}
                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div
                        className={`p-2 rounded-xl border ${
                          !isPickedUp
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 font-semibold'
                            : 'bg-muted/40 text-muted-foreground'
                        }`}
                      >
                        Paso 1: Recoger en Local
                      </div>
                      <div
                        className={`p-2 rounded-xl border ${
                          isPickedUp
                            ? 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300 font-semibold'
                            : 'bg-muted/40 text-muted-foreground'
                        }`}
                      >
                        Paso 2: Entregar a Cliente
                      </div>
                    </div>

                    {/* Addresses & Navigation */}
                    <div className="space-y-2 text-xs">
                      <div className="rounded-xl bg-muted/30 p-2.5">
                        <strong className="text-foreground block mb-0.5">1. Recoger en Restaurante:</strong>
                        <p className="text-muted-foreground">{ord.venue?.address || 'Dirección de recogida'}</p>
                        {ord.venue?.address && (
                          <a
                            href={`https://maps.google.com/?q=${encodeURIComponent(ord.venue.address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-primary font-semibold mt-1"
                          >
                            <Navigation className="h-3 w-3" /> Cómo llegar al restaurante
                          </a>
                        )}
                      </div>

                      <div className="rounded-xl bg-muted/30 p-2.5">
                        <strong className="text-foreground block mb-0.5">2. Entregar a Cliente:</strong>
                        <p className="text-foreground font-medium">{ord.customer?.name}</p>
                        <p className="text-muted-foreground">{ord.customer?.address}</p>
                        {ord.customer?.phone && (
                          <div className="flex gap-2 mt-2">
                            <a
                              href={`tel:${ord.customer.phone}`}
                              className="inline-flex items-center gap-1 text-[11px] bg-card border px-2 py-1 rounded-md text-foreground font-semibold"
                            >
                              <Phone className="h-3 w-3 text-emerald-500" /> Llamar
                            </a>
                            <a
                              href={`https://wa.me/${ord.customer.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] bg-card border px-2 py-1 rounded-md text-foreground font-semibold"
                            >
                              <MessageSquare className="h-3 w-3 text-emerald-500" /> WhatsApp
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Payment Alert */}
                    <div className="rounded-xl border bg-muted/20 p-2.5 text-xs flex items-center justify-between">
                      <span className="text-muted-foreground">Cobro al cliente:</span>
                      <strong>{isCash ? `Cobrar ${formatCOP(ord.total)} en efectivo` : 'Ya pagado por transferencia'}</strong>
                    </div>

                    {/* Action Handshake Buttons */}
                    {!isPickedUp ? (
                      <Button
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs h-9 shadow-sm"
                        onClick={() => setPickupOrder(ord)}
                      >
                        <ShieldCheck className="h-4 w-4 mr-1.5" />
                        Confirmar Recogida (Ingresar PIN 1 del Restaurante)
                      </Button>
                    ) : (
                      <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 shadow-sm"
                        onClick={() => setDeliveryOrder(ord)}
                      >
                        <CheckCheck className="h-4 w-4 mr-1.5" />
                        Completar Entrega (Ingresar PIN 2 del Cliente)
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 3: MI BILLETERA & LIQUIDACIONES */}
        {activeTab === 'wallet' && profile && (
          <div className="space-y-4">
            {/* Wallet Big Card */}
            <div className="rounded-2xl border bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-xl">
              <span className="text-xs uppercase tracking-wider text-slate-400">Saldo Disponible en Billetera</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black">{formatCOP(profile.walletBalance)}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-700/60 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Ganancias Acumuladas</span>
                  <strong className="text-emerald-400 font-bold">{formatCOP(profile.totalEarnings)}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Entregas Realizadas</span>
                  <strong className="text-white font-bold">{profile.completedDeliveries} pedidos</strong>
                </div>
              </div>

              <div className="mt-3 rounded-lg bg-slate-800/80 p-2.5 text-[11px] text-slate-300 flex items-center justify-between">
                <span>Cupo de deuda permitido:</span>
                <strong className="text-amber-400">{formatCOP(profile.creditLimit)}</strong>
              </div>
            </div>

            {/* Payout Destination Info */}
            <div className="rounded-2xl border bg-card p-4 shadow-sm text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Coins className="h-4 w-4 text-primary" /> Datos de Cobro / Retiro
                </span>
                <Badge variant="outline" className="uppercase font-mono text-[10px]">
                  {profile.payoutMethod || 'Nequi'}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Cuenta / Celular: <strong>{profile.payoutAccount || profile.phone}</strong>
              </p>
              <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
                Los cortes y transferencias a tu Nequi o Daviplata se realizan automáticamente cada domingo para saldos positivos.
              </p>
            </div>

            {/* Transaction Ledger */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Historial de Movimientos
              </h3>

              {!walletData?.transactions || walletData.transactions.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground">
                  No hay transacciones registradas todavía.
                </div>
              ) : (
                <div className="space-y-2">
                  {walletData.transactions.map((tx) => {
                    const amount = parseFloat(tx.amount);
                    const isPositive = amount > 0;

                    return (
                      <div
                        key={tx.id}
                        className="rounded-xl border bg-card p-3 text-xs flex items-center justify-between shadow-sm"
                      >
                        <div>
                          <p className="font-semibold text-foreground">{tx.notes || tx.type}</p>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(tx.createdAt).toLocaleDateString('es-CO', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className="text-right">
                          <strong className={isPositive ? 'text-emerald-600' : 'text-rose-500'}>
                            {isPositive ? `+${formatCOP(amount)}` : formatCOP(amount)}
                          </strong>
                          <span className="block text-[10px] text-muted-foreground">
                            Saldo: {formatCOP(tx.balanceAfter)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: Ingresar PIN de Recogida (Restaurante) */}
      <Dialog open={Boolean(pickupOrder)} onOpenChange={() => setPickupOrder(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-amber-500" /> Código de Recogida
            </DialogTitle>
            <DialogDescription>
              Pídele al cajero o cocinero del restaurante su <strong>Código de Recogida (4 dígitos)</strong> para confirmar que recibiste el pedido.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <Input
              type="text"
              maxLength={6}
              placeholder="Ej: 3841"
              value={enteredPickupPin}
              onChange={(e) => setEnteredPickupPin(e.target.value.replace(/\D/g, ''))}
              className="text-center font-mono text-2xl tracking-widest font-bold h-12"
            />
            <Button
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
              disabled={verifyingPickupPin || enteredPickupPin.length < 4}
              onClick={handleConfirmPickupPin}
            >
              {verifyingPickupPin ? 'Validando...' : 'Confirmar Paquete Recibido'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: Ingresar PIN de Entrega (Cliente) */}
      <Dialog open={Boolean(deliveryOrder)} onOpenChange={() => setDeliveryOrder(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" /> Código de Entrega del Cliente
            </DialogTitle>
            <DialogDescription>
              Pídele al cliente el <strong>Código de Entrega de 4 dígitos</strong> que recibió en su WhatsApp para cerrar el pedido y acreditar tu ganancia.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <Input
              type="text"
              maxLength={6}
              placeholder="Ej: 7421"
              value={enteredDeliveryPin}
              onChange={(e) => setEnteredDeliveryPin(e.target.value.replace(/\D/g, ''))}
              className="text-center font-mono text-2xl tracking-widest font-bold h-12"
            />
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              disabled={verifyingDeliveryPin || enteredDeliveryPin.length < 4}
              onClick={handleCompleteDeliveryPin}
            >
              {verifyingDeliveryPin ? 'Validando...' : 'Validar Entrega y Liquidar Ganancia'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: Registro Inicial de Domiciliario Independiente */}
      <Dialog open={showRegisterModal} onOpenChange={setShowRegisterModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bike className="h-5 w-5 text-orange-500" /> Registro de Domiciliario Independiente
            </DialogTitle>
            <DialogDescription>
              Únete a la red abierta de repartidores de tu ciudad. Recibe pedidos y gana libremente.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRegisterCourier} className="space-y-3 py-2 text-xs">
            <div>
              <label className="font-semibold block mb-1">Nombre Completo *</label>
              <Input
                required
                value={regForm.name}
                onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                placeholder="Ej: Juan Camilo Pérez"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold block mb-1">WhatsApp / Teléfono *</label>
                <Input
                  required
                  value={regForm.phone}
                  onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                  placeholder="300 123 4567"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Número de Cédula *</label>
                <Input
                  required
                  value={regForm.documentNumber}
                  onChange={(e) => setRegForm({ ...regForm, documentNumber: e.target.value })}
                  placeholder="1061..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold block mb-1">Ciudad *</label>
                <Input
                  required
                  value={regForm.city}
                  onChange={(e) => setRegForm({ ...regForm, city: e.target.value })}
                  placeholder="Popayán"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Placa de Vehículo</label>
                <Input
                  value={regForm.licensePlate}
                  onChange={(e) => setRegForm({ ...regForm, licensePlate: e.target.value })}
                  placeholder="ABC12D"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold block mb-1">Método de Pago para Cobros</label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
                  value={regForm.payoutMethod}
                  onChange={(e) => setRegForm({ ...regForm, payoutMethod: e.target.value })}
                >
                  <option value="nequi">Nequi</option>
                  <option value="daviplata">Daviplata</option>
                  <option value="bancolombia">Bancolombia</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Número de Cuenta / Celular *</label>
                <Input
                  required
                  value={regForm.payoutAccount}
                  onChange={(e) => setRegForm({ ...regForm, payoutAccount: e.target.value })}
                  placeholder="Número de Nequi/Daviplata"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold mt-2"
              disabled={registering}
            >
              {registering ? 'Registrando...' : 'Comenzar a Trabajar'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DriverView;
