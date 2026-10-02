import React, { useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useBrandingStore } from '@/stores/branding.store';
import { PosViewProps, Product } from './types/pos.types';
import { usePosCatalog } from './hooks/usePosCatalog';
import { usePosCart } from './hooks/usePosCart';
import { usePosTable } from './hooks/usePosTable';
import { useCustomerCrm } from './hooks/useCustomerCrm';
import { usePosCheckout } from './hooks/usePosCheckout';
import { PosHeader } from './components/PosHeader';
import { CategoryChips } from './components/CategoryChips';
import { ProductCatalogGrid } from './components/ProductCatalogGrid';
import { CartPanel } from './components/CartPanel';
import { CheckoutModal } from './components/CheckoutModal';
import { CreateCustomerModal } from './components/CreateCustomerModal';
import { ReceiptSuccessModal } from './components/ReceiptSuccessModal';
import {
  ProductModifiersModal,
  SelectedModifierPayload,
} from './components/ProductModifiersModal';

export const PosView: React.FC<PosViewProps> = ({ venueId, selectedTable }) => {
  const currentUser = useAuthStore((s) => s.currentUser);
  const settings = useBrandingStore((s) => s.settings);
  const taxRate = typeof settings.taxRate === 'number' ? settings.taxRate : 0.08;

  const catalog = usePosCatalog(venueId);
  const cart = usePosCart(taxRate);
  const table = usePosTable(venueId, selectedTable, currentUser?.id);
  const crm = useCustomerCrm(venueId, table.activeOrder?.id);

  // Modifiers / Toppings modal state
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [editingCartItemIndex, setEditingCartItemIndex] = useState<number | null>(null);

  const checkout = usePosCheckout(venueId, () => {
    cart.clearCart();
    table.refreshOrder();
  });

  const handleSendOrder = async () => {
    const success = await table.sendOrder(cart.cart, crm.selectedCustomer?.id);
    if (success) cart.clearCart();
  };

  const handleOpenCustomizeProduct = (product: Product) => {
    setEditingCartItemIndex(null);
    setCustomizingProduct(product);
  };

  const handleCustomizeCartItem = (index: number) => {
    const item = cart.cart[index];
    if (!item) return;
    setEditingCartItemIndex(index);
    setCustomizingProduct(item.product);
  };

  const handleCloseModifiersModal = () => {
    setCustomizingProduct(null);
    setEditingCartItemIndex(null);
  };

  const handleConfirmModifiers = ({
    product,
    quantity,
    notes,
    modifiers,
  }: {
    product: Product;
    quantity: number;
    notes: string;
    modifiers: SelectedModifierPayload[];
  }) => {
    if (editingCartItemIndex !== null) {
      cart.updateCartItem(editingCartItemIndex, {
        quantity,
        notes,
        modifiers: modifiers.map((m) => ({
          modifierId: m.modifierId,
          priceDelta: m.priceDelta,
          name: m.name,
        })),
      });
    } else {
      cart.addCustomizedToCart(
        product,
        quantity,
        notes,
        modifiers.map((m) => ({
          modifierId: m.modifierId,
          priceDelta: m.priceDelta,
          name: m.name,
        }))
      );
    }
    handleCloseModifiersModal();
  };

  const currentEditingItem =
    editingCartItemIndex !== null ? cart.cart[editingCartItemIndex] : null;

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <PosHeader
        currentTable={table.currentTable}
        allTables={table.allTables}
        isCashShiftOpen={table.isCashShiftOpen}
        waiterName={currentUser?.name}
        guestName={table.guestName}
        onSelectTable={table.setCurrentTable}
        onGuestNameChange={table.setGuestName}
      />

      <div className="w-full min-w-0 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="w-full min-w-0 lg:col-span-2 space-y-4">
          <CategoryChips
            categories={catalog.categories}
            activeCategoryId={catalog.activeCategoryId}
            searchQuery={catalog.productSearch}
            onSelectCategory={catalog.setActiveCategoryId}
            onSearchChange={catalog.setProductSearch}
          />
          <ProductCatalogGrid
            products={catalog.filteredProducts}
            onAddToCart={cart.addToCart}
            onCustomizeProduct={handleOpenCustomizeProduct}
          />
        </div>

        <div className="w-full min-w-0">
          <CartPanel
            cart={cart.cart}
            subtotal={cart.subtotal}
            taxTotal={cart.taxTotal}
            total={cart.total}
            currentTable={table.currentTable}
            activeOrder={table.activeOrder}
            submitting={table.submitting}
            orderSentSuccess={table.orderSentSuccess}
            isCashShiftOpen={table.isCashShiftOpen}
            selectedCustomer={crm.selectedCustomer}
            customerSearchQuery={crm.searchQuery}
            customerSearchResults={crm.searchResults}
            onUpdateQuantity={cart.updateQuantity}
            onUpdateNotes={cart.updateNotes}
            onClearCart={cart.clearCart}
            onSendOrder={handleSendOrder}
            onRequestCheck={table.requestCheck}
            onOpenCheckout={() => checkout.setShowCheckoutModal(true)}
            onCustomerSearchChange={crm.setSearchQuery}
            onSelectCustomer={crm.selectCustomer}
            onClearCustomer={crm.clearCustomer}
            onOpenCreateCustomerModal={() => crm.setShowCreateModal(true)}
            onRefreshOrder={table.refreshOrder}
            onCustomizeCartItem={handleCustomizeCartItem}
          />
        </div>
      </div>

      {/* Toppings / Modifiers Selection Modal */}
      <ProductModifiersModal
        isOpen={Boolean(customizingProduct)}
        product={customizingProduct}
        isEditing={editingCartItemIndex !== null}
        initialQuantity={currentEditingItem?.quantity || 1}
        initialNotes={currentEditingItem?.notes || ''}
        initialModifiers={
          currentEditingItem?.modifiers?.map((m) => ({
            modifierId: m.modifierId,
            priceDelta: m.priceDelta,
            name: m.name || '',
          })) || []
        }
        onClose={handleCloseModifiersModal}
        onConfirm={handleConfirmModifiers}
      />

      <CheckoutModal
        isOpen={checkout.showCheckoutModal}
        order={table.activeOrder}
        customer={crm.selectedCustomer}
        venueId={venueId}
        onClose={() => checkout.setShowCheckoutModal(false)}
        onSuccess={(receipt) => {
          cart.clearCart();
          table.refreshOrder();
          checkout.setReceiptSuccess(receipt);
        }}
      />

      <CreateCustomerModal
        isOpen={crm.showCreateModal}
        isSubmitting={crm.isSubmitting}
        onClose={() => crm.setShowCreateModal(false)}
        onSubmit={crm.createCustomer}
      />

      <ReceiptSuccessModal
        receipt={checkout.receiptSuccess}
        onDismiss={checkout.clearReceiptSuccess}
      />
    </div>
  );
};

export default PosView;
