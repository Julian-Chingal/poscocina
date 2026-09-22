import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus, KeyRound, Mail, Lock, AlertCircle } from 'lucide-react';
import { RoleItem, CreateUserPayload } from '../types/users.types';
import { CreateUserSchema, CreateUserFormValues } from '../schemas/users.schemas';
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
import { Select } from '@/components/common/native-select';
import { Button } from '@/components/ui/button';

interface CreateUserModalProps {
  isOpen: boolean;
  roles: RoleItem[];
  submitting: boolean;
  actionError: string | null;
  onClose: () => void;
  onSubmit: (payload: CreateUserPayload) => Promise<boolean>;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  roles,
  submitting,
  actionError,
  onClose,
  onSubmit,
}) => {
  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: {
      name: '',
      email: '',
      roleId: roles[0]?.id || '',
      pin: '',
      password: '',
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    const success = await onSubmit({
      name: values.name,
      roleId: values.roleId,
      pin: values.pin,
      email: values.email || undefined,
      password: values.password || undefined,
    });
    if (success) {
      form.reset();
      onClose();
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent maxWidth="md" onClose={onClose}>
        <DialogHeader className="flex flex-row items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center shrink-0">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <DialogTitle className="text-lg font-bold">Nuevo Empleado</DialogTitle>
            <DialogDescription className="text-xs">
              Asigne nombre, rol y clave PIN táctil de acceso
            </DialogDescription>
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
                    <Input {...field} placeholder="ej. Laura Sánchez" />
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
                  <FormLabel>Rol en el Restaurante *</FormLabel>
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
              name="pin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PIN Numérico (4-6 dígitos) *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground pointer-events-none" />
                      <Input
                        {...field}
                        type="password"
                        maxLength={6}
                        placeholder="ej. 4567"
                        className="pl-9 font-mono tracking-widest"
                        onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>Clave táctil para comandas y terminales</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Correo Electrónico{' '}
                    <span className="text-muted-foreground font-normal">(Opcional)</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground pointer-events-none" />
                      <Input
                        {...field}
                        type="email"
                        placeholder="laura@poscocina.com"
                        className="pl-9"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Contraseña Maestra{' '}
                    <span className="text-muted-foreground font-normal">(Si tiene correo)</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground pointer-events-none" />
                      <Input
                        {...field}
                        type="password"
                        placeholder="••••••••"
                        className="pl-9"
                      />
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
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              >
                {submitting ? 'Guardando...' : 'Guardar Empleado'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserModal;
