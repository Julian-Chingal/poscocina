import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  UtensilsCrossed,
  Clock,
  Boxes,
  ChefHat,
  Coffee,
  Camera,
  Image as ImageIcon,
  Rotate3d,
  Ruler,
  Sparkles,
  Eye,
} from 'lucide-react';
import { Product, Category, ProductDimensions, DisplayMediaType } from '../types/catalog.types';
import { ProductSchema, ProductFormValues } from '../schemas/catalog.schemas';
import { TAX_RATE_OPTIONS } from '../constants/catalog.constants';
import { catalogApi } from '../api/catalog.api';
import { toast } from '@/components/ui/sonner';
import { Product3dScannerModal } from './Product3dScannerModal';
import { Product3dViewer } from './Product3dViewer';
import { Badge } from '@/components/ui/badge';
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

  const [showScannerModal, setShowScannerModal] = useState(false);
  const [show3dPreviewModal, setShow3dPreviewModal] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const modelInputRef = useRef<HTMLInputElement>(null);

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
      imageUrl: null,
      model3dUrl: null,
      model3dType: 'glb',
      dimensions: { diameter: 24, height: 6, unit: 'cm', portion: '' },
      displayMedia: 'both',
    },
  });

  const watchedPrice = form.watch('price');
  const watchedCategoryId = form.watch('categoryId');
  const watchedImageUrl = form.watch('imageUrl');
  const watchedModel3dUrl = form.watch('model3dUrl');
  const watchedDimensions = form.watch('dimensions');
  const watchedDisplayMedia = form.watch('displayMedia') || 'both';
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
        imageUrl: editingProduct.imageUrl || null,
        model3dUrl: editingProduct.model3dUrl || null,
        model3dType: editingProduct.model3dType || 'glb',
        dimensions: editingProduct.dimensions || { diameter: 24, height: 6, unit: 'cm', portion: '' },
        displayMedia: editingProduct.displayMedia || 'both',
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
        imageUrl: null,
        model3dUrl: null,
        model3dType: 'glb',
        dimensions: { diameter: 24, height: 6, unit: 'cm', portion: '' },
        displayMedia: 'both',
      });
    }
  }, [editingProduct, defaultCatId, isOpen, form]);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingMedia(true);
      const res = await catalogApi.uploadMedia(file);
      form.setValue('imageUrl', res.url);
      toast.success('Fotografía del plato subida con éxito');
    } catch (err: any) {
      toast.error('Error al subir imagen: ' + (err.message || 'Error'));
    } finally {
      setUploadingMedia(false);
      e.target.value = '';
    }
  };

  const handleModelFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingMedia(true);
      const res = await catalogApi.uploadMedia(file);
      form.setValue('model3dUrl', res.url);
      form.setValue('model3dType', 'glb');
      toast.success('Modelo 3D (.glb) subido con éxito');
    } catch (err: any) {
      toast.error('Error al subir archivo 3D: ' + (err.message || 'Error'));
    } finally {
      setUploadingMedia(false);
      e.target.value = '';
    }
  };

  const handleScannerComplete = (scanned: {
    imageUrl?: string;
    model3dUrl?: string;
    dimensions: ProductDimensions;
    displayMedia: DisplayMediaType;
  }) => {
    if (scanned.imageUrl) form.setValue('imageUrl', scanned.imageUrl);
    if (scanned.model3dUrl) form.setValue('model3dUrl', scanned.model3dUrl);
    form.setValue('dimensions', scanned.dimensions);
    form.setValue('displayMedia', scanned.displayMedia);
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          maxWidth="xl"
          onClose={onClose}
          className={`p-0 overflow-hidden rounded-2xl border-border/80 shadow-2xl max-h-[92vh] flex flex-col ${
            showScannerModal ? 'hidden' : ''
          }`}
        >
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

            {/* Multimedia, 3D & Physical Dimensions Section */}
            <div className="p-4 rounded-2xl border border-border/80 bg-muted/20 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="size-4 text-primary" />
                    <span>Presentación Visual, Fotos & Escaneo 3D</span>
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Almacena fotos del plato y genera o vincula visualización 3D interactiva con dimensiones.
                  </p>
                </div>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => setShowScannerModal(true)}
                  className="h-8 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera className="size-3.5" />
                  <span>Escanear con Cámara (3D)</span>
                </Button>
              </div>

              {/* Uploaded Media Summary & Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 2D Photo Card */}
                <div className="p-3 rounded-xl bg-card border border-border/70 flex items-center gap-3">
                  <div className="size-14 rounded-lg bg-muted border border-border/60 overflow-hidden flex items-center justify-center shrink-0">
                    {watchedImageUrl ? (
                      <img src={watchedImageUrl} alt="Plato" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="size-6 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-foreground">Fotografía 2D</span>
                      {watchedImageUrl ? (
                        <Badge variant="secondary" className="text-[9px] font-bold py-0 px-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                          Cargada
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px] text-muted-foreground py-0 px-1">
                          Sin foto
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={uploadingMedia}
                        className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                      >
                        {uploadingMedia ? 'Subiendo...' : watchedImageUrl ? 'Cambiar' : 'Subir archivo'}
                      </button>
                      {watchedImageUrl && (
                        <button
                          type="button"
                          onClick={() => form.setValue('imageUrl', null)}
                          className="text-[11px] font-semibold text-destructive hover:underline cursor-pointer"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3D Model Card */}
                <div className="p-3 rounded-xl bg-card border border-border/70 flex items-center gap-3">
                  <div className="size-14 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary">
                    <Rotate3d className="size-6 animate-spin-slow" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-foreground">Modelo 3D</span>
                      {watchedModel3dUrl ? (
                        <Badge variant="secondary" className="text-[9px] font-bold py-0 px-1 bg-primary/15 text-primary border-primary/30">
                          .GLB Activo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px] text-muted-foreground py-0 px-1">
                          Opcional
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => modelInputRef.current?.click()}
                        disabled={uploadingMedia}
                        className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                      >
                        {watchedModel3dUrl ? 'Reemplazar .glb' : 'Subir .glb'}
                      </button>
                      {watchedModel3dUrl && (
                        <>
                          <button
                            type="button"
                            onClick={() => setShow3dPreviewModal(true)}
                            className="text-[11px] font-semibold text-foreground hover:underline cursor-pointer flex items-center gap-0.5"
                          >
                            <Eye className="size-3" /> Ver
                          </button>
                          <button
                            type="button"
                            onClick={() => form.setValue('model3dUrl', null)}
                            className="text-[11px] font-semibold text-destructive hover:underline cursor-pointer"
                          >
                            Quitar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Display Media Preference (Solo Foto, Solo 3D, Ambos) */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-foreground block">
                  Preferencia de Visualización (Opcional)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'image', label: '📷 Solo Foto 2D' },
                    { id: 'model3d', label: '🧊 Solo 3D' },
                    { id: 'both', label: '✨ Ambos (Recomendado)' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => form.setValue('displayMedia', opt.id as any)}
                      className={`py-2 px-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                        watchedDisplayMedia === opt.id
                          ? 'bg-primary text-primary-foreground border-primary shadow-2xs'
                          : 'bg-card text-muted-foreground border-border/80 hover:bg-muted/50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Physical Dimensions Inputs */}
              <div className="space-y-2 pt-1 border-t border-border/60">
                <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                  <Ruler className="size-3 text-primary" />
                  <span>Dimensiones Físicas y Porción</span>
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground block mb-1">
                      Diámetro ({watchedDimensions?.unit || 'cm'})
                    </label>
                    <Input
                      type="number"
                      step="0.5"
                      placeholder="24"
                      value={watchedDimensions?.diameter ?? ''}
                      onChange={(e) =>
                        form.setValue('dimensions', {
                          ...watchedDimensions,
                          diameter: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                      className="h-8 text-xs rounded-lg bg-card font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground block mb-1">
                      Altura ({watchedDimensions?.unit || 'cm'})
                    </label>
                    <Input
                      type="number"
                      step="0.5"
                      placeholder="6"
                      value={watchedDimensions?.height ?? ''}
                      onChange={(e) =>
                        form.setValue('dimensions', {
                          ...watchedDimensions,
                          height: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                      className="h-8 text-xs rounded-lg bg-card font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground block mb-1">
                      Porción / Peso
                    </label>
                    <Input
                      type="text"
                      placeholder="Ej. 350g"
                      value={watchedDimensions?.portion ?? ''}
                      onChange={(e) =>
                        form.setValue('dimensions', {
                          ...watchedDimensions,
                          portion: e.target.value,
                        })
                      }
                      className="h-8 text-xs rounded-lg bg-card font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

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

    {/* Product 3D Scanner Modal (Web Camera Assisted) */}
    <Product3dScannerModal
      isOpen={showScannerModal}
      productName={form.watch('name') || 'Nuevo Plato'}
      currentImageUrl={watchedImageUrl}
      currentModel3dUrl={watchedModel3dUrl}
      currentDimensions={watchedDimensions}
      currentDisplayMedia={watchedDisplayMedia}
      onClose={() => setShowScannerModal(false)}
      onComplete={handleScannerComplete}
    />

    {/* Standalone 3D Model Preview Dialog */}
    {show3dPreviewModal && (
      <Dialog open={show3dPreviewModal} onOpenChange={setShow3dPreviewModal}>
        <DialogContent maxWidth="md" className="p-0 overflow-hidden rounded-2xl z-[100]">
          <div className="p-4 border-b border-border/70 flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">
              Vista Previa 3D: {form.watch('name') || 'Plato'}
            </span>
          </div>
          <div className="h-[360px] p-2">
            <Product3dViewer
              name={form.watch('name') || 'Plato'}
              modelUrl={watchedModel3dUrl}
              imageUrl={watchedImageUrl}
              dimensions={watchedDimensions}
              autoRotate={true}
            />
          </div>
        </DialogContent>
      </Dialog>
    )}

    {/* Hidden file inputs */}
    <input
      ref={imageInputRef}
      type="file"
      accept="image/png,image/jpeg,image/webp,image/jpg"
      className="hidden"
      onChange={handleImageFileChange}
    />
    <input
      ref={modelInputRef}
      type="file"
      accept=".glb,.gltf"
      className="hidden"
      onChange={handleModelFileChange}
    />
  </>
  );
};

export default ProductModal;
