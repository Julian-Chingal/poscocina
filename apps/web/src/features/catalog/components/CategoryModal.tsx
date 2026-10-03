import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Layers, ChefHat, Coffee, Cake, Check } from 'lucide-react';
import { Category } from '../types/catalog.types';
import { CategorySchema, CategoryFormValues } from '../schemas/catalog.schemas';
import { PRESET_COLORS, PRINTER_STATION_OPTIONS } from '../constants/catalog.constants';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface Props {
  isOpen: boolean;
  editingCategory: Category | null;
  totalCategories: number;
  submitting: boolean;
  formError?: string | null;
  onClose: () => void;
  onSubmit: (data: CategoryFormValues) => Promise<void>;
}

export const CategoryModal: React.FC<Props> = ({
  isOpen,
  editingCategory,
  totalCategories,
  submitting,
  formError,
  onClose,
  onSubmit,
}) => {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: '',
      color: '#3b82f6',
      printerStation: 'kitchen',
      sortOrder: totalCategories,
    },
  });

  const selectedColor = form.watch('color') || '#3b82f6';
  const categoryName = form.watch('name') || '';

  useEffect(() => {
    if (editingCategory) {
      form.reset({
        name: editingCategory.name,
        color: editingCategory.color || '#3b82f6',
        printerStation: editingCategory.printerStation || 'kitchen',
        sortOrder: editingCategory.sortOrder || 0,
      });
    } else {
      form.reset({
        name: '',
        color: '#3b82f6',
        printerStation: 'kitchen',
        sortOrder: totalCategories,
      });
    }
  }, [editingCategory, totalCategories, isOpen, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  const getStationIcon = (station: string) => {
    switch (station) {
      case 'bar':
        return <Coffee className="size-3.5 text-amber-500" />;
      case 'dessert':
        return <Cake className="size-3.5 text-pink-500" />;
      default:
        return <ChefHat className="size-3.5 text-primary" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent maxWidth="md" onClose={onClose} className="p-0 overflow-hidden rounded-2xl border-border/80 shadow-2xl">
        {/* Modal Top Accent Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/70 bg-gradient-to-b from-muted/40 to-transparent">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center size-10 rounded-xl shadow-2xs ring-1 ring-border/80 transition-colors"
              style={{
                backgroundColor: `${selectedColor}18`,
                color: selectedColor,
              }}
            >
              <Layers className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-foreground tracking-tight">
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Organiza tu carta gastronómica por familias de productos.
              </p>
            </div>
          </div>
        </DialogHeader>

        {formError && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs font-semibold">
            {formError}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
            {/* Category Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-foreground">
                    Nombre de la Categoría <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoFocus
                      placeholder="Ej. Entradas, Arepas Rellenas, Cocteles..."
                      className="h-10 text-sm rounded-xl bg-muted/30 border-border/80 focus:bg-card focus:border-primary/80 transition-all font-medium"
                    />
                  </FormControl>
                  <FormMessage className="text-xs font-medium" />
                </FormItem>
              )}
            />

            {/* Color Picker with Live Preview */}
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-xs font-bold text-foreground">
                      Color Distintivo
                    </FormLabel>
                    {/* Live Preview Chip */}
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                      <span>Vista previa:</span>
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-black shadow-2xs border transition-all"
                        style={{
                          backgroundColor: `${field.value}15`,
                          borderColor: `${field.value}30`,
                          color: field.value,
                        }}
                      >
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: field.value }}
                        />
                        <span>{categoryName.trim() || 'Nombre'}</span>
                      </span>
                    </div>
                  </div>

                  <FormControl>
                    <div className="flex items-center gap-2.5 pt-1.5 flex-wrap">
                      {PRESET_COLORS.map((col) => {
                        const isSelected = field.value === col;
                        return (
                          <button
                            key={col}
                            type="button"
                            onClick={() => field.onChange(col)}
                            title={`Seleccionar color ${col}`}
                            className={`size-7 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
                              isSelected
                                ? 'scale-115 ring-2 ring-foreground ring-offset-2 ring-offset-background'
                                : 'opacity-80 hover:opacity-100 hover:scale-105'
                            }`}
                            style={{ backgroundColor: col }}
                          >
                            {isSelected && <Check className="size-3.5 text-white drop-shadow-xs stroke-[3]" />}
                          </button>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs font-medium" />
                </FormItem>
              )}
            />

            {/* Preparation Station Select */}
            <FormField
              control={form.control}
              name="printerStation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-foreground">
                    Estación de Preparación Predeterminada
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10 rounded-xl bg-muted/30 border-border/80 text-xs font-semibold">
                        <div className="flex items-center gap-2">
                          {getStationIcon(field.value)}
                          <SelectValue placeholder="Seleccionar estación" />
                        </div>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl border-border/80">
                      {PRINTER_STATION_OPTIONS.map((opt) => (
                        <SelectItem
                          key={opt.value}
                          value={opt.value}
                          className="text-xs font-semibold cursor-pointer py-2"
                        >
                          <div className="flex items-center gap-2">
                            {getStationIcon(opt.value)}
                            <span>{opt.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-[11px] text-muted-foreground leading-tight">
                    Los nuevos platos creados bajo esta categoría enviarán sus comandas a esta estación por defecto.
                  </FormDescription>
                  <FormMessage className="text-xs font-medium" />
                </FormItem>
              )}
            />

            {/* Dialog Footer Actions */}
            <DialogFooter className="pt-2 border-t border-border/70 flex items-center justify-end gap-2.5">
              <Button
                variant="outline"
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="h-9 px-4 rounded-xl text-xs font-semibold border-border/80 hover:bg-muted"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting || form.formState.isSubmitting}
                className="h-9 px-5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-xs hover:shadow-primary/25 cursor-pointer"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="size-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    <span>Guardando...</span>
                  </span>
                ) : (
                  <span>Guardar Categoría</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryModal;
