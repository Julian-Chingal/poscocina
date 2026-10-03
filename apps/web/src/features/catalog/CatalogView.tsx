import React, { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { useCatalogData } from './hooks/useCatalogData';
import { useCatalogMutations } from './hooks/useCatalogMutations';
import { CatalogHeader } from './components/CatalogHeader';
import { CategoryTabs } from './components/CategoryTabs';
import { ProductGrid } from './components/ProductGrid';
import { CategoryModal } from './components/CategoryModal';
import { ProductModal } from './components/ProductModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ModifiersManagerModal } from './components/ModifiersManagerModal';

export const CatalogView: React.FC<{ venueId: string }> = ({ venueId }) => {
  const { isManager } = usePermissions();
  const data = useCatalogData(venueId);
  const mutations = useCatalogMutations(venueId, data.refreshCatalog);
  const [showModifiersModal, setShowModifiersModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto p-4 sm:p-8 lg:p-10 space-y-6">
      {/* Page Header with Stats, Search, View Switcher & Primary Action */}
      <CatalogHeader
        search={data.search}
        isManager={isManager}
        stats={data.stats}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onSearchChange={data.setSearch}
        onOpenCreateProduct={mutations.openCreateProduct}
        onOpenModifiersManager={() => setShowModifiersModal(true)}
      />

      {/* Category Pills & Quick Availability Filter */}
      <CategoryTabs
        categories={data.categories}
        products={data.products}
        activeCategory={data.activeCategory}
        availabilityFilter={data.availabilityFilter}
        isManager={isManager}
        onSelectCategory={data.setActiveCategory}
        onSelectAvailabilityFilter={data.setAvailabilityFilter}
        onOpenCreateCategory={mutations.openCreateCategory}
        onEditCategory={mutations.openEditCategory}
        onDeleteCategory={(c) =>
          mutations.setDeleteTarget({ type: 'category', id: c.id, name: c.name })
        }
      />

      {/* Product Content (Grid or Table) */}
      <ProductGrid
        products={data.filteredProducts}
        categories={data.categories}
        loading={data.loading}
        isManager={isManager}
        viewMode={viewMode}
        onOpenCreateProduct={mutations.openCreateProduct}
        onToggleAvailability={mutations.toggleAvailability}
        onEditProduct={mutations.openEditProduct}
        onDeleteProduct={(p) =>
          mutations.setDeleteTarget({ type: 'product', id: p.id, name: p.name })
        }
      />

      {/* Modal: Create / Edit Category */}
      <CategoryModal
        isOpen={mutations.showCategoryModal}
        editingCategory={mutations.editingCategory}
        totalCategories={data.categories.length}
        submitting={mutations.submitting}
        formError={mutations.formError}
        onClose={() => mutations.setShowCategoryModal(false)}
        onSubmit={mutations.saveCategory}
      />

      {/* Modal: Create / Edit Product */}
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

      {/* Modal: Confirm Deletion */}
      <DeleteConfirmModal
        deleteTarget={mutations.deleteTarget}
        submitting={mutations.submitting}
        onClose={() => mutations.setDeleteTarget(null)}
        onConfirm={mutations.confirmDelete}
      />

      {/* Modal: Modifiers & Toppings Manager */}
      <ModifiersManagerModal
        isOpen={showModifiersModal}
        venueId={venueId}
        allProducts={data.products}
        onClose={() => setShowModifiersModal(false)}
        onCatalogUpdated={data.refreshCatalog}
      />
    </div>
  );
};

export default CatalogView;
