import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit2, AlertCircle, CreditCard, Mail } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

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
  const currentUser = useAuthStore((s) => s.currentUser);
  const isSuperAdmin = currentUser?.roleName === 'super_admin';

  // Filter roles: only super admin can assign super_admin
  const availableRoles = useMemo(() => {
    if (isSuperAdmin) return roles;
    return roles.filter((r) => r.name !== 'super_admin');
  }, [roles, isSuperAdmin]);

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(EditUserSchema),
    defaultValues: {
      name: '',
      documentNumber: '',
      email: '',
      roleId: '',
      isActive: true,
    },
  });

  const selectedRoleId = form.watch('roleId');
  const selectedRole = roles.find((r) => r.id === selectedRoleId);
  const isManagerRole = selectedRole?.name === 'manager' || selectedRole?.name === 'super_admin';

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        documentNumber: user.documentNumber || '',
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
      documentNumber: values.documentNumber || undefined,
      email: isManagerRole ? (values.email || undefined) : undefined,
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
            <DialogTitle className="text-lg font-bold">Editar Usuario</DialogTitle>
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
              name="documentNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Cédula / Documento</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground pointer-events-none" />
                      <Input
                        {...field}
                        placeholder="ej. 10203040"
                        className="pl-9 font-mono"
                      />
                    </div>
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10 text-sm rounded-xl bg-background">
                        <SelectValue placeholder="Seleccionar rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableRoles.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email - only for Manager and Super Admin */}
            {isManagerRole && (
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Correo Electrónico <span className="text-muted-foreground font-normal">(Acceso web)</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground pointer-events-none" />
                        <Input {...field} type="email" className="pl-9" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3 shadow-2xs">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-semibold text-foreground">
                      Estado Activo
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Permite al usuario operar terminales e iniciar sesión.
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
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
                {submitting ? 'Actualizando...' : 'Guardar Cambios'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserModal;
