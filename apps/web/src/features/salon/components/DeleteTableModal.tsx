import React from 'react';
import { Trash2 } from 'lucide-react';
import { TableItem } from '../types/salon.types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
    <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-sm text-center sm:text-center">
        <div className="w-12 h-12 rounded-full bg-destructive/15 border border-destructive/30 text-destructive flex items-center justify-center mx-auto mb-2">
          <Trash2 className="w-6 h-6" />
        </div>
        <AlertDialogHeader className="text-center sm:text-center pr-0">
          <AlertDialogTitle className="text-base font-bold">¿Eliminar Mesa?</AlertDialogTitle>
          <AlertDialogDescription className="text-xs">
            Estás a punto de eliminar <span className="text-foreground font-semibold">"{deleteTarget?.label}"</span>. Esta acción quitará la mesa del plano del salón.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="justify-center sm:justify-center mt-4 gap-2">
          <AlertDialogCancel onClick={onClose} disabled={submitting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={submitting}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold"
          >
            {submitting ? 'Eliminando...' : 'Sí, eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteTableModal;
