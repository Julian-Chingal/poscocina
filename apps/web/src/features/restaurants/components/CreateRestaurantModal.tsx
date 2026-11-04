import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Store, Phone, Mail, MapPin, Hash, Palette, AlertCircle } from 'lucide-react';
import { CreateCompanyPayload } from '../types/restaurants.types';
import { CreateRestaurantSchema, CreateRestaurantFormValues } from '../schemas/restaurants.schemas';
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

interface CreateRestaurantModalProps {
  isOpen: boolean;
  submitting: boolean;
  actionError: string | null;
  onClose: () => void;
  onSubmit: (payload: CreateCompanyPayload) => Promise<boolean>;
}

const BRAND_COLORS = [
  '#ea580c', // Orange (Default)
  '#e11d48', // Rose
  '#dc2626', // Red
  '#d97706', // Amber
  '#16a34a', // Green
  '#0d9488', // Teal
  '#2563eb', // Blue
  '#7c3aed', // Purple
  '#475569', // Slate
];

export const CreateRestaurantModal: React.FC<CreateRestaurantModalProps> = ({
  isOpen,
  submitting,
  actionError,
  onClose,
  onSubmit,
}) => {
  const form = useForm<CreateRestaurantFormValues>({
    resolver: zodResolver(CreateRestaurantSchema),
    defaultValues: {
      tradeName: '',
      legalName: '',
      taxId: '',
      slug: '',
      primaryColor: '#ea580c',
      phone: '',
      email: '',
      address: '',
      initialVenueName: 'Sede Principal',
      initialVenueAddress: '',
    },
  });

  const selectedColor = form.watch('primaryColor');

  const handleSubmit = form.handleSubmit(async (values) => {
    const success = await onSubmit({
      tradeName: values.tradeName,
      legalName: values.legalName,
      taxId: values.taxId,
      slug: values.slug ? values.slug.toLowerCase().trim() : undefined,
      primaryColor: values.primaryColor,
      phone: values.phone || undefined,
      email: values.email || undefined,
      address: values.address || undefined,
      initialVenueName: values.initialVenueName,
      initialVenueAddress: values.initialVenueAddress || undefined,
    });
    if (success) {
      form.reset();
      onClose();
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent maxWidth="lg" onClose={onClose} className="max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border"
            style={{
              backgroundColor: `${selectedColor}20`,
              borderColor: `${selectedColor}40`,
              color: selectedColor,
            }}
          >
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <DialogTitle className="text-lg font-bold">Nuevo Restaurante</DialogTitle>
            <DialogDescription className="text-xs">
              Registre una nueva empresa y su sede principal en el ecosistema
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tradeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Comercial *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Store className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground pointer-events-none" />
                        <Input {...field} placeholder="ej. Asados del Valle" className="pl-9" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="legalName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razón Social *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Building2 className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground pointer-events-none" />
                        <Input
                          {...field}
                          placeholder="ej. Inversiones Gastronómicas S.A.S"
                          className="pl-9"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="taxId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NIT / RUT *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Hash className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground pointer-events-none" />
                        <Input {...field} placeholder="ej. 901234567-1" className="pl-9 font-mono" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Identificador / Slug{' '}
                      <span className="text-muted-foreground font-normal">(Opcional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="ej. asados-del-valle"
                        className="font-mono text-xs"
                      />
                    </FormControl>
                    <FormDescription className="text-[11px]">
                      Se auto-generará si se deja vacío
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Brand Color Selector */}
            <div className="space-y-2">
              <FormLabel className="flex items-center gap-1.5 text-xs font-semibold">
                <Palette className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Color de Identidad de Marca</span>
              </FormLabel>
              <div className="flex items-center gap-2 flex-wrap">
                {BRAND_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => form.setValue('primaryColor', c)}
                    className={`w-7 h-7 rounded-xl transition cursor-pointer border-2 ${
                      selectedColor.toLowerCase() === c.toLowerCase()
                        ? 'border-foreground scale-110 shadow-sm'
                        : 'border-transparent opacity-80 hover:opacity-100 hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`Seleccionar color ${c}`}
                  />
                ))}
                <div className="flex items-center gap-1.5 ml-2">
                  <span className="text-xs text-muted-foreground font-mono">Hex:</span>
                  <Input
                    type="text"
                    maxLength={7}
                    value={selectedColor}
                    onChange={(e) => form.setValue('primaryColor', e.target.value)}
                    className="w-24 h-7 text-xs font-mono uppercase"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Teléfono de Contacto{' '}
                      <span className="text-muted-foreground font-normal">(Opcional)</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground pointer-events-none" />
                        <Input {...field} placeholder="ej. +57 300 123 4567" className="pl-9" />
                      </div>
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
                          placeholder="contacto@asados.com"
                          className="pl-9"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Dirección Principal{' '}
                    <span className="text-muted-foreground font-normal">(Opcional)</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground pointer-events-none" />
                      <Input
                        {...field}
                        placeholder="ej. Carrera 45 # 12-34, Bogotá"
                        className="pl-9"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Initial Venue Setup */}
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 space-y-3">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-primary" />
                <h4 className="text-xs font-bold text-foreground">
                  Configuración de la Primera Sede
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="initialVenueName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px]">Nombre de Sede *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="ej. Sede Principal / Centro" className="h-9 text-xs" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="initialVenueAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px]">Dirección de Sede</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="ej. Calle 85 # 11-50" className="h-9 text-xs" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" type="button" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting || form.formState.isSubmitting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              >
                {submitting ? 'Creando Restaurante...' : 'Crear Restaurante'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
