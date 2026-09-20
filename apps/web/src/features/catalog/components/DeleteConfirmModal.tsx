import React from 'react';
import { Trash2 } from 'lucide-react';
import { DeleteTarget } from '../types/catalog.types';
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
  deleteTarget: DeleteTarget | null;
  submitting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const DeleteConfirmModal: React.FC<Props> = ({
  deleteTarget,
  submitting,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent maxWidth="sm" onClose={onClose} className="text-center sm:text-center">
        <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto mb-2">
          <Trash2 className="w-6 h-6" />
        </div>
        <DialogHeader className="text-center sm:text-center pr-0">
          <DialogTitle className="text-base font-bold">
            ¿Eliminar {deleteTarget?.type === 'category' ? 'categoría' : 'producto'}?
          </DialogTitle>
          <DialogDescription className="text-xs">
            Estás a punto de eliminar <span className="text-white font-semibold">"{deleteTarget?.name}"</span>. Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="justify-center sm:justify-center mt-4">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold"
          >
            {submitting ? 'Eliminando...' : 'Sí, eliminar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmModal;
