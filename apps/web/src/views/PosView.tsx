import React, { useEffect, useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Minus,
  Send,
  Check,
  CreditCard,
  DollarSign,
  Receipt,
  Printer,
  Sparkles,
  X,
  Clock,
  FileText,
  CheckCircle2,
  Users,
  ListChecks,
  Tag,
  Divide,
  UserPlus,
  Search,
} from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { useBrandingStore } from '../stores/branding.store';

interface Customer {
  id: string;
  name: string;
  documentType?: string;
  documentNumber?: string;
  phone?: string;
  email?: string;
  loyaltyPoints?: number;
}

interface Product {
  id: string;
  categoryId: string;
  name: string;
  price: string;
  description?: string;
}

interface Category {
  id: string;
  name: string;
  color?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  notes: string;
  modifiers: Array<{ modifierId: string; priceDelta: number }>;
}

interface TableItem {
  id: string;
  label: string;
  status: string;
  currentOrderId?: string | null;
}

interface PosViewProps {
  venueId: string;
  selectedTable?: TableItem | null;
}

export const PosView: React.FC<PosViewProps> = ({ venueId, selectedTable }) => {
  const { currentUser } = useAuthStore();
  const { settings } = useBrandingStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentTable, setCurrentTable] = useState<TableItem | null>(selectedTable || null);
  const [allTables, setAllTables] = useState<TableItem[]>([]);
  const [orderSentSuccess, setOrderSentSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Existing active order on table
  const [activeOrder, setActiveOrder] = useState<any | null>(null);

  // Billing modal states
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState<'single' | 'equal' | 'items'>('single');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card_credit' | 'transfer'>('cash');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [cardReference, setCardReference] = useState<string>('');
  const [tipPct, setTipPct] = useState<number>(0);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [receiptSuccess, setReceiptSuccess] = useState<any>(null);
  const [checkRequestedSuccess, setCheckRequestedSuccess] = useState(false);

  // Phase 5: Split billing & discounts
  const [applyDiscount, setApplyDiscount] = useState(false);
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState('10');
  const [discountReason, setDiscountReason] = useState('Cortesía de la casa');

  const [equalSplitCount, setEqualSplitCount] = useState(2);
  const [currentSplitIndex, setCurrentSplitIndex] = useState(1);
  const [splitProgressMessage, setSplitProgressMessage] = useState('');

  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  // Phase 6: Customer CRM & Loyalty
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerSearchResults, setCustomerSearchResults] = useState<Customer[]>([]);
  const [showCustomerSearchDropdown, setShowCustomerSearchDropdown] = useState(false);
  const [showCreateCustomerModal, setShowCreateCustomerModal] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    name: '',
    documentType: 'CC',
    documentNumber: '',
    phone: '',
    email: '',
    address: '',
  });
  const [customerFormSubmitting, setCustomerFormSubmitting] = useState(false);
  const [customerFormError, setCustomerFormError] = useState<string | null>(null);

  const isCashierOrManager =
    currentUser?.roleName === 'cashier' ||
    currentUser?.roleName === 'manager' ||
    currentUser?.roleName === 'super_admin' ||
    (currentUser?.hierarchy && currentUser.hierarchy >= 60);

  const fetchTables = () => {
    fetch(`/api/venues/${venueId}/tables`)
      .then((res) => res.json())
      .then((data) => {
        setAllTables(data || []);
        if (currentTable) {
          const updatedCurrent = data?.find((t: any) => t.id === currentTable.id);
          if (updatedCurrent) setCurrentTable(updatedCurrent);
        }
      });
  };

  const fetchActiveOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setActiveOrder(data);
        setActiveOrderId(data.id);
        if (data.customer) {
          setSelectedCustomer(data.customer);
        }
      } else {
        setActiveOrder(null);
        setActiveOrderId(null);
      }
    } catch (err) {
      console.error('Error fetching active order:', err);
      setActiveOrder(null);
    }
  };

  // Debounced customer search
  useEffect(() => {
    if (!customerSearchQuery || customerSearchQuery.length < 2) {
      setCustomerSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/customers/search?venueId=${venueId}&query=${encodeURIComponent(customerSearchQuery)}`
        );
        if (res.ok) {
          const data = await res.json();
          setCustomerSearchResults(data);
        }
      } catch (err) {
        console.error('Customer search error:', err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [customerSearchQuery, venueId]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerForm.name.trim()) {
      setCustomerFormError('El nombre del cliente es obligatorio');
      return;
    }
    setCustomerFormSubmitting(true);
    setCustomerFormError(null);

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venueId,
          name: customerForm.name.trim(),
          documentType: customerForm.documentType,
          documentNumber: customerForm.documentNumber.trim() || undefined,
          phone: customerForm.phone.trim() || undefined,
          email: customerForm.email.trim() || undefined,
          address: customerForm.address.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error creando cliente');
      }

      const newCustomer = await res.json();
      setSelectedCustomer(newCustomer);
      setShowCreateCustomerModal(false);
      setCustomerForm({
        name: '',
        documentType: 'CC',
        documentNumber: '',
        phone: '',
        email: '',
        address: '',
      });
    } catch (err: any) {
      setCustomerFormError(err.message);
    } finally {
      setCustomerFormSubmitting(false);
    }
  };

  useEffect(() => {
    if (currentTable?.currentOrderId) {
      fetchActiveOrder(currentTable.currentOrderId);
    } else {
      setActiveOrder(null);
      setActiveOrderId(null);
    }
  }, [currentTable?.id, currentTable?.currentOrderId]);

  useEffect(() => {
    if (!venueId) return;

    fetch(`/api/venues/${venueId}/catalog`)
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories || []);
        setProducts(data.products || []);
        if (data.categories?.length > 0) {
          setActiveCategoryId(data.categories[0].id);
        }
      });

    fetchTables();
  }, [venueId]);

  const filteredProducts = activeCategoryId
    ? products.filter((p) => p.categoryId === activeCategoryId)
    : products;

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1, notes: '', modifiers: [] }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const taxRate = typeof settings.taxRate === 'number' ? settings.taxRate : 0.08;
  const taxLabel = `${settings.taxRate === 0.19 ? 'IVA' : 'INC'} (${Math.round(taxRate * 100)}%):`;

  // Calculated totals (existing items + new cart items)
  const existingSubtotal = activeOrder ? parseFloat(activeOrder.subtotal || '0') : 0;
  const newSubtotal = cart.reduce((sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0);
  const baseSubtotal = existingSubtotal + newSubtotal;
  const subtotal = baseSubtotal;

  // Audit discount calculation
  const discountVal = parseFloat(discountValue) || 0;
  let calculatedDiscount = 0;
  if (applyDiscount && discountVal > 0) {
    if (discountType === 'percent') {
      calculatedDiscount = (baseSubtotal * Math.min(discountVal, 100)) / 100;
    } else {
      calculatedDiscount = Math.min(baseSubtotal, discountVal);
    }
  }

  const effectiveSubtotal = Math.max(0, baseSubtotal - calculatedDiscount);
  const effectiveTax = effectiveSubtotal * taxRate;
  const tax = effectiveTax;
  const tipAmount = (effectiveSubtotal * tipPct) / 100;
  const total = effectiveSubtotal + effectiveTax + tipAmount;

  // Split equal calculation
  const amountPerPerson = equalSplitCount > 0 ? Math.round((total / equalSplitCount) * 100) / 100 : total;

  // Split by items calculation
  const orderItemsList = activeOrder?.items || [];
  const selectedOrderItems = orderItemsList.filter((it: any) => selectedItemIds.includes(it.id));
  const selectedItemsSubtotal = selectedOrderItems.reduce(
    (acc: number, it: any) => acc + parseFloat(it.unitPrice || '0') * (it.quantity || 1),
    0
  );
  const selectedItemsTax = selectedItemsSubtotal * taxRate;
  const selectedItemsTip = (selectedItemsSubtotal * tipPct) / 100;
  const selectedItemsTotal = selectedItemsSubtotal + selectedItemsTax + selectedItemsTip;

  // Current amount to pay depending on checkoutMode
  const currentPayableAmount =
    checkoutMode === 'equal'
      ? amountPerPerson
      : checkoutMode === 'items'
      ? selectedItemsTotal
      : total;

  // Change / Vueltas
  const tenderedNum = parseFloat(cashTendered) || 0;
  const changeDue = Math.max(0, tenderedNum - currentPayableAmount);

  const handleSendOrAppendOrder = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);

    try {
      if (activeOrder) {
        // APPEND new items to existing order
        const appendPayload = {
          items: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: parseFloat(item.product.price),
            notes: item.notes || undefined,
            modifiers: item.modifiers,
          })),
        };

        const res = await fetch(`/api/orders/${activeOrder.id}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(appendPayload),
        });

        if (res.ok) {
          setCart([]);
          setOrderSentSuccess(true);
          setTimeout(() => setOrderSentSuccess(false), 3000);
          fetchActiveOrder(activeOrder.id);
          fetchTables();

          // KDS print dispatch
          fetch('/api/hardware/print-kitchen', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: activeOrder.id }),
          }).catch(() => {});
        }
      } else {
        // CREATE new order
        const payload = {
          venueId,
          tableId: currentTable?.id || null,
          customerId: selectedCustomer?.id || null,
          orderType: currentTable ? 'dine_in' : 'takeout',
          waiterId: currentUser?.id || null,
          guestCount: 1,
          items: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: parseFloat(item.product.price),
            notes: item.notes || undefined,
            modifiers: item.modifiers,
          })),
        };

        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          setCart([]);
          setActiveOrderId(data.order.id);
          setActiveOrder(data.order);
          setOrderSentSuccess(true);
          setTimeout(() => setOrderSentSuccess(false), 3000);
          fetchTables();

          // KDS print dispatch
          fetch('/api/hardware/print-kitchen', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: data.order.id }),
          }).catch(() => {});
        }
      }
    } catch (err) {
      console.error('Error sending order:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestCheck = async () => {
    if (!activeOrderId && !activeOrder?.id) return;
    const targetId = activeOrder?.id || activeOrderId;
    try {
      const res = await fetch(`/api/orders/${targetId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'check_requested' }),
      });

      if (res.ok) {
        setCheckRequestedSuccess(true);
        setTimeout(() => setCheckRequestedSuccess(false), 4000);
        fetchTables();
        if (targetId) fetchActiveOrder(targetId);

        // Disparar impresión térmica de Pre-cuenta
        fetch('/api/hardware/print-precheck', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: targetId }),
        }).catch(() => {});
      }
    } catch (err) {
      console.error('Error requesting check:', err);
    }
  };

  const handleReprintKitchen = async () => {
    if (!activeOrderId && !activeOrder?.id) return;
    const targetId = activeOrder?.id || activeOrderId;
    try {
      const res = await fetch('/api/hardware/print-kitchen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: targetId }),
      });
      if (res.ok) {
        alert('Comanda reenviada exitosamente a las impresoras de cocina y barra');
      }
    } catch (err) {
      console.error('Error reprinting kitchen ticket:', err);
    }
  };

  const handleOpenCheckout = async () => {
    // If order not yet created in DB, create it first
    if (!activeOrderId && cart.length > 0) {
      setSubmitting(true);
      try {
        const payload = {
          venueId,
          tableId: currentTable?.id || null,
          customerId: selectedCustomer?.id || null,
          orderType: currentTable ? 'dine_in' : 'takeout',
          waiterId: currentUser?.id || null,
          guestCount: 1,
          items: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: parseFloat(item.product.price),
            notes: item.notes || undefined,
            modifiers: item.modifiers,
          })),
        };

        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          setActiveOrderId(data.order.id);
          setShowCheckoutModal(true);
        }
      } catch (err) {
        console.error('Error creating order before checkout:', err);
      } finally {
        setSubmitting(false);
      }
    } else {
      setShowCheckoutModal(true);
    }
  };

  const handleConfirmPayment = async () => {
    if (!activeOrderId) return;
    setProcessingPayment(true);

    try {
      if (checkoutMode === 'single') {
        const paymentPayload: any = {
          orderId: activeOrderId,
          customerId: selectedCustomer?.id || undefined,
          payments: [
            {
              method: paymentMethod,
              amount: total,
              reference: cardReference || undefined,
              tipAmount,
            },
          ],
        };

        if (applyDiscount && discountVal > 0) {
          paymentPayload.discountType = discountType;
          paymentPayload.discountValue = discountVal;
          paymentPayload.discountReason = discountReason || 'Cortesía de la casa';
        }

        const res = await fetch('/api/receipts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(paymentPayload),
        });

        if (res.ok) {
          const data = await res.json();
          setReceiptSuccess(data.receipt);
          setCart([]);
          setActiveOrderId(null);
          setActiveOrder(null);
          fetchTables();

          // Disparo ESC/POS de ticket de venta al cliente
          fetch('/api/hardware/print-receipt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ receiptId: data.receipt.id }),
          }).catch(() => {});

          // Si fue pago en efectivo, abrir automáticamente la gaveta de dinero
          if (paymentMethod === 'cash') {
            fetch('/api/hardware/open-drawer', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ venueId }),
            }).catch(() => {});
          }
        }
      } else if (checkoutMode === 'equal') {
        const splitPayload: any = {
          orderId: activeOrderId,
          customerId: selectedCustomer?.id || undefined,
          splitNumber: currentSplitIndex,
          totalSplits: equalSplitCount,
          payments: [
            {
              method: paymentMethod,
              amount: amountPerPerson,
              reference: cardReference || undefined,
              tipAmount: tipAmount / equalSplitCount,
            },
          ],
        };

        const res = await fetch('/api/billing/split-equal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(splitPayload),
        });

        if (res.ok) {
          const data = await res.json();

          // Print partial receipt
          fetch('/api/hardware/print-receipt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ receiptId: data.receipt.id }),
          }).catch(() => {});

          if (paymentMethod === 'cash') {
            fetch('/api/hardware/open-drawer', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ venueId }),
            }).catch(() => {});
          }

          if (data.isComplete) {
            setReceiptSuccess(data.receipt);
            setCart([]);
            setActiveOrderId(null);
            setActiveOrder(null);
            fetchTables();
            setSplitProgressMessage('');
          } else {
            setCurrentSplitIndex((prev) => prev + 1);
            setCashTendered('');
            setCardReference('');
            setSplitProgressMessage(
              `Parte ${data.splitNumber} de ${data.totalSplits} pagada. Restan $${data.remainingBalance.toLocaleString()}`
            );
            fetchTables();
            if (activeOrderId) fetchActiveOrder(activeOrderId);
          }
        }
      } else if (checkoutMode === 'items') {
        if (selectedItemIds.length === 0) {
          alert('Por favor selecciona al menos un plato a cobrar.');
          setProcessingPayment(false);
          return;
        }

        const splitPayload: any = {
          orderId: activeOrderId,
          customerId: selectedCustomer?.id || undefined,
          itemIds: selectedItemIds,
          payments: [
            {
              method: paymentMethod,
              amount: selectedItemsTotal,
              reference: cardReference || undefined,
              tipAmount: selectedItemsTip,
            },
          ],
        };

        const res = await fetch('/api/billing/split-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(splitPayload),
        });

        if (res.ok) {
          const data = await res.json();

          // Print receipt
          fetch('/api/hardware/print-receipt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ receiptId: data.receipt.id }),
          }).catch(() => {});

          if (paymentMethod === 'cash') {
            fetch('/api/hardware/open-drawer', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ venueId }),
            }).catch(() => {});
          }

          if (data.isComplete) {
            setReceiptSuccess(data.receipt);
            setCart([]);
            setActiveOrderId(null);
            setActiveOrder(null);
            setSelectedItemIds([]);
            fetchTables();
            setSplitProgressMessage('');
          } else {
            setSelectedItemIds([]);
            setCashTendered('');
            setCardReference('');
            setSplitProgressMessage(
              `Ítems cobrados. Restante en orden: $${data.remainingBalance.toLocaleString()}`
            );
            fetchTables();
            if (activeOrderId) fetchActiveOrder(activeOrderId);
          }
        }
      }
    } catch (err) {
      console.error('Error issuing payment:', err);
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-48px)] overflow-hidden">
      {/* Left Column: Menu Catalog */}
      <div className="flex-1 flex flex-col border-r border-slate-800 bg-slate-900 overflow-hidden">
        {/* Category Tabs */}
        <div className="flex items-center space-x-2 p-4 border-b border-slate-800 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              className={`px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all cursor-pointer ${
                activeCategoryId === cat.id
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-max">
          {filteredProducts.map((p) => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              className="flex flex-col justify-between p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-orange-500/60 transition-all text-left group cursor-pointer shadow"
            >
              <div>
                <h4 className="font-bold text-white group-hover:text-orange-400 transition-colors">
                  {p.name}
                </h4>
                {p.description && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{p.description}</p>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-extrabold text-orange-400">
                  ${parseFloat(p.price).toLocaleString()}
                </span>
                <span className="bg-slate-700 group-hover:bg-orange-600 p-1.5 rounded-lg text-white transition-colors">
                  <Plus className="w-4 h-4" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Column: Order Cart */}
      <div className="w-96 bg-slate-950 flex flex-col justify-between border-l border-slate-800">
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-800 flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5 text-orange-500" />
              <span className="font-bold text-white">Comanda</span>
            </div>

            <select
              value={currentTable?.id || ''}
              onChange={(e) => {
                const selected = allTables.find((t) => t.id === e.target.value);
                setCurrentTable(selected || null);
              }}
              className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-orange-500"
            >
              <option value="">Para Llevar</option>
              {allTables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label} ({t.status === 'free' ? 'Libre' : t.status === 'check_requested' ? 'Cuenta Pedida' : 'Ocupada'})
                </option>
              ))}
            </select>
          </div>

          {/* Customer CRM & Loyalty Selector */}
          <div className="relative">
            {selectedCustomer ? (
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <div className="flex items-center gap-2 truncate">
                  <div className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                    {selectedCustomer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-slate-100 truncate">{selectedCustomer.name}</div>
                    <div className="text-[10px] text-slate-400">
                      {selectedCustomer.documentNumber ? `${selectedCustomer.documentType || 'Doc'}: ${selectedCustomer.documentNumber}` : 'Cliente'} • 💎 {selectedCustomer.loyaltyPoints || 0} pts
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  title="Quitar cliente (Consumidor Final)"
                  className="text-slate-500 hover:text-rose-400 p-1 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cédula/NIT o Cliente..."
                    value={customerSearchQuery}
                    onFocus={() => setShowCustomerSearchDropdown(true)}
                    onChange={(e) => {
                      setCustomerSearchQuery(e.target.value);
                      setShowCustomerSearchDropdown(true);
                    }}
                    className="w-full pl-8 pr-2 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />
                  {showCustomerSearchDropdown && customerSearchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-30 max-h-48 overflow-y-auto">
                      {customerSearchResults.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => {
                            setSelectedCustomer(c);
                            setCustomerSearchQuery('');
                            setShowCustomerSearchDropdown(false);
                          }}
                          className="p-2 text-xs hover:bg-slate-700/80 cursor-pointer border-b border-slate-700/50 last:border-0 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-slate-200">{c.name}</div>
                            <div className="text-[10px] text-slate-400">
                              {c.documentNumber ? `${c.documentType || 'CC'}: ${c.documentNumber}` : 'Sin doc'} • Tel: {c.phone || 'S/N'}
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-pink-400">
                            💎 {c.loyaltyPoints || 0} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateCustomerModal(true)}
                  title="Registrar nuevo cliente"
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-1 transition"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Active order info pill */}
          {activeOrder && (
            <div className="flex items-center justify-between text-[11px] bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-300 font-medium">
                Orden <strong className="text-white">#{activeOrder.orderNumber || activeOrder.id?.slice(0, 6)}</strong>
              </span>
              <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                activeOrder.status === 'check_requested'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : activeOrder.status === 'ready'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}>
                {activeOrder.status === 'check_requested' ? 'Cuenta pedida' : activeOrder.status}
              </span>
            </div>
          )}

          {checkRequestedSuccess && (
            <div className="bg-amber-500/20 text-amber-300 text-xs px-3 py-1.5 rounded-lg border border-amber-500/40 flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Cuenta solicitada a Caja con éxito</span>
            </div>
          )}
        </div>

        {/* Cart Items List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {/* Section 1: Active Order Items (En Cocina / Comandados) */}
          {activeOrder && activeOrder.items && activeOrder.items.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                <span className="flex items-center space-x-1.5">
                  <Clock className="w-3 h-3 text-sky-400" />
                  <span>En Cocina ({activeOrder.items.length})</span>
                </span>
                <span className="text-slate-300 font-mono font-bold">${existingSubtotal.toLocaleString()}</span>
              </div>

              <div className="space-y-1.5">
                {activeOrder.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-extrabold text-orange-400">{item.quantity}x</span>
                        <span className="text-slate-200 font-medium truncate">{item.productName || item.product?.name || 'Producto'}</span>
                      </div>
                      {item.notes && (
                        <p className="text-[10px] text-slate-400 italic truncate mt-0.5">{item.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        item.status === 'ready'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : item.status === 'in_preparation'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {item.status === 'ready' ? 'Listo' : item.status === 'in_preparation' ? 'En prep.' : 'Enviado'}
                      </span>
                      <span className="font-mono text-slate-300">
                        ${(parseFloat(item.unitPrice || '0') * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: New items to add / append */}
          <div className="space-y-2">
            {activeOrder && (
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1 pt-2 border-t border-slate-800">
                <span className="flex items-center space-x-1.5">
                  <Plus className="w-3 h-3 text-orange-400" />
                  <span>Nuevos Ítems ({cart.length})</span>
                </span>
                {cart.length > 0 && (
                  <span className="text-orange-400 font-mono font-bold">${newSubtotal.toLocaleString()}</span>
                )}
              </div>
            )}

            {cart.length === 0 ? (
              !activeOrder && (
                <div className="text-center py-16 text-slate-500 text-xs">
                  Selecciona productos del menú para iniciar la comanda
                </div>
              )
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-col space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <span className="font-semibold text-xs text-slate-200">{item.product.name}</span>
                    <span className="text-xs font-bold text-orange-400 font-mono">
                      ${(parseFloat(item.product.price) * item.quantity).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <input
                      type="text"
                      placeholder="Nota (ej. sin cebolla)"
                      value={item.notes}
                      onChange={(e) => {
                        const note = e.target.value;
                        setCart((prev) =>
                          prev.map((i) =>
                            i.product.id === item.product.id ? { ...i, notes: note } : i
                          )
                        );
                      }}
                      className="text-[11px] bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 w-40 focus:outline-none focus:border-slate-700"
                    />

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-white w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cart Summary & Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 space-y-3">
          <div className="space-y-1 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-mono text-slate-300">${subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>{taxLabel}</span>
              <span className="font-mono text-slate-300">${tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-white pt-1.5 border-t border-slate-800">
              <span>Total:</span>
              <span className="text-orange-400 font-mono text-base">${total.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            {/* Primary Kitchen Action: Enviar o Anexar */}
            <button
              disabled={cart.length === 0 || submitting}
              onClick={handleSendOrAppendOrder}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all ${
                orderSentSuccess
                  ? 'bg-emerald-600 text-white'
                  : cart.length > 0
                  ? 'bg-orange-600 hover:bg-orange-500 text-white cursor-pointer shadow-lg shadow-orange-600/20'
                  : 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {submitting
                  ? 'Enviando...'
                  : orderSentSuccess
                  ? '¡Enviado a Cocina!'
                  : activeOrder
                  ? `Anexar ${cart.length} Ítem(s) a Cocina`
                  : 'Enviar a Cocina'}
              </span>
            </button>

            {activeOrder && (
              <div className="flex items-center justify-between py-1.5 px-3 mb-2 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px]">
                <button
                  type="button"
                  onClick={handleReprintKitchen}
                  className="text-slate-400 hover:text-white flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-orange-400" />
                  <span>Reimprimir Cocina</span>
                </button>
                <span className="text-slate-700">•</span>
                <button
                  type="button"
                  onClick={handleRequestCheck}
                  className="text-slate-400 hover:text-amber-300 flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Imprimir Pre-Cuenta</span>
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {/* Secondary Action: Pedir Cuenta (Waiters & Everyone when order exists) */}
              {activeOrder && (
                <button
                  type="button"
                  onClick={handleRequestCheck}
                  className="py-2.5 px-2 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 cursor-pointer transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Pedir Cuenta</span>
                </button>
              )}

              {/* Tertiary Action: Cobrar Orden (Cashier / Manager / Admin) */}
              {isCashierOrManager ? (
                <button
                  disabled={(cart.length === 0 && !activeOrder) || submitting}
                  onClick={handleOpenCheckout}
                  className={`${activeOrder ? '' : 'col-span-2'} py-2.5 px-2 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all ${
                    cart.length > 0 || activeOrder
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 cursor-pointer'
                      : 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800'
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Cobrar Orden</span>
                </button>
              ) : (
                <div className="py-2 px-1 text-[11px] text-slate-500 flex items-center justify-center text-center">
                  Cobro en Caja
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Checkout & Multi-payment */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowCheckoutModal(false);
                setSplitProgressMessage('');
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-xs font-bold text-orange-400 uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Caja & Facturación</span>
            </div>
            <h3 className="text-xl font-black text-white">Cobro de Orden</h3>
            <p className="text-xs text-slate-400 mb-4">
              Mesa: {currentTable?.label || 'Para Llevar'} • Comprobante Correlativo
            </p>

            {/* Split Progress Message */}
            {splitProgressMessage && (
              <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-xs font-medium flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{splitProgressMessage}</span>
              </div>
            )}

            {/* MODE SELECTION TABS */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/60 rounded-2xl border border-slate-800 mb-5">
              <button
                type="button"
                onClick={() => setCheckoutMode('single')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                  checkoutMode === 'single'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Cobro Total</span>
              </button>

              <button
                type="button"
                onClick={() => setCheckoutMode('equal')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                  checkoutMode === 'equal'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Divide className="w-3.5 h-3.5" />
                <span>Partes Iguales</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCheckoutMode('items');
                  if (activeOrder?.items?.length > 0 && selectedItemIds.length === 0) {
                    setSelectedItemIds(activeOrder.items.map((i: any) => i.id));
                  }
                }}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                  checkoutMode === 'items'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ListChecks className="w-3.5 h-3.5" />
                <span>Por Ítems</span>
              </button>
            </div>

            {/* MODE 1: DISCOUNT CONTROLS (Single mode) */}
            {checkoutMode === 'single' && (
              <div className="p-3.5 bg-slate-800/60 rounded-2xl border border-slate-700/60 mb-5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 text-xs font-bold text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applyDiscount}
                      onChange={(e) => setApplyDiscount(e.target.checked)}
                      className="rounded border-slate-700 text-orange-600 focus:ring-orange-500 w-4 h-4 bg-slate-900 cursor-pointer"
                    />
                    <span className="flex items-center space-x-1.5">
                      <Tag className="w-3.5 h-3.5 text-orange-400" />
                      <span>Aplicar Descuento / Cortesía</span>
                    </span>
                  </label>
                  {applyDiscount && (
                    <div className="flex space-x-1">
                      <button
                        type="button"
                        onClick={() => setDiscountType('percent')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          discountType === 'percent'
                            ? 'bg-orange-600 text-white'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        % Porcentaje
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiscountType('fixed')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          discountType === 'fixed'
                            ? 'bg-orange-600 text-white'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        $ Fijo
                      </button>
                    </div>
                  )}
                </div>

                {applyDiscount && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/50">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-semibold mb-1">
                        {discountType === 'percent' ? 'Porcentaje (%)' : 'Monto Fijo ($)'}:
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                        placeholder="Ej. 10"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-semibold mb-1">
                        Motivo del Descuento (Auditoría):
                      </label>
                      <input
                        type="text"
                        value={discountReason}
                        onChange={(e) => setDiscountReason(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
                        placeholder="Ej. Cortesía del Chef"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MODE 2: EQUAL SPLIT CONTROLS */}
            {checkoutMode === 'equal' && (
              <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 mb-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-orange-400" />
                    <span className="text-xs font-bold text-slate-200">Número de Comensales:</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setEqualSplitCount(Math.max(2, equalSplitCount - 1))}
                      className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center font-bold text-sm cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-base font-black text-orange-400 font-mono">
                      {equalSplitCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEqualSplitCount(Math.min(10, equalSplitCount + 1))}
                      className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center font-bold text-sm cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Cobro actual:</span>
                  <span className="font-bold text-amber-400">
                    Parte {currentSplitIndex} de {equalSplitCount}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Cada comensal puede pagar con un método de pago distinto. Al completar la última parte, la mesa se liberará y el inventario se descargará.
                </p>
              </div>
            )}

            {/* MODE 3: SPLIT BY ITEMS CONTROLS */}
            {checkoutMode === 'items' && (
              <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 mb-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">
                    Platos a Cobrar en este Comprobante:
                  </span>
                  <div className="space-x-2">
                    <button
                      type="button"
                      onClick={() => setSelectedItemIds(activeOrder?.items?.map((i: any) => i.id) || [])}
                      className="text-[10px] text-orange-400 hover:underline cursor-pointer"
                    >
                      Todos
                    </button>
                    <span className="text-slate-600">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedItemIds([])}
                      className="text-[10px] text-slate-400 hover:underline cursor-pointer"
                    >
                      Ninguno
                    </button>
                  </div>
                </div>

                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  {orderItemsList.map((item: any) => {
                    const isChecked = selectedItemIds.includes(item.id);
                    const itemSubtotal = parseFloat(item.unitPrice || '0') * (item.quantity || 1);
                    return (
                      <label
                        key={item.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-slate-800 border-orange-500/50 text-white'
                            : 'bg-slate-900/50 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItemIds([...selectedItemIds, item.id]);
                              } else {
                                setSelectedItemIds(selectedItemIds.filter((id) => id !== item.id));
                              }
                            }}
                            className="rounded border-slate-700 text-orange-600 focus:ring-orange-500 w-3.5 h-3.5 bg-slate-900 cursor-pointer"
                          />
                          <span className="font-semibold">{item.quantity}x {item.product?.name || 'Ítem'}</span>
                        </div>
                        <span className="font-mono font-bold">${itemSubtotal.toLocaleString()}</span>
                      </label>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-400">
                  Solo se descargarán del inventario los platos seleccionados. Los no seleccionados se mantendrán activos en la mesa.
                </p>
              </div>
            )}

            {/* Breakdown */}
            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60 mb-5 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal alimentos y bebidas:</span>
                <span className="font-mono text-slate-200">
                  ${(checkoutMode === 'items' ? selectedItemsSubtotal : baseSubtotal).toLocaleString()}
                </span>
              </div>

              {checkoutMode === 'single' && applyDiscount && calculatedDiscount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Descuento ({discountType === 'percent' ? `${discountValue}%` : 'Fijo'} - {discountReason}):</span>
                  <span className="font-mono">-${calculatedDiscount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-400">
                <span>{taxLabel}</span>
                <span className="font-mono text-slate-200">
                  ${(checkoutMode === 'items' ? selectedItemsTax : effectiveTax).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-slate-400 items-center pt-1 border-t border-slate-700/60">
                <span className="flex items-center space-x-2">
                  <span>Propina Voluntaria:</span>
                  <div className="flex space-x-1">
                    {[0, 5, 10].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setTipPct(pct)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tipPct === pct
                            ? 'bg-orange-600 text-white'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </span>
                <span className="font-mono text-emerald-400">
                  +${(checkoutMode === 'items' ? selectedItemsTip : tipAmount).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-700">
                <span>
                  {checkoutMode === 'equal'
                    ? `TOTAL ESTA PARTE (${currentSplitIndex}/${equalSplitCount}):`
                    : checkoutMode === 'items'
                    ? `TOTAL ÍTEMS SELECCIONADOS:`
                    : 'TOTAL A COBRAR:'}
                </span>
                <span className="font-mono text-orange-400">
                  ${currentPayableAmount.toLocaleString()} {settings.currency || 'COP'}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Método de Pago:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`py-3 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center space-y-1 ${
                      paymentMethod === 'cash'
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <DollarSign className="w-5 h-5" />
                    <span>Efectivo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card_credit')}
                    className={`py-3 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center space-y-1 ${
                      paymentMethod === 'card_credit'
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Tarjeta</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('transfer')}
                    className={`py-3 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center space-y-1 ${
                      paymentMethod === 'transfer'
                        ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/20'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Send className="w-5 h-5" />
                    <span>Transferencia</span>
                  </button>
                </div>
              </div>

              {/* Cash Calculator */}
              {paymentMethod === 'cash' && (
                <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      Efectivo Recibido:
                    </label>
                    <div className="flex space-x-1.5">
                      {[Math.ceil(currentPayableAmount), 50000, 100000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setCashTendered(amt.toString())}
                          className="text-[10px] bg-slate-700 hover:bg-slate-600 text-slate-300 px-2 py-1 rounded-md"
                        >
                          ${amt.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3.5 top-2 text-slate-400 text-sm font-bold">$</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={cashTendered}
                      onChange={(e) => setCashTendered(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-4 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {tenderedNum > 0 && (
                    <div className="flex justify-between items-center text-xs font-bold pt-2 border-t border-slate-700">
                      <span className="text-slate-400">Cambio / Vueltas:</span>
                      <span className="font-mono text-emerald-400 text-sm">
                        ${changeDue.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Card / Transfer Reference */}
              {['card_credit', 'transfer'].includes(paymentMethod) && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Número de Aprobación / Referencia:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. VOUCHER-9841 o Ref Nequi"
                    value={cardReference}
                    onChange={(e) => setCardReference(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}
            </div>

            {/* Confirm Payment Button */}
            <div className="pt-6">
              <button
                disabled={processingPayment || (checkoutMode === 'items' && selectedItemIds.length === 0)}
                onClick={handleConfirmPayment}
                className="w-full py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-2xl text-sm transition-all shadow-xl shadow-orange-600/30 cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-5 h-5" />
                <span>
                  {processingPayment
                    ? 'Emitiendo Comprobante & Procesando...'
                    : checkoutMode === 'equal'
                    ? `Cobrar Parte ${currentSplitIndex} de ${equalSplitCount} ($${amountPerPerson.toLocaleString()})`
                    : checkoutMode === 'items'
                    ? `Cobrar ${selectedItemIds.length} Ítem(s) ($${selectedItemsTotal.toLocaleString()})`
                    : `Confirmar Cobro Total ($${total.toLocaleString()})`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Payment Receipt Confirmation */}
      {receiptSuccess && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-xl font-black text-white">¡Pago Exitoso!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Comprobante #{receiptSuccess.receiptNumber} emitido.
              </p>
            </div>

            <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs space-y-1.5 text-left text-slate-300 font-mono">
              <div className="flex justify-between">
                <span>Total Cobrado:</span>
                <span className="font-bold text-white">${parseFloat(receiptSuccess.total).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Mesa:</span>
                <span>Liberada (Libre)</span>
              </div>
              <div className="flex justify-between text-purple-400">
                <span>Insumos / Receta:</span>
                <span>Descontados del stock</span>
              </div>
            </div>

            <div className="pt-2 flex items-center space-x-2">
              <button
                onClick={() => {
                  setReceiptSuccess(null);
                  setShowCheckoutModal(false);
                }}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cerrar
              </button>

              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Nuevo Cliente CRM / Facturación Fiscal */}
      {showCreateCustomerModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowCreateCustomerModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-xs font-bold text-pink-400 uppercase mb-1">
              <UserPlus className="w-4 h-4" />
              <span>CRM & Facturación Fiscal</span>
            </div>
            <h3 className="text-xl font-black text-white mb-1">Registrar Cliente</h3>
            <p className="text-xs text-slate-400 mb-4">
              Ingresa los datos para emitir factura y acumular puntos de fidelidad.
            </p>

            {customerFormError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs">
                {customerFormError}
              </div>
            )}

            <form onSubmit={handleCreateCustomer} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nombre Completo / Razón Social *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Laura Gómez / Empresa SAS"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Tipo Doc.</label>
                  <select
                    value={customerForm.documentType}
                    onChange={(e) => setCustomerForm({ ...customerForm, documentType: e.target.value })}
                    className="w-full px-2 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-pink-500"
                  >
                    <option value="CC">Cédula (CC)</option>
                    <option value="NIT">NIT</option>
                    <option value="CE">Cédula Ext. (CE)</option>
                    <option value="Passport">Pasaporte</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">Número de Doc. / NIT</label>
                  <input
                    type="text"
                    placeholder="Ej: 1020304050"
                    value={customerForm.documentNumber}
                    onChange={(e) => setCustomerForm({ ...customerForm, documentNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Teléfono / WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="300 123 4567"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="cliente@correo.com"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Dirección Fiscal / Domicilio</label>
                <input
                  type="text"
                  placeholder="Calle 123 # 45 - 67"
                  value={customerForm.address}
                  onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateCustomerModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={customerFormSubmitting}
                  className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition shadow-lg disabled:opacity-50"
                >
                  {customerFormSubmitting ? 'Guardando...' : 'Registrar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
