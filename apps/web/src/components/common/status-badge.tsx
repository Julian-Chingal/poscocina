import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// 1. Table Status Badge
export type TableStatus =
  | 'free'
  | 'occupied'
  | 'check_requested'
  | 'reserved'
  | 'blocked';

const tableStatusConfig: Record<
  TableStatus,
  { label: string; variant: 'default' | 'outline' | 'secondary' | 'destructive' }
> = {
  free: { label: 'Libre', variant: 'default' },
  occupied: { label: 'Ocupada', variant: 'destructive' },
  check_requested: { label: 'Cuenta Pedida', variant: 'secondary' },
  reserved: { label: 'Reservada', variant: 'outline' },
  blocked: { label: 'Bloqueada', variant: 'secondary' },
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
    <Badge variant={config.variant} className={cn('text-[10px] font-semibold', className)}>
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
