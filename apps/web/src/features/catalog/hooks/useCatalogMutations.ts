import { useState } from 'react';
import { catalogApi } from '../api/catalog.api';
import { Category, Product, CategoryFormData, ProductFormData, DeleteTarget } from '../types/catalog.types';
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

  const saveCategory = async (data: CategoryFormData) => {
    if (!data.name.trim()) {
      setFormError('El nombre de la categoría es obligatorio.');
      return;
    }
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

  const saveProduct = async (data: ProductFormData) => {
    if (!data.name.trim()) {
      setFormError('El nombre del producto es obligatorio.');
      return;
    }
    if (!data.categoryId) {
      setFormError('Debes seleccionar una categoría.');
      return;
    }
    const numPrice = parseFloat(data.price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setFormError('Ingresa un precio válido mayor a 0.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);
      const payload = {
        categoryId: data.categoryId,
        name: data.name.trim(),
        price: numPrice,
        taxRate: data.taxRate,
        printerStation: data.printerStation,
        description: data.description.trim() || undefined,
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
