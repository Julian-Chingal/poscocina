import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, AlertCircle } from 'lucide-react';
import { UserItem } from '../types/users.types';
import { ResetPinSchema, ResetPinFormValues } from '../schemas/users.schemas';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ResetPinModalProps {
  user: UserItem | null;
  submitting: boolean;
  actionError: string | null;
  onClose: () => void;
  onSubmit: (userId: string, pin: string, userName: string) => Promise<boolean>;
}

export const ResetPinModal: React.FC<ResetPinModalProps> = ({
  user,
  submitting,
  actionError,
  onClose,
  onSubmit,
}) => {
  const form = useForm<ResetPinFormValues>({
    resolver: zodResolver(ResetPinSchema),
    defaultValues: {
      newPin: '',
    },
  });

  if (!user) return null;

  const handleSubmit = form.handleSubmit(async (values) => {
    const success = await onSubmit(user.id, values.newPin, user.name);
    if (success) {
      form.reset();
      onClose();
    }
  });

  return (
    <Dialog open={Boolean(user)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent maxWidth="sm" onClose={onClose}>
        <DialogHeader className="text-center sm:text-center pr-0">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-3">
            <KeyRound className="w-7 h-7" />
          </div>
          <DialogTitle className="text-lg font-bold">Cambiar PIN</DialogTitle>
          <DialogDescription className="text-xs">
            Nuevo código PIN de 4 a 6 dígitos para <strong>{user.name}</strong>
          </DialogDescription>
        </DialogHeader>

        {actionError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="newPin"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      maxLength={6}
                      autoFocus
                      placeholder="••••"
                      className="py-3 text-center text-xl font-mono tracking-widest h-12 rounded-xl"
                      onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                    />
                  </FormControl>
                  <FormMessage className="text-center" />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button variant="ghost" type="button" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting || form.formState.isSubmitting}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
              >
                {submitting ? 'Guardando...' : 'Asignar PIN'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ResetPinModal;
