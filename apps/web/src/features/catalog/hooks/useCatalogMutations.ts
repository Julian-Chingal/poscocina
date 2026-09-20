import { useState } from 'react';
import { catalogApi } from '../api/catalog.api';
import { Category, Product, DeleteTarget } from '../types/catalog.types';
import { CategoryFormValues, ProductFormValues } from '../schemas/catalog.schemas';
import { toast } from '@/components/ui/sonner';

export const useCatalogMutations = (venueId: string, onSuccess: () => void) => {
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const toggleAvailability = async (productId: string) => {
    try {
      await catalogApi.toggleProductAvailability(productId);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Error al cambiar disponibilidad');
    }
  };

  const openCreateCategory = () => {
    setEditingCategory(null);
    setFormError(null);
    setShowCategoryModal(true);
  };

  const openEditCategory = (cat: Category, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCategory(cat);
    setFormError(null);
    setShowCategoryModal(true);
  };

  const saveCategory = async (data: CategoryFormValues) => {
    try {
      setSubmitting(true);
      setFormError(null);
      if (editingCategory) {
        await catalogApi.updateCategory(venueId, editingCategory.id, data);
      } else {
        await catalogApi.createCategory(venueId, data);
      }
      setShowCategoryModal(false);
      onSuccess();
      toast.success('Categoría guardada exitosamente');
    } catch (err: any) {
      setFormError(err.message || 'Error al guardar categoría');
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateProduct = () => {
    setEditingProduct(null);
    setFormError(null);
    setShowProductModal(true);
  };

  const openEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setFormError(null);
    setShowProductModal(true);
  };

  const saveProduct = async (data: ProductFormValues) => {
    try {
      setSubmitting(true);
      setFormError(null);
      const payload = {
        categoryId: data.categoryId,
        name: data.name.trim(),
        price: parseFloat(data.price),
        taxRate: data.taxRate,
        printerStation: data.printerStation,
        description: data.description?.trim() || undefined,
        prepTimeMin: Number(data.prepTimeMin) || 0,
        trackInventory: data.trackInventory,
        isAvailable: data.isAvailable,
      };

      if (editingProduct) {
        await catalogApi.updateProduct(editingProduct.id, payload);
      } else {
        await catalogApi.createProduct(payload);
      }
      setShowProductModal(false);
      onSuccess();
      toast.success('Producto guardado exitosamente');
    } catch (err: any) {
      setFormError(err.message || 'Error al guardar producto');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setSubmitting(true);
      if (deleteTarget.type === 'category') {
        await catalogApi.deleteCategory(venueId, deleteTarget.id);
      } else {
        await catalogApi.deleteProduct(deleteTarget.id);
      }
      setDeleteTarget(null);
      onSuccess();
      toast.success('Elemento eliminado correctamente');
    } catch (err: any) {
      toast.error(`No se pudo eliminar: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    showCategoryModal,
    editingCategory,
    showProductModal,
    editingProduct,
    deleteTarget,
    formError,
    submitting,
    setShowCategoryModal,
    setShowProductModal,
    setDeleteTarget,
    toggleAvailability,
    openCreateCategory,
    openEditCategory,
    saveCategory,
    openCreateProduct,
    openEditProduct,
    saveProduct,
    confirmDelete,
  };
};

export default useCatalogMutations;
