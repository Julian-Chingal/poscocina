import React from 'react';
import { ShoppingCart, Trash2, Utensils } from 'lucide-react';
import { CartItem, Customer, TableItem } from '../types/pos.types';
import { CartItemRow } from './CartItemRow';
import { CustomerSelectDropdown } from './CustomerSelectDropdown';
import { CartFooter } from './CartFooter';
import { ActiveOrderItemsList } from './ActiveOrderItemsList';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Props {
  cart: CartItem[];
  subtotal: number;
  taxTotal: number;
  total: number;
  currentTable: TableItem | null;
  activeOrder: any | null;
  submitting: boolean;
  orderSentSuccess: boolean;
  isCashShiftOpen?: boolean | null;
  selectedCustomer: Customer | null;
  customerSearchQuery: string;
  customerSearchResults: Customer[];
  onUpdateQuantity: (index: number, delta: number) => void;
  onUpdateNotes: (index: number, notes: string) => void;
  onClearCart: () => void;
  onSendOrder: () => void;
  onRequestCheck: () => void;
  onOpenCheckout: () => void;
  onCustomerSearchChange: (q: string) => void;
  onSelectCustomer: (c: Customer) => void;
  onClearCustomer: () => void;
  onOpenCreateCustomerModal: () => void;
  onRefreshOrder?: () => void;
  onCustomizeCartItem?: (index: number) => void;
}

export const CartPanel: React.FC<Props> = ({
  cart,
  subtotal,
  taxTotal,
  total,
  currentTable,
  activeOrder,
  submitting,
  orderSentSuccess,
  isCashShiftOpen,
  selectedCustomer,
  customerSearchQuery,
  customerSearchResults,
  onUpdateQuantity,
  onUpdateNotes,
  onClearCart,
  onSendOrder,
  onRequestCheck,
  onOpenCheckout,
  onCustomerSearchChange,
  onSelectCustomer,
  onClearCustomer,
  onOpenCreateCustomerModal,
  onRefreshOrder,
  onCustomizeCartItem,
}) => {
  const totalItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="bg-card/95 backdrop-blur-sm border border-border/80 rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between h-[calc(100vh-140px)] min-h-[580px] shadow-xs">
      <div className="space-y-3 overflow-hidden flex flex-col flex-1">
        {/* Ticket Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-border/80">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ShoppingCart className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-bold text-foreground">
                  {currentTable ? `Comanda Mesa ${currentTable.label}` : 'Comanda para Llevar'}
                </span>
                {totalItemCount > 0 && (
                  <Badge
                    variant="outline"
                    className="px-1.5 py-0.2 bg-primary/15 text-primary border-primary/30 text-[10px] font-bold tabular-nums"
                  >
                    {totalItemCount} {totalItemCount === 1 ? 'ítem' : 'ítems'}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {cart.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={onClearCart}
              className="h-6 px-2 text-[10px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1 rounded-md transition-colors"
              title="Vaciar comanda actual"
            >
              <Trash2 className="size-3" />
              <span>Limpiar</span>
            </Button>
          )}
        </div>

        {/* Customer Assignment Search */}
        <CustomerSelectDropdown
          selectedCustomer={selectedCustomer}
          searchQuery={customerSearchQuery}
          searchResults={customerSearchResults}
          showDropdown={Boolean(customerSearchQuery.length >= 2)}
          onSearchChange={onCustomerSearchChange}
          onSelectCustomer={onSelectCustomer}
          onClearCustomer={onClearCustomer}
          onOpenCreateModal={onOpenCreateCustomerModal}
        />

        {/* Cart & Kitchen Items Scrollable Area */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {cart.map((item, idx) => (
            <CartItemRow
              key={`${item.product.id}-${idx}`}
              item={item}
              index={idx}
              onUpdateQuantity={onUpdateQuantity}
              onUpdateNotes={onUpdateNotes}
              onCustomizeItem={onCustomizeCartItem}
            />
          ))}

          {cart.length === 0 && (
            <div className="h-32 flex flex-col items-center justify-center text-center text-muted-foreground text-xs border border-dashed border-border/80 rounded-xl bg-muted/15 p-4 space-y-1.5">
              <div className="size-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground/60 mb-0.5">
                <Utensils className="size-4" />
              </div>
              <span className="font-semibold text-foreground/80">Comanda vacía</span>
              <span className="text-[11px] text-muted-foreground max-w-[220px]">
                Toca productos en el menú para agregarlos a la orden.
              </span>
            </div>
          )}

          {/* Existing order items sent to kitchen */}
          {activeOrder && onRefreshOrder && (
            <ActiveOrderItemsList order={activeOrder} onRefreshOrder={onRefreshOrder} />
          )}
        </div>
      </div>

      {/* Cart Totals & Primary Actions Footer */}
      <CartFooter
        cartLength={cart.length}
        subtotal={subtotal}
        taxTotal={taxTotal}
        total={total}
        currentTable={currentTable}
        activeOrder={activeOrder}
        submitting={submitting}
        orderSentSuccess={orderSentSuccess}
        isCashShiftOpen={isCashShiftOpen}
        onSendOrder={onSendOrder}
        onRequestCheck={onRequestCheck}
        onOpenCheckout={onOpenCheckout}
      />
    </div>
  );
};

export default CartPanel;
