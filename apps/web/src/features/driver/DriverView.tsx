import React, { useState, useEffect, useCallback } from 'react';
import {
  Bike,
  MapPin,
  Phone,
  MessageSquare,
  Navigation,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';

interface DriverOrder {
  id: string;
  venueId: string;
  orderType: string;
  status: string;
  kitchenStatus: string;
  paymentStatus: string;
  guestName?: string | null;
  notes?: string | null;
  total: string;
  deliveryPin?: string | null;
  openedAt: string;
  customer?: {
    id: string;
    name: string;
    phone: string;
    address?: string;
  };
  items?: Array<{
    id: string;
    quantity: number;
    product?: {
      name: string;
    };
  }>;
}

export const DriverView: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [orders, setOrders] = useState<DriverOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'in_route' | 'delivered'>('pending');

  // Delivery Handover Modal state
  const [selectedOrder, setSelectedOrder] = useState<DriverOrder | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [verifyingPin, setVerifyingPin] = useState(false);

  const fetchDriverOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<DriverOrder[]>('/driver/orders');
      setOrders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error('Error al cargar órdenes de entrega');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDriverOrders();
    const interval = setInterval(fetchDriverOrders, 20000); // Polling every 20s
    return () => clearInterval(interval);
  }, [fetchDriverOrders]);

  // Advance to "In Route" (En camino)
  const handleStartRoute = async (orderId: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'check_requested' });
      toast.success('¡Pedido marcado en camino! 🛵');
      fetchDriverOrders();
    } catch (err: any) {
      toast.error('No se pudo actualizar el estado');
    }
  };

  // Complete Delivery by Validating Customer PIN
  const handleVerifyDeliveryPin = async () => {
    if (!selectedOrder || !enteredPin.trim()) return;

    setVerifyingPin(true);
    try {
      await api.post(`/orders/${selectedOrder.id}/complete-delivery`, {
        deliveryPin: enteredPin.trim(),
      });

      toast.success('¡Entrega completada con éxito! Código validado.');
      setSelectedOrder(null);
      setEnteredPin('');
      fetchDriverOrders();
    } catch (err: any) {
      toast.error(err.message || 'Código de entrega incorrecto. Verifícalo con el cliente.');
    } finally {
      setVerifyingPin(false);
    }
  };

  const parseOrderDetails = (notes?: string | null) => {
    if (!notes) return { address: '', phone: '', payment: '' };
    const parts = notes.split(' | ');
    let address = '';
    let phone = '';
    let payment = '';

    parts.forEach((p) => {
      if (p.startsWith('Dirección: ')) address = p.replace('Dirección: ', '');
      if (p.startsWith('Teléfono: ')) phone = p.replace('Teléfono: ', '');
      if (p.startsWith('Pago: ')) payment = p.replace('Pago: ', '');
    });

    return { address, phone, payment };
  };

  const pendingOrders = orders.filter((o) => o.kitchenStatus !== 'delivered' && o.status !== 'closed');
  const deliveredOrders = orders.filter((o) => o.kitchenStatus === 'delivered' || o.status === 'closed');

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      {/* Driver Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-background px-4 py-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-xs">
            <Bike className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-foreground">Portal Domiciliario</h1>
            <p className="text-xs text-muted-foreground">{user?.name || 'Repartidor'}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" onClick={fetchDriverOrders} className="h-8 w-8">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="ghost" size="icon" onClick={logout} className="h-8 w-8 text-destructive">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Segmented Filter Bar */}
      <div className="sticky top-[57px] z-10 flex border-b bg-background px-4 py-2 gap-2">
        <Button
          variant={activeTab === 'pending' ? 'default' : 'outline'}
          size="sm"
          className="flex-1 text-xs"
          onClick={() => setActiveTab('pending')}
        >
          Activos ({pendingOrders.length})
        </Button>
        <Button
          variant={activeTab === 'delivered' ? 'default' : 'outline'}
          size="sm"
          className="flex-1 text-xs"
          onClick={() => setActiveTab('delivered')}
        >
          Entregados ({deliveredOrders.length})
        </Button>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 max-w-xl mx-auto w-full space-y-3">
        {loading && orders.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Cargando pedidos...</div>
        ) : (activeTab === 'pending' ? pendingOrders : deliveredOrders).length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-card p-8 text-center text-muted-foreground">
            <Bike className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
            <p className="font-semibold text-sm text-foreground">No tienes pedidos en esta pestaña</p>
            <p className="text-xs mt-1">Los pedidos que te asigne el restaurante aparecerán aquí automáticamente.</p>
          </div>
        ) : (
          (activeTab === 'pending' ? pendingOrders : deliveredOrders).map((order) => {
            const { address, phone, payment } = parseOrderDetails(order.notes);
            const customerPhone = order.customer?.phone || phone;
            const customerAddress = order.customer?.address || address;
            const isDelivered = order.kitchenStatus === 'delivered' || order.status === 'closed';

            return (
              <div
                key={order.id}
                className="rounded-2xl border bg-card p-4 shadow-xs transition-shadow hover:shadow-md space-y-3"
              >
                {/* Header card */}
                <div className="flex items-center justify-between border-b pb-2.5">
                  <div>
                    <h3 className="font-bold text-sm text-foreground">
                      {order.customer?.name || order.guestName || 'Cliente Domicilio'}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Pedido #{order.id.slice(0, 6).toUpperCase()} • {new Date(order.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <Badge
                    variant={isDelivered ? 'outline' : 'default'}
                    className={
                      isDelivered
                        ? 'border-emerald-500/30 text-emerald-600'
                        : 'bg-primary text-primary-foreground'
                    }
                  >
                    {isDelivered ? 'ENTREGADO' : order.kitchenStatus.toUpperCase()}
                  </Badge>
                </div>

                {/* Address & Navigation */}
                {customerAddress && (
                  <div className="flex items-start gap-2 text-xs text-foreground bg-muted/30 p-2.5 rounded-xl">
                    <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">{customerAddress}</p>
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(customerAddress)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 flex items-center gap-1 text-[11px] font-semibold text-primary underline"
                    >
                      <Navigation className="h-3.5 w-3.5" />
                      <span>Ruta</span>
                    </a>
                  </div>
                )}

                {/* Items & Payment Info */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div>
                    <span className="text-muted-foreground">Total a Cobrar: </span>
                    <span className="font-bold text-sm text-foreground">
                      ${Number(order.total).toLocaleString('es-CO')}
                    </span>
                  </div>
                  <Badge
                    variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}
                    className={
                      order.paymentStatus === 'paid'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                    }
                  >
                    {order.paymentStatus === 'paid' ? 'PAGADO (Transferencia)' : 'PAGO CONTRAENTREGA'}
                  </Badge>
                </div>

                {payment && (
                  <p className="text-[11px] text-muted-foreground italic">Detalle de pago: {payment}</p>
                )}

                {/* Contact Actions */}
                {customerPhone && (
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={`tel:${customerPhone}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 border rounded-xl text-xs font-semibold text-foreground bg-background hover:bg-muted"
                    >
                      <Phone className="h-3.5 w-3.5 text-primary" />
                      <span>Llamar</span>
                    </a>
                    <a
                      href={`https://wa.me/${customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                        '¡Hola! Soy tu domiciliario de Zogui y voy en camino con tu pedido 🛵'
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 border rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                )}

                {/* Driver Action Button */}
                {!isDelivered && (
                  <div className="pt-2 flex flex-col gap-2">
                    {order.kitchenStatus !== 'dispatched' && (
                      <Button
                        variant="outline"
                        className="w-full text-xs font-semibold h-9 rounded-xl border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 gap-1.5"
                        onClick={() => handleStartRoute(order.id)}
                      >
                        <Bike className="h-4 w-4" />
                        <span>Iniciar Ruta / En Camino</span>
                      </Button>
                    )}
                    <Button
                      className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 text-sm shadow-md rounded-xl"
                      onClick={() => {
                        setSelectedOrder(order);
                        setEnteredPin('');
                      }}
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span>ENTREGAR PEDIDO (VALIDAR PIN)</span>
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </main>

      {/* Handover PIN Verification Dialog */}
      <Dialog open={Boolean(selectedOrder)} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <span>Validar Código de Entrega</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Pídele al cliente el <strong>Código de Entrega (PIN de 4 dígitos)</strong> que recibió en su WhatsApp para finalizar la entrega.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="rounded-xl bg-muted/40 p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Total del pedido:</p>
              <p className="text-xl font-bold text-foreground">
                ${selectedOrder ? Number(selectedOrder.total).toLocaleString('es-CO') : 0}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">Código de 4 dígitos:</label>
              <Input
                type="text"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="Ej. 7482"
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value.replace(/\D/g, ''))}
                className="text-center text-2xl font-mono tracking-widest font-black h-14 rounded-xl"
                autoFocus
              />
            </div>

            <Button
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl gap-2 shadow-md"
              onClick={handleVerifyDeliveryPin}
              disabled={verifyingPin || enteredPin.length < 4}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{verifyingPin ? 'Validando...' : 'Confirmar Entrega'}</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DriverView;
