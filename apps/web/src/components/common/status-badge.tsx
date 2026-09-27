import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// 1. Table Status Badge
export type TableStatus =
  | 'free'
  | 'occupied'
  | 'check_requested'
  | 'paid_waiting_food'
  | 'reserved'
  | 'blocked';

const tableStatusConfig: Record<
  TableStatus,
  { label: string; variant: 'default' | 'outline' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info'; customClass?: string }
> = {
  free: { label: 'Libre', variant: 'success', customClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30' },
  occupied: { label: 'Ocupada', variant: 'warning', customClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30' },
  check_requested: { label: 'Cuenta Pedida', variant: 'secondary', customClass: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/40 animate-pulse' },
  paid_waiting_food: { label: 'Pagada (En Cocina)', variant: 'info', customClass: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30' },
  reserved: { label: 'Reservada', variant: 'outline', customClass: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30' },
  blocked: { label: 'Bloqueada', variant: 'secondary', customClass: 'bg-muted text-muted-foreground border-border/80' },
};

export const TableStatusBadge: React.FC<{
  status: TableStatus | string;
  className?: string;
}> = ({ status, className }) => {
  const config =
    tableStatusConfig[status as TableStatus] || {
      label: status,
      variant: 'secondary' as const,
    };

  return (
    <Badge
      variant={config.variant}
      className={cn('text-[10px] font-semibold', config.customClass, className)}
    >
      <span className="size-1.5 rounded-full bg-current mr-1 shrink-0" />
      <span>{config.label}</span>
    </Badge>
  );
};

// 2. Order Status Badge
export type OrderStatus =
  | 'open'
  | 'sent_to_kitchen'
  | 'partially_ready'
  | 'ready'
  | 'check_requested'
  | 'paid'
  | 'cancelled'
  | 'voided';

const orderStatusConfig: Record<
  OrderStatus,
  { label: string; variant: 'default' | 'outline' | 'secondary' | 'destructive' }
> = {
  open: { label: 'Abierta', variant: 'secondary' },
  sent_to_kitchen: { label: 'Enviada a Cocina', variant: 'secondary' },
  partially_ready: { label: 'Parcialmente Lista', variant: 'secondary' },
  ready: { label: 'Lista para Servir', variant: 'default' },
  check_requested: { label: 'Cuenta Pedida', variant: 'secondary' },
  paid: { label: 'Pagada', variant: 'default' },
  cancelled: { label: 'Cancelada', variant: 'destructive' },
  voided: { label: 'Anulada', variant: 'destructive' },
};

export const OrderStatusBadge: React.FC<{
  status: OrderStatus | string;
  className?: string;
}> = ({ status, className }) => {
  const config =
    orderStatusConfig[status as OrderStatus] || {
      label: status,
      variant: 'secondary' as const,
    };

  return (
    <Badge variant={config.variant} className={cn('text-[10px] font-semibold', className)}>
      <span className="size-1.5 rounded-full bg-current mr-1 shrink-0" />
      <span>{config.label}</span>
    </Badge>
  );
};

// 3. Item Preparation Status Badge
export type ItemStatus =
  | 'pending'
  | 'sent'
  | 'in_preparation'
  | 'ready'
  | 'delivered'
  | 'cancelled';

const itemStatusConfig: Record<
  ItemStatus,
  { label: string; variant: 'default' | 'outline' | 'secondary' | 'destructive' }
> = {
  pending: { label: 'Pendiente', variant: 'secondary' },
  sent: { label: 'Enviado', variant: 'secondary' },
  in_preparation: { label: 'En Preparación', variant: 'secondary' },
  ready: { label: 'Listo', variant: 'default' },
  delivered: { label: 'Entregado', variant: 'secondary' },
  cancelled: { label: 'Cancelado', variant: 'destructive' },
};

export const ItemStatusBadge: React.FC<{
  status: ItemStatus | string;
  className?: string;
}> = ({ status, className }) => {
  const config =
    itemStatusConfig[status as ItemStatus] || {
      label: status,
      variant: 'secondary' as const,
    };

  return (
    <Badge variant={config.variant} className={cn('text-[10px] font-semibold', className)}>
      <span>{config.label}</span>
    </Badge>
  );
};

// 4. Payment Status Badge
export type PaymentStatus = 'unpaid' | 'partially_paid' | 'paid';

const paymentStatusConfig: Record<
  PaymentStatus,
  { label: string; className: string }
> = {
  unpaid: {
    label: 'Por Cobrar',
    className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  },
  partially_paid: {
    label: 'Abonado',
    className: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
  },
  paid: {
    label: 'Pagado',
    className: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  },
};

export const PaymentStatusBadge: React.FC<{
  status?: PaymentStatus | string;
  className?: string;
}> = ({ status = 'unpaid', className }) => {
  const config =
    paymentStatusConfig[status as PaymentStatus] || {
      label: status,
      className: 'bg-muted text-muted-foreground border-border',
    };

  return (
    <Badge
      variant="outline"
      className={cn('text-[10px] font-bold tracking-wide uppercase', config.className, className)}
    >
      <span>{config.label}</span>
    </Badge>
  );
};
