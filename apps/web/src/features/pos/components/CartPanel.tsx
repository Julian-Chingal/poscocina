import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { CartItem, Customer, TableItem } from '../types/pos.types';
import { CartItemRow } from './CartItemRow';
import { CustomerSelectDropdown } from './CustomerSelectDropdown';
import { CartFooter } from './CartFooter';

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
  <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex flex-col justify-between h-[80vh] shadow-sm">
    <div className="space-y-3 overflow-hidden flex flex-col flex-1">
      <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
        <div className="flex items-center space-x-2 text-xs font-bold text-white">
          <ShoppingCart className="w-4 h-4 text-orange-400" />
          <span>Comanda Actual</span>
          {cart.length > 0 && (
            <span className="px-1.5 py-0.2 bg-orange-600/20 text-orange-400 rounded-full text-[10px]">
              {cart.length}
            </span>
          )}
        </div>
        {cart.length > 0 && (
          <button
            type="button"
            onClick={onClearCart}
            className="text-[10px] text-rose-400 hover:text-rose-300 cursor-pointer"
          >
            Limpiar
          </button>
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

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
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
          <div className="h-44 flex flex-col items-center justify-center text-center text-slate-500 text-xs border border-dashed border-slate-700/60 rounded-xl p-4">
            <ShoppingCart className="w-6 h-6 mb-2 opacity-40" />
            <span>Selecciona productos del catálogo para armar la comanda.</span>
          </div>
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
  </div>
);
