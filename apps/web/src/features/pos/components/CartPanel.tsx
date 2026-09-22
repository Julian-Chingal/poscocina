import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { CartItem, Customer, TableItem } from '../types/pos.types';
import { CartItemRow } from './CartItemRow';
import { CustomerSelectDropdown } from './CustomerSelectDropdown';
import { CartFooter } from './CartFooter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
}) => (
  <Card className="p-4 flex flex-col justify-between h-[80vh] shadow-sm">
    <div className="space-y-3 overflow-hidden flex flex-col flex-1">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div className="flex items-center space-x-2 text-xs font-bold text-foreground">
          <ShoppingCart className="w-4 h-4 text-primary" />
          <span>Comanda Actual</span>
          {cart.length > 0 && (
            <Badge variant="outline" className="px-1.5 py-0.5 bg-primary/15 text-primary border-primary/30 text-[10px]">
              {cart.length}
            </Badge>
          )}
        </div>
        {cart.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={onClearCart}
            className="h-6 px-2 text-[10px] text-destructive hover:text-destructive/80 hover:bg-destructive/10"
          >
            Limpiar
          </Button>
        )}
      </div>

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

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {cart.map((item, idx) => (
          <CartItemRow
            key={`${item.product.id}-${idx}`}
            item={item}
            index={idx}
            onUpdateQuantity={onUpdateQuantity}
            onUpdateNotes={onUpdateNotes}
          />
        ))}

        {cart.length === 0 && (
          <Card className="h-44 flex flex-col items-center justify-center text-center text-muted-foreground text-xs border border-dashed border-border bg-transparent p-4">
            <ShoppingCart className="w-6 h-6 mb-2 opacity-40" />
            <span>Selecciona productos del catálogo para armar la comanda.</span>
          </Card>
        )}
      </div>
    </div>

    <CartFooter
      cartLength={cart.length}
      subtotal={subtotal}
      taxTotal={taxTotal}
      total={total}
      currentTable={currentTable}
      activeOrder={activeOrder}
      submitting={submitting}
      orderSentSuccess={orderSentSuccess}
      onSendOrder={onSendOrder}
      onRequestCheck={onRequestCheck}
      onOpenCheckout={onOpenCheckout}
    />
  </Card>
);

export default CartPanel;
