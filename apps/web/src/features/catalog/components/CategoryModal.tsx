import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Layers } from 'lucide-react';
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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/common/native-select';
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent maxWidth="md" onClose={onClose}>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <span>{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</span>
          </DialogTitle>
        </DialogHeader>

        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs">
            {formError}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Categoría *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ej. Entradas, Platos Fuertes, Bebidas..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color Distintivo</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2 pt-1">
                      {PRESET_COLORS.map((col) => (
                        <Button
                          key={col}
                          type="button"
                          variant="ghost"
                          onClick={() => field.onChange(col)}
                          className={`w-6 h-6 p-0 min-w-0 rounded-full transition-transform cursor-pointer ${
                            field.value === col
                              ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900'
                              : 'opacity-80 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: col }}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="printerStation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estación de Preparación Predeterminada</FormLabel>
                  <FormControl>
                    <Select {...field}>
                      {PRINTER_STATION_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </Select>
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
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold"
              >
                {submitting ? 'Guardando...' : 'Guardar Categoría'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryModal;
