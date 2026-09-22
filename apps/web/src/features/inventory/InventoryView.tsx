import React, { useState, Suspense, lazy } from 'react';
import { InventoryTab } from './types/inventory.types';
import { useInventoryStock } from './hooks/useInventoryStock';
import { useInventoryMovements } from './hooks/useInventoryMovements';
import { useSuppliers } from './hooks/useSuppliers';
import { usePurchases } from './hooks/usePurchases';
import { useRecipes } from './hooks/useRecipes';
import { InventoryHeader } from './components/InventoryHeader';
import { StockTable } from './components/StockTable';
import { NewItemModal } from './components/NewItemModal';
import { StockMovementModal } from './components/StockMovementModal';
import { NewPurchaseModal } from './components/NewPurchaseModal';
import { PurchaseDetailModal } from './components/PurchaseDetailModal';
import { NewSupplierModal } from './components/NewSupplierModal';

const PurchasesTab = lazy(() => import('./components/PurchasesTab').then((m) => ({ default: m.PurchasesTab })));
const SuppliersTab = lazy(() => import('./components/SuppliersTab').then((m) => ({ default: m.SuppliersTab })));
const RecipesTab = lazy(() => import('./components/RecipesTab').then((m) => ({ default: m.RecipesTab })));
const MovementsTab = lazy(() => import('./components/MovementsTab').then((m) => ({ default: m.MovementsTab })));

export const InventoryView: React.FC<{ venueId: string }> = ({ venueId }) => {
  const [activeTab, setActiveTab] = useState<InventoryTab>('stock');
  const stock = useInventoryStock(venueId);
  const movements = useInventoryMovements(venueId, stock.refreshItems);
  const suppliers = useSuppliers(venueId);
  const purchases = usePurchases(venueId, () => {
    stock.refreshItems();
    movements.refreshMovements();
  });
  const recipes = useRecipes(venueId);

  return (
    <div className="max-w-7xl mx-auto p-6 sm:p-10 space-y-6">
      <InventoryHeader activeTab={activeTab} onSelectTab={setActiveTab} />

      <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Cargando sección de inventario...</div>}>
        {activeTab === 'stock' && (
          <StockTable
            items={stock.filteredItems}
            searchQuery={stock.searchQuery}
            onSearchChange={stock.setSearchQuery}
            onOpenNewItemModal={() => stock.setShowNewItemModal(true)}
            onOpenMovementModal={movements.openMovementModal}
          />
        )}

        {activeTab === 'purchases' && (
          <PurchasesTab
            purchases={purchases.purchases}
            onOpenNewPurchase={() => purchases.setShowNewModal(true)}
            onSelectPurchaseDetail={purchases.setSelectedDetail}
            onReceivePurchase={purchases.receivePurchase}
          />
        )}

        {activeTab === 'suppliers' && (
          <SuppliersTab
            suppliers={suppliers.suppliers}
            searchQuery={suppliers.searchQuery}
            onSearchChange={suppliers.setSearchQuery}
            onOpenNewSupplier={() => suppliers.setShowModal(true)}
          />
        )}

        {activeTab === 'recipes' && (
          <RecipesTab
            products={recipes.products}
            items={stock.items}
            selectedProductId={recipes.selectedProductId}
            currentRecipe={recipes.currentRecipe}
            isSaving={recipes.isSaving}
            onSelectProduct={recipes.setSelectedProductId}
            onAddIngredient={recipes.addIngredient}
            onUpdateIngredientQty={recipes.updateIngredientQty}
            onRemoveIngredient={recipes.removeIngredient}
            onSaveRecipe={recipes.saveRecipe}
          />
        )}

        {activeTab === 'movements' && <MovementsTab movements={movements.movements} />}
      </Suspense>

      <NewItemModal
        isOpen={stock.showNewItemModal}
        isSubmitting={stock.isSubmitting}
        onClose={() => stock.setShowNewItemModal(false)}
        onSubmit={stock.createItem}
      />

      <StockMovementModal
        isOpen={movements.showMovementModal}
        item={movements.selectedItem}
        isSubmitting={movements.isSubmitting}
        onClose={movements.closeMovementModal}
        onSubmit={movements.registerMovement}
      />

      <NewPurchaseModal
        isOpen={purchases.showNewModal}
        suppliers={suppliers.suppliers}
        items={stock.items}
        isSubmitting={purchases.isSubmitting}
        onClose={() => purchases.setShowNewModal(false)}
        onSubmit={purchases.createPurchase}
      />

      <PurchaseDetailModal
        purchase={purchases.selectedDetail}
        onClose={() => purchases.setSelectedDetail(null)}
      />

      <NewSupplierModal
        isOpen={suppliers.showModal}
        isSubmitting={suppliers.isSubmitting}
        onClose={() => suppliers.setShowModal(false)}
        onSubmit={suppliers.createSupplier}
      />
    </div>
  );
};

export default InventoryView;
