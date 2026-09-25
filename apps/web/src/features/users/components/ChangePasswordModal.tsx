import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { UserItem } from '../types/users.types';
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
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const ChangePasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type ChangePasswordFormValues = z.infer<typeof ChangePasswordSchema>;

interface ChangePasswordModalProps {
  user: UserItem | null;
  submitting: boolean;
  actionError: string | null;
  onClose: () => void;
  onSubmit: (userId: string, newPassword: string, userName: string) => Promise<boolean>;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  user,
  submitting,
  actionError,
  onClose,
  onSubmit,
}) => {
  const [showNew, setShowNew] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({ newPassword: '', confirmPassword: '' });
      setShowNew(false);
      setShowConfirm(false);
    }
  }, [user, form]);

  if (!user) return null;

  const handleSubmit = form.handleSubmit(async (values) => {
    const success = await onSubmit(user.id, values.newPassword, user.name);
    if (success) {
      onClose();
    }
  });

  return (
    <Dialog open={Boolean(user)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent maxWidth="sm" onClose={onClose}>
        <DialogHeader className="flex flex-row items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <DialogTitle className="text-lg font-bold">Cambiar Contraseña</DialogTitle>
            <DialogDescription className="text-xs">{user.name}</DialogDescription>
          </div>
        </DialogHeader>

        {actionError && (
          <div className="mb-4 p-3 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nueva Contraseña *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground pointer-events-none" />
                      <Input
                        {...field}
                        type={showNew ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-9 pr-9 font-mono tracking-widest"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowNew((v) => !v)}
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition"
                      >
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormDescription>Mínimo 6 caracteres</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Contraseña *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground pointer-events-none" />
                      <Input
                        {...field}
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-9 pr-9 font-mono tracking-widest"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition"
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
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
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold"
              >
                {submitting ? 'Guardando...' : 'Cambiar Contraseña'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordModal;
