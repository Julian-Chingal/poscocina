import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  UtensilsCrossed,
  Clock,
  Boxes,
  ChefHat,
  Coffee,
} from 'lucide-react';
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

  const watchedPrice = form.watch('price');
  const watchedCategoryId = form.watch('categoryId');
  const selectedCategory = categories.find((c) => c.id === watchedCategoryId);

  // Live formatted price helper
  const parsedPrice = Number(watchedPrice) || 0;
  const formattedPricePreview = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(parsedPrice);

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
      <DialogContent maxWidth="xl" onClose={onClose} className="p-0 overflow-hidden rounded-2xl border-border/80 shadow-2xl max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/70 bg-gradient-to-b from-muted/40 to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 shadow-2xs">
              <UtensilsCrossed className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-foreground tracking-tight">
                {editingProduct ? 'Editar Plato o Bebida' : 'Nuevo Plato o Bebida'}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configura los detalles de la carta, tarifas de venta y reglas de comanda.
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
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
            {/* Grid Row 1: Nombre & Categoría */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-foreground">
                      Nombre del Plato <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        autoFocus
                        placeholder="Ej. Hamburguesa Angus Doble"
                        className="h-10 text-sm rounded-xl bg-muted/30 border-border/80 focus:bg-card focus:border-primary font-medium"
                      />
                    </FormControl>
                    <FormMessage className="text-xs font-medium" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-foreground">
                      Categoría <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 rounded-xl bg-muted/30 border-border/80 text-xs font-semibold">
                          <div className="flex items-center gap-2">
                            {selectedCategory && (
                              <span
                                className="size-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: selectedCategory.color || 'var(--primary)' }}
                              />
                            )}
                            <SelectValue placeholder="Selecciona categoría" />
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl border-border/80 max-h-56">
                        {categories.map((c) => (
                          <SelectItem
                            key={c.id}
                            value={c.id}
                            className="text-xs font-semibold cursor-pointer py-2"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="size-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: c.color || 'var(--primary)' }}
                              />
                              <span>{c.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs font-medium" />
                  </FormItem>
                )}
              />
            </div>

            {/* Grid Row 2: Precio de Venta & Impuesto */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-xs font-bold text-foreground">
                        Precio de Venta (COP) <span className="text-destructive">*</span>
                      </FormLabel>
                      {parsedPrice > 0 && (
                        <span className="text-xs font-black text-primary">
                          {formattedPricePreview}
                        </span>
                      )}
                    </div>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground pointer-events-none">
                          $
                        </span>
                        <Input
                          {...field}
                          type="number"
                          step="100"
                          min="0"
                          placeholder="35000"
                          className="h-10 pl-7 text-sm rounded-xl bg-muted/30 border-border/80 font-mono font-bold focus:bg-card focus:border-primary"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs font-medium" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="taxRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-foreground">
                      Impuesto Aplicable
                    </FormLabel>
                    <Select
                      value={String(field.value)}
                      onValueChange={(val) => field.onChange(parseFloat(val))}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10 rounded-xl bg-muted/30 border-border/80 text-xs font-semibold">
                          <SelectValue placeholder="Seleccionar impuesto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl border-border/80">
                        {TAX_RATE_OPTIONS.map((t) => (
                          <SelectItem
                            key={t.value}
                            value={String(t.value)}
                            className="text-xs font-semibold cursor-pointer py-2"
                          >
                            <span>{t.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs font-medium" />
                  </FormItem>
                )}
              />
            </div>

            {/* Grid Row 3: Estación de Comanda & Tiempo Estimado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="printerStation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-foreground">
                      Estación de Comanda
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 rounded-xl bg-muted/30 border-border/80 text-xs font-semibold">
                          <div className="flex items-center gap-2">
                            {field.value === 'bar' ? (
                              <Coffee className="size-3.5 text-amber-500" />
                            ) : (
                              <ChefHat className="size-3.5 text-primary" />
                            )}
                            <SelectValue placeholder="Seleccionar estación" />
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl border-border/80">
                        <SelectItem value="kitchen" className="text-xs font-semibold cursor-pointer py-2">
                          <div className="flex items-center gap-2">
                            <ChefHat className="size-3.5 text-primary" />
                            <span>Cocina Principal (KDS)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="bar" className="text-xs font-semibold cursor-pointer py-2">
                          <div className="flex items-center gap-2">
                            <Coffee className="size-3.5 text-amber-500" />
                            <span>Barra de Bebidas (Bar)</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs font-medium" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prepTimeMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-foreground">
                      Tiempo Estimado de Cocina
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Clock className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          placeholder="15"
                          className="h-10 pl-8 pr-12 text-sm rounded-xl bg-muted/30 border-border/80 font-medium focus:bg-card focus:border-primary"
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val === '' ? 0 : Math.max(0, parseInt(val, 10) || 0));
                          }}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground pointer-events-none">
                          min
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs font-medium" />
                  </FormItem>
                )}
              />
            </div>

            {/* Description / Ingredients */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-foreground">
                    Descripción / Ingredientes
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={2}
                      placeholder="Ingredientes del plato, alérgenos, presentación o notas importantes..."
                      className="text-xs rounded-xl bg-muted/30 border-border/80 focus:bg-card focus:border-primary resize-none leading-relaxed font-normal"
                    />
                  </FormControl>
                  <FormMessage className="text-xs font-medium" />
                </FormItem>
              )}
            />

            {/* Operational Switch Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Recipe Inventory Tracking */}
              <FormField
                control={form.control}
                name="trackInventory"
                render={({ field }) => (
                  <div
                    onClick={() => field.onChange(!field.value)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                      field.value
                        ? 'bg-purple-500/10 border-purple-500/30'
                        : 'bg-card border-border/80 hover:bg-muted/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
                          field.value
                            ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <Boxes className="size-4" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-foreground block">
                          Descontar Insumos
                        </span>
                        <span className="text-[10px] text-muted-foreground block leading-tight">
                          Descarga inventario por receta
                        </span>
                      </div>
                    </div>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}
              />

              {/* Immediate Availability */}
              <FormField
                control={form.control}
                name="isAvailable"
                render={({ field }) => (
                  <div
                    onClick={() => field.onChange(!field.value)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                      field.value
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-destructive/10 border-destructive/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
                          field.value
                            ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                            : 'bg-destructive/20 text-destructive'
                        }`}
                      >
                        <span
                          className={`size-2.5 rounded-full ${
                            field.value ? 'bg-emerald-500 animate-pulse' : 'bg-destructive'
                          }`}
                        />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-foreground block">
                          Disponible en Carta
                        </span>
                        <span className="text-[10px] text-muted-foreground block leading-tight">
                          {field.value ? 'Activo en terminales POS' : 'Marcado como Agotado (86)'}
                        </span>
                      </div>
                    </div>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}
              />
            </div>

            {/* Modal Footer */}
            <DialogFooter className="pt-3 border-t border-border/70 flex items-center justify-end gap-2.5 shrink-0">
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
                  <span>{editingProduct ? 'Actualizar Plato' : 'Guardar Producto'}</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
