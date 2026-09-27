import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Store, AlertCircle, MapPin, Phone, Clock, User, Building, FileText, Sparkles } from 'lucide-react';
import { VenueItem } from '@/stores/branding.store';
import { NewVenuePayload, UpdateVenuePayload } from '../types/settings.types';
import { NewVenueSchema, NewVenueFormValues } from '../schemas/settings.schemas';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface Props {
  isOpen: boolean;
  isSaving: boolean;
  editingVenue: VenueItem | null;
  error?: string;
  onClose: () => void;
  onCreate: (payload: NewVenuePayload) => void;
  onUpdate: (id: string, payload: UpdateVenuePayload) => void;
}

export const VenueModal: React.FC<Props> = ({
  isOpen,
  isSaving,
  editingVenue,
  error,
  onClose,
  onCreate,
  onUpdate,
}) => {
  const isEditing = !!editingVenue;

  const form = useForm<NewVenueFormValues>({
    resolver: zodResolver(NewVenueSchema),
    defaultValues: {
      name: '',
      slug: '',
      address: '',
      phone: '',
      city: '',
      managerName: '',
      openingHours: '',
      notes: '',
      timezone: 'America/Bogota',
    },
  });

  // Populate or reset form when modal opens or editingVenue changes
  useEffect(() => {
    if (isOpen) {
      if (editingVenue) {
        const settings = (editingVenue.settings || {}) as Record<string, any>;
        form.reset({
          name: editingVenue.name || '',
          slug: editingVenue.slug || settings.slug || '',
          address: editingVenue.address || '',
          phone: editingVenue.phone || settings.phone || '',
          city: settings.city || '',
          managerName: settings.managerName || '',
          openingHours: settings.openingHours || '',
          notes: settings.notes || '',
          timezone: 'America/Bogota',
        });
      } else {
        form.reset({
          name: '',
          slug: '',
          address: '',
          phone: '',
          city: '',
          managerName: '',
          openingHours: 'Lun - Dom: 11:30 AM - 10:00 PM',
          notes: '',
          timezone: 'America/Bogota',
        });
      }
    }
  }, [isOpen, editingVenue, form]);

  const handleNameChange = (val: string) => {
    form.setValue('name', val);
    // Auto-generate slug only when creating a new venue and slug hasn't been manually tailored
    if (!isEditing) {
      const currentSlug = form.getValues('slug');
      if (!currentSlug || currentSlug.trim() === '' || currentSlug.startsWith('sede-')) {
        const generated = val
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');
        form.setValue('slug', generated ? (generated.startsWith('sede-') ? generated : `sede-${generated}`) : '');
      }
    }
  };

  const onSubmit = form.handleSubmit((values) => {
    const payload = {
      name: values.name.trim(),
      slug: values.slug.trim(),
      address: values.address?.trim() || '',
      phone: values.phone?.trim() || '',
      city: values.city?.trim() || '',
      managerName: values.managerName?.trim() || '',
      openingHours: values.openingHours?.trim() || '',
      notes: values.notes?.trim() || '',
      timezone: values.timezone?.trim() || 'America/Bogota',
    };

    if (isEditing && editingVenue) {
      onUpdate(editingVenue.id, payload);
    } else {
      onCreate(payload);
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent maxWidth="2xl" onClose={onClose} className="p-0 overflow-hidden">
        {/* Header with visual branding */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-5 border-b border-border/80">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2.5 text-lg font-bold text-foreground">
              <div className="w-9 h-9 rounded-xl bg-primary/20 text-primary flex items-center justify-center shadow-sm">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <span>{isEditing ? 'Editar Sucursal' : 'Nueva Sucursal de la Cadena'}</span>
                <p className="text-xs font-normal text-muted-foreground mt-0.5">
                  {isEditing
                    ? `Modifica los datos operativos y de contacto de "${editingVenue?.name}".`
                    : 'Registra un nuevo punto de venta para expandir la operación de tu negocio.'}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="px-6 py-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 mb-4 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <Form {...form}>
            <form id="venue-modal-form" onSubmit={onSubmit} className="space-y-5">
              {/* Section 1: Identidad de la Sede */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-primary tracking-wide">
                  <Building className="w-3.5 h-3.5" />
                  <span>IDENTIDAD & CÓDIGO</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Nombre de la Sede *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ej. Sede El Poblado / Sede Norte"
                            onChange={(e) => handleNameChange(e.target.value)}
                            className="text-xs h-9"
                          />
                        </FormControl>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold flex items-center justify-between">
                          <span>Slug URL / Código *</span>
                          <span className="text-[10px] text-muted-foreground font-mono font-normal">único</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-mono">
                              /
                            </span>
                            <Input
                              {...field}
                              placeholder="sede-el-poblado"
                              className="font-mono text-xs pl-6 h-9"
                              onChange={(e) => field.onChange(e.target.value.toLowerCase())}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Section 2: Ubicación & Contacto */}
              <div className="space-y-3 pt-2 border-t border-border/60">
                <div className="flex items-center gap-2 text-xs font-bold text-primary tracking-wide">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>UBICACIÓN & CONTACTO</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">Dirección Física</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Cra. 43A # 1-50, Local 102"
                              className="text-xs h-9"
                            />
                          </FormControl>
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Ciudad / Sector</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Medellín / Poblado"
                            className="text-xs h-9"
                          />
                        </FormControl>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          <span>Teléfono / WhatsApp</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="+57 300 987 6543"
                            className="text-xs h-9"
                          />
                        </FormControl>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="managerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold flex items-center gap-1.5">
                          <User className="w-3 h-3 text-muted-foreground" />
                          <span>Administrador / Encargado</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Nombre del responsable de sede"
                            className="text-xs h-9"
                          />
                        </FormControl>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Section 3: Operación & Horarios */}
              <div className="space-y-3 pt-2 border-t border-border/60">
                <div className="flex items-center gap-2 text-xs font-bold text-primary tracking-wide">
                  <Clock className="w-3.5 h-3.5" />
                  <span>OPERACIÓN & HORARIOS</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <FormField
                    control={form.control}
                    name="openingHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Horario de Atención</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Lun - Dom: 11:30 AM - 10:00 PM"
                            className="text-xs h-9"
                          />
                        </FormControl>
                        <FormDescription className="text-[10px] text-muted-foreground">
                          Visible en comandas, facturas o turnos.
                        </FormDescription>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Zona Horaria</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="America/Bogota"
                            className="text-xs h-9 font-mono"
                          />
                        </FormControl>
                        <FormDescription className="text-[10px] text-muted-foreground">
                          Ajuste de hora oficial para turnos y ventas.
                        </FormDescription>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold flex items-center gap-1.5">
                        <FileText className="w-3 h-3 text-muted-foreground" />
                        <span>Notas u Observaciones Operativas</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={2}
                          placeholder="Instrucciones internas, referencias de acceso para domicilios o políticas particulares de este punto..."
                          className="text-xs resize-none"
                        />
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>

        <DialogFooter className="px-6 py-4 bg-muted/20 border-t border-border flex items-center justify-between sm:justify-between">
          <Button variant="ghost" type="button" onClick={onClose} disabled={isSaving} className="text-xs">
            Cancelar
          </Button>

          <Button
            type="submit"
            form="venue-modal-form"
            disabled={isSaving || form.formState.isSubmitting}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs px-5 shadow-md shadow-primary/20 cursor-pointer"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                {isEditing ? 'Guardando...' : 'Creando Sede...'}
              </span>
            ) : isEditing ? (
              'Guardar Cambios'
            ) : (
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Crear Sede
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VenueModal;
