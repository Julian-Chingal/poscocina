import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit2, AlertCircle } from 'lucide-react';
import { UserItem, RoleItem, UpdateUserPayload } from '../types/users.types';
import { EditUserSchema, EditUserFormValues } from '../schemas/users.schemas';
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
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/common/native-select';
import { Button } from '@/components/ui/button';

interface EditUserModalProps {
  user: UserItem | null;
  roles: RoleItem[];
  submitting: boolean;
  actionError: string | null;
  onClose: () => void;
  onSubmit: (userId: string, payload: UpdateUserPayload) => Promise<boolean>;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  user,
  roles,
  submitting,
  actionError,
  onClose,
  onSubmit,
}) => {
  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(EditUserSchema),
    defaultValues: {
      name: '',
      email: '',
      roleId: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email || '',
        roleId: user.roleId,
        isActive: user.isActive,
      });
    }
  }, [user, form]);

  if (!user) return null;

  const handleSubmit = form.handleSubmit(async (values) => {
    const success = await onSubmit(user.id, {
      name: values.name,
      email: values.email || undefined,
      roleId: values.roleId,
      isActive: values.isActive,
    });
    if (success) {
      onClose();
    }
  });

  return (
    <Dialog open={Boolean(user)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent maxWidth="md" onClose={onClose}>
        <DialogHeader className="flex flex-row items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center shrink-0">
            <Edit2 className="w-6 h-6" />
          </div>
          <div>
            <DialogTitle className="text-lg font-bold">Editar Empleado</DialogTitle>
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol Asignado *</FormLabel>
                  <FormControl>
                    <Select {...field}>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.label} ({r.name})
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" />
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
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              >
                {submitting ? 'Actualizando...' : 'Actualizar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserModal;
