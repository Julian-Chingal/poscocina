import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  UserPlus,
  KeyRound,
  Mail,
  Lock,
  AlertCircle,
  CreditCard,
  RefreshCw,
  Copy,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { restaurantsApi } from '@/features/restaurants/api/restaurants.api';
import { CompanyItem } from '@/features/restaurants/types/restaurants.types';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export function generateSecurePassword(length = 10): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%*';

  const pwd = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ];

  const allChars = upper + lower + digits + symbols;
  for (let i = 4; i < length; i++) {
    pwd.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }

  return pwd.sort(() => Math.random() - 0.5).join('');
}

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
  const currentUser = useAuthStore((s) => s.currentUser);
  const isSuperAdmin = currentUser?.roleName === 'super_admin';

  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [showPasswordText, setShowPasswordText] = useState(true);

  // Filter roles: only super admin can see and create super_admin
  const availableRoles = useMemo(() => {
    if (isSuperAdmin) return roles;
    return roles.filter((r) => r.name !== 'super_admin');
  }, [roles, isSuperAdmin]);

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: {
      name: '',
      documentNumber: '',
      email: '',
      roleId: availableRoles[0]?.id || '',
      pin: '',
      password: '',
      companyId: '',
      venueId: '',
    },
  });

  const selectedRoleId = form.watch('roleId');
  const selectedRole = roles.find((r) => r.id === selectedRoleId);
  const isManagerRole = selectedRole?.name === 'manager' || selectedRole?.name === 'super_admin';

  // Load companies for super admin when modal opens
  useEffect(() => {
    if (isOpen && isSuperAdmin) {
      restaurantsApi
        .getCompanies()
        .then((data) => setCompanies(data || []))
        .catch((err) => console.error('Error fetching restaurants:', err));
    }
  }, [isOpen, isSuperAdmin]);

  // Set default roleId once availableRoles loads
  useEffect(() => {
    if (availableRoles.length > 0 && !form.getValues('roleId')) {
      form.setValue('roleId', availableRoles[0].id);
    }
  }, [availableRoles, form]);

  // Auto-generate password when a manager or super admin role is selected
  useEffect(() => {
    if (isManagerRole && !form.getValues('password')) {
      form.setValue('password', generateSecurePassword());
    } else if (!isManagerRole) {
      form.setValue('email', '');
      form.setValue('password', '');
    }
  }, [isManagerRole, form]);

  const handleCopyPassword = () => {
    const pwd = form.getValues('password');
    if (pwd) {
      navigator.clipboard.writeText(pwd);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  const handleRegeneratePassword = () => {
    const newPass = generateSecurePassword();
    form.setValue('password', newPass);
    setCopiedPassword(false);
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    if (isSuperAdmin && selectedRole?.name !== 'super_admin' && !values.companyId) {
      form.setError('companyId', { message: 'Debes seleccionar un restaurante' });
      return;
    }

    const payload: CreateUserPayload = {
      name: values.name,
      documentNumber: values.documentNumber,
      roleId: values.roleId,
      pin: values.pin,
      email: isManagerRole ? (values.email || undefined) : undefined,
      password: isManagerRole ? (values.password || undefined) : undefined,
      companyId: isSuperAdmin
        ? (values.companyId && values.companyId !== 'none' ? values.companyId : undefined)
        : (currentUser?.companyId || undefined),
      venueId: isSuperAdmin ? values.venueId : undefined,
    };

    const success = await onSubmit(payload);
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
            <DialogTitle className="text-lg font-bold">Nuevo Usuario</DialogTitle>
            <DialogDescription className="text-xs">
              Asigne nombre, cédula, rol y credenciales de acceso
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
            {/* Restaurant Selector - Only for Super Admin */}
            {isSuperAdmin && (
              <FormField
                control={form.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Restaurante / Empresa *</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                        const comp = companies.find((c) => c.id === val);
                        if (comp?.venues?.[0]?.id) {
                          form.setValue('venueId', comp.venues[0].id);
                        }
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10 text-sm rounded-xl bg-background">
                          <SelectValue placeholder="Seleccionar restaurante" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectedRole?.name === 'super_admin' && (
                          <SelectItem value="none">
                            Global (Acceso a todos los restaurantes)
                          </SelectItem>
                        )}
                        {companies.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.tradeName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs">
                      Restaurante al que pertenecerá este usuario
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
              name="documentNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Cédula / Documento *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground pointer-events-none" />
                      <Input
                        {...field}
                        placeholder="ej. 10203040"
                        className="pl-9 font-mono"
                        autoComplete="off"
                      />
                    </div>
                  </FormControl>
                  <FormDescription>Identificación para inicio de sesión en terminal</FormDescription>
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

            {/* Email and Generated Password - Only for Managers and Super Admin */}
            {isManagerRole && (
              <div className="p-4 bg-muted/40 border border-border rounded-2xl space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Correo Electrónico * <span className="text-muted-foreground font-normal">(Acceso web)</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground pointer-events-none" />
                          <Input
                            {...field}
                            type="email"
                            placeholder="gerente@restaurante.com"
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
                      <div className="flex items-center justify-between">
                        <FormLabel>Contraseña Generada Automáticamente</FormLabel>
                        <div className="flex items-center gap-1.5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRegeneratePassword}
                            className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Regenerar</span>
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={handleCopyPassword}
                            className="h-7 px-2.5 text-xs gap-1 font-semibold"
                          >
                            {copiedPassword ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-500" />
                                <span className="text-emerald-500 font-bold">¡Copiada!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copiar</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Lock className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground pointer-events-none" />
                          <Input
                            {...field}
                            type={showPasswordText ? 'text' : 'password'}
                            readOnly
                            className="pl-9 pr-9 font-mono font-medium tracking-wide bg-background select-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswordText(!showPasswordText)}
                            className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                          >
                            {showPasswordText ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormDescription className="text-xs">
                        Esta contraseña se entrega al usuario para su primer inicio de sesión web.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <DialogFooter>
              <Button variant="ghost" type="button" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting || form.formState.isSubmitting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              >
                {submitting ? 'Guardando...' : 'Guardar Usuario'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserModal;
