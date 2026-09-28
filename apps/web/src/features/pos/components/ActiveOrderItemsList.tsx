import React, { useState } from 'react';
import { ChefHat, Edit3, Trash2, AlertTriangle, CheckCircle2, Clock, Flame, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { posApi } from '../api/pos.api';
import { ManagerPinAuthModal } from './ManagerPinAuthModal';

interface ActiveOrderItemsListProps {
  order: any;
  onRefreshOrder: () => void;
}

export const ActiveOrderItemsList: React.FC<ActiveOrderItemsListProps> = ({ order, onRefreshOrder }) => {
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [itemToVoid, setItemToVoid] = useState<any | null>(null);
  const [newNotes, setNewNotes] = useState<string>('');
  const [newQuantity, setNewQuantity] = useState<number>(1);
  const [isConsultingKitchen, setIsConsultingKitchen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const items = order?.items || [];
  if (items.length === 0) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
      case 'sent':
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 text-[10px] gap-1">
            <Clock className="size-2.5" />
            En cola
          </Badge>
        );
      case 'in_preparation':
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] gap-1">
            <Flame className="size-2.5" />
            En preparación
          </Badge>
        );
      case 'ready':
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] gap-1">
            <CheckCircle2 className="size-2.5" />
            ¡Listo!
          </Badge>
        );
      case 'delivered':
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-[10px] gap-1">
            <UtensilsCrossed className="size-2.5" />
            Servido
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px]">
            {status}
          </Badge>
        );
    }
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setNewNotes(item.notes || '');
    setNewQuantity(item.quantity || 1);
    const isAdvanced = ['in_preparation', 'ready', 'delivered'].includes(item.status);
    setIsConsultingKitchen(isAdvanced);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    setIsSubmitting(true);
    try {
      await posApi.modifyOrderItem(editingItem.id, {
        notes: newNotes,
        quantity: newQuantity,
        kitchenApproved: isConsultingKitchen,
      });
      toast.success('Ítem actualizado correctamente en comanda');
      setEditingItem(null);
      onRefreshOrder();
    } catch (err: any) {
      if (err.statusCode === 409 || err.response?.status === 409) {
        toast.error(err.message || 'El ítem ya se encuentra en preparación o despachado; consulte con cocina.');
      } else {
        toast.error(err.message || 'Error al actualizar el ítem');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = (item: any) => {
    setItemToVoid(item);
  };

  const handleAuthorizedVoid = async (authInfo: { managerId: string; managerName: string; reason: string }) => {
    if (!itemToVoid) return;
    const isAdvanced = ['in_preparation', 'ready', 'delivered'].includes(itemToVoid.status);

    try {
      await posApi.deleteOrderItem(itemToVoid.id, isAdvanced);
      toast.success(`Ítem eliminado. Autorizado por: ${authInfo.managerName}`);
      setItemToVoid(null);
      onRefreshOrder();
    } catch (err: any) {
      if (err.statusCode === 409 || err.response?.status === 409) {
        toast.error(err.message || 'El ítem ya se encuentra en preparación o despachado; consulte con cocina.');
      } else {
        toast.error(err.message || 'Error al eliminar el ítem');
      }
    }
  };

  return (
    <div className="space-y-2 mt-3 pt-3 border-t border-border/80">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <ChefHat className="size-3.5 text-primary" />
          En Comanda / Cocina ({items.length})
        </span>
      </div>

      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
        {items.map((item: any) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-2 rounded-lg bg-background border border-border/70 text-xs gap-2"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-foreground truncate">
                  {item.quantity}x {item.product?.name || 'Producto'}
                </span>
                {getStatusBadge(item.status)}
              </div>
              {item.notes && (
                <p className="text-[11px] text-muted-foreground truncate mt-0.5 italic">
                  Nota: {item.notes}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                title="Editar / Cambiar ítem"
                onClick={() => handleOpenEdit(item)}
                className="size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <Edit3 className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                title="Eliminar de comanda"
                onClick={() => handleDeleteItem(item)}
                className="size-7 rounded-md text-destructive/80 hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Item Modal */}
      {editingItem && (
        <Dialog open={Boolean(editingItem)} onOpenChange={(open) => !open && setEditingItem(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Edit3 className="size-4 text-primary" />
                Modificar Ítem en Comanda
              </DialogTitle>
              <DialogDescription className="text-xs">
                Modifica notas o cantidad para <strong>{editingItem.product?.name}</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              {isConsultingKitchen && (
                <div className="p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 flex items-start gap-2">
                  <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    El ítem ya está <strong>{editingItem.status}</strong>. Solo debe modificarse si cocina lo autoriza para recalcular la orden.
                  </span>
                </div>
              )}

              <div>
                <label className="font-semibold block mb-1">Cantidad</label>
                <Input
                  type="number"
                  min={1}
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(parseInt(e.target.value) || 1)}
                  className="h-8 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Notas para cocina</label>
                <Input
                  type="text"
                  placeholder="ej. sin cebolla, término medio..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingItem(null)}
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isSubmitting}
                onClick={handleSaveEdit}
                className="text-xs font-bold bg-primary text-primary-foreground"
              >
                {isSubmitting ? 'Guardando...' : 'Aplicar Modificación'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Manager PIN Authorization Modal */}
      <ManagerPinAuthModal
        isOpen={Boolean(itemToVoid)}
        item={itemToVoid}
        venueId={order?.venueId}
        onClose={() => setItemToVoid(null)}
        onSuccess={handleAuthorizedVoid}
      />
    </div>
  );
};
