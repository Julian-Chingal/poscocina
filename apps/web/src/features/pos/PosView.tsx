import React from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useBrandingStore } from '@/stores/branding.store';
import { PosViewProps } from './types/pos.types';
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

export const PosView: React.FC<PosViewProps> = ({ venueId, selectedTable }) => {
  const currentUser = useAuthStore((s) => s.currentUser);
  const settings = useBrandingStore((s) => s.settings);
  const taxRate = typeof settings.taxRate === 'number' ? settings.taxRate : 0.08;

  const catalog = usePosCatalog(venueId);
  const cart = usePosCart(taxRate);
  const table = usePosTable(venueId, selectedTable, currentUser?.id);
  const crm = useCustomerCrm(venueId, table.activeOrder?.id);

  const checkout = usePosCheckout(venueId, () => {
    cart.clearCart();
    table.refreshOrder();
  });

  const handleSendOrder = async () => {
    const success = await table.sendOrder(cart.cart, crm.selectedCustomer?.id);
    if (success) cart.clearCart();
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <PosHeader
        currentTable={table.currentTable}
        allTables={table.allTables}
        isCashShiftOpen={table.isCashShiftOpen}
        waiterName={currentUser?.name}
        onSelectTable={table.setCurrentTable}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
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
          />
        </div>

        <div>
          <CartPanel
            cart={cart.cart}
            subtotal={cart.subtotal}
            taxTotal={cart.taxTotal}
            total={cart.total}
            currentTable={table.currentTable}
            activeOrder={table.activeOrder}
            submitting={table.submitting}
            orderSentSuccess={table.orderSentSuccess}
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
          />
        </div>
      </div>

      <CheckoutModal
        isOpen={checkout.showCheckoutModal}
        order={table.activeOrder}
        customer={crm.selectedCustomer}
        processing={checkout.processing}
        paymentMethod={checkout.paymentMethod}
        cashTendered={checkout.cashTendered}
        cardReference={checkout.cardReference}
        tipPct={checkout.tipPct}
        checkoutMode={checkout.checkoutMode}
        equalSplitCount={checkout.equalSplitCount}
        applyDiscount={checkout.applyDiscount}
        discountType={checkout.discountType}
        discountValue={checkout.discountValue}
        discountReason={checkout.discountReason}
        onClose={() => checkout.setShowCheckoutModal(false)}
        onPaymentMethodChange={checkout.setPaymentMethod}
        onCashTenderedChange={checkout.setCashTendered}
        onCardReferenceChange={checkout.setCardReference}
        onTipPctChange={checkout.setTipPct}
        onCheckoutModeChange={checkout.setCheckoutMode}
        onEqualSplitCountChange={checkout.setEqualSplitCount}
        onApplyDiscountChange={checkout.setApplyDiscount}
        onDiscountTypeChange={checkout.setDiscountType}
        onDiscountValueChange={checkout.setDiscountValue}
        onDiscountReasonChange={checkout.setDiscountReason}
        onProcessPayment={(total, tip) => {
          if (table.activeOrder?.id) {
            checkout.processPayment(table.activeOrder.id, total, tip);
          }
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
