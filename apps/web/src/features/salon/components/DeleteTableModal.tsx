import React from 'react';
import { Trash2 } from 'lucide-react';
import { TableItem } from '../types/salon.types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Props {
  deleteTarget: TableItem | null;
  submitting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const DeleteTableModal: React.FC<Props> = ({
  deleteTarget,
  submitting,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent maxWidth="sm" onClose={onClose} className="text-center sm:text-center">
        <div className="w-12 h-12 rounded-full bg-destructive/15 border border-destructive/30 text-destructive flex items-center justify-center mx-auto mb-2">
          <Trash2 className="w-6 h-6" />
        </div>
        <DialogHeader className="text-center sm:text-center pr-0">
          <DialogTitle className="text-base font-bold">¿Eliminar Mesa?</DialogTitle>
          <DialogDescription className="text-xs">
            Estás a punto de eliminar <span className="text-foreground font-semibold">"{deleteTarget?.label}"</span>. Esta acción quitará la mesa del plano del salón.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="justify-center sm:justify-center mt-4">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={onConfirm}
            disabled={submitting}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold"
          >
            {submitting ? 'Eliminando...' : 'Sí, eliminar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteTableModal;
