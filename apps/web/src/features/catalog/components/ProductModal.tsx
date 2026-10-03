import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Utensils, DollarSign, Clock } from 'lucide-react';
import { Product, Category } from '../types/catalog.types';
import { ProductSchema, ProductFormValues } from '../schemas/catalog.schemas';
import { TAX_RATE_OPTIONS } from '../constants/catalog.constants';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

interface Props {
  isOpen: boolean;
  editingProduct: Product | null;
  categories: Category[];
  defaultCategoryId?: string;
  submitting: boolean;
  formError?: string | null;
  onClose: () => void;
  onSubmit: (data: ProductFormValues) => Promise<void>;
}

export const ProductModal: React.FC<Props> = ({
  isOpen,
  editingProduct,
  categories,
  defaultCategoryId,
  submitting,
  formError,
  onClose,
  onSubmit,
}) => {
  const defaultCatId =
    defaultCategoryId !== 'all'
      ? defaultCategoryId || categories[0]?.id || ''
      : categories[0]?.id || '';

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: '',
      categoryId: defaultCatId,
      price: '',
      taxRate: 0.08,
      printerStation: 'kitchen',
      description: '',
      prepTimeMin: 15,
      trackInventory: false,
      isAvailable: true,
    },
  });

  useEffect(() => {
    if (editingProduct) {
      form.reset({
        name: editingProduct.name,
        categoryId: editingProduct.categoryId,
        price: editingProduct.price ? String(editingProduct.price) : '',
        taxRate:
          editingProduct.taxRate !== undefined && editingProduct.taxRate !== null
            ? Number(editingProduct.taxRate)
            : 0.08,
        printerStation: editingProduct.printerStation || 'kitchen',
        description: editingProduct.description || '',
        prepTimeMin: editingProduct.prepTimeMin || 15,
        trackInventory: editingProduct.trackInventory ?? false,
        isAvailable: editingProduct.isAvailable,
      });
    } else {
      form.reset({
        name: '',
        categoryId: defaultCatId,
        price: '',
        taxRate: 0.08,
        printerStation: 'kitchen',
        description: '',
        prepTimeMin: 15,
        trackInventory: false,
        isAvailable: true,
      });
    }
  }, [editingProduct, defaultCatId, isOpen, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent maxWidth="lg" onClose={onClose} className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Utensils className="w-5 h-5 text-primary" />
            <span>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</span>
          </DialogTitle>
        </DialogHeader>

        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs">
            {formError}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Plato *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ej. Hamburguesa Angus" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9 rounded-xl">
                          <SelectValue placeholder="Selecciona categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio (COP) *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground pointer-events-none" />
                        <Input
                          {...field}
                          type="number"
                          step="100"
                          min="0"
                          placeholder="35000"
                          className="pl-8 font-mono"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="taxRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Impuesto</FormLabel>
                    <Select
                      value={String(field.value)}
                      onValueChange={(val) => field.onChange(parseFloat(val))}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9 rounded-xl">
                          <SelectValue placeholder="Seleccionar impuesto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TAX_RATE_OPTIONS.map((t) => (
                          <SelectItem key={t.value} value={String(t.value)}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="printerStation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estación de Comanda</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9 rounded-xl">
                          <SelectValue placeholder="Seleccionar estación" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="kitchen">Cocina Principal (KDS)</SelectItem>
                        <SelectItem value="bar">Barra de Bebidas (Bar)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prepTimeMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiempo Estimado (min)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Clock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground pointer-events-none" />
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          placeholder="15"
                          className="pl-8"
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val === '' ? 0 : Math.max(0, parseInt(val, 10) || 0));
                          }}
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción / Ingredientes</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={2}
                      placeholder="Ingredientes del plato, alérgenos o notas..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-2 flex flex-wrap items-center gap-6">
              <FormField
                control={form.control}
                name="trackInventory"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      Descontar insumos (Receta)
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isAvailable"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      Disponible en carta
                    </FormLabel>
                  </FormItem>
                )}
              />
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
                {submitting ? 'Guardando...' : 'Guardar Producto'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
