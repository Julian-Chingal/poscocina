import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { useCatalogData } from './hooks/useCatalogData';
import { useCatalogMutations } from './hooks/useCatalogMutations';
import { CatalogHeader } from './components/CatalogHeader';
import { CategoryTabs } from './components/CategoryTabs';
import { ProductGrid } from './components/ProductGrid';
import { CategoryModal } from './components/CategoryModal';
import { ProductModal } from './components/ProductModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';

export const CatalogView: React.FC<{ venueId: string }> = ({ venueId }) => {
  const { isManager } = usePermissions();
  const data = useCatalogData(venueId);
  const mutations = useCatalogMutations(venueId, data.refreshCatalog);

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto p-6 sm:p-10 space-y-6">
      <CatalogHeader
        search={data.search}
        isManager={isManager}
        onSearchChange={data.setSearch}
        onOpenCreateProduct={mutations.openCreateProduct}
      />

      <CategoryTabs
        categories={data.categories}
        products={data.products}
        activeCategory={data.activeCategory}
        isManager={isManager}
        onSelectCategory={data.setActiveCategory}
        onOpenCreateCategory={mutations.openCreateCategory}
        onEditCategory={mutations.openEditCategory}
        onDeleteCategory={(c) => mutations.setDeleteTarget({ type: 'category', id: c.id, name: c.name })}
      />

      <ProductGrid
        products={data.filteredProducts}
        categories={data.categories}
        loading={data.loading}
        isManager={isManager}
        onOpenCreateProduct={mutations.openCreateProduct}
        onToggleAvailability={mutations.toggleAvailability}

        onEditProduct={mutations.openEditProduct}
        onDeleteProduct={(p) => mutations.setDeleteTarget({ type: 'product', id: p.id, name: p.name })}
      />

      <CategoryModal
        isOpen={mutations.showCategoryModal}
        editingCategory={mutations.editingCategory}
        totalCategories={data.categories.length}
        submitting={mutations.submitting}
        formError={mutations.formError}
        onClose={() => mutations.setShowCategoryModal(false)}
        onSubmit={mutations.saveCategory}
      />

      <ProductModal
        isOpen={mutations.showProductModal}
        editingProduct={mutations.editingProduct}
        categories={data.categories}
        defaultCategoryId={data.activeCategory}
        submitting={mutations.submitting}
        formError={mutations.formError}
        onClose={() => mutations.setShowProductModal(false)}
        onSubmit={mutations.saveProduct}
      />

      <DeleteConfirmModal
        deleteTarget={mutations.deleteTarget}
        submitting={mutations.submitting}
        onClose={() => mutations.setDeleteTarget(null)}
        onConfirm={mutations.confirmDelete}
      />
    </div>
  );
};

export default CatalogView;
