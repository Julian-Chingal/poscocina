import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Tag,
  Receipt,
  PlusCircle,
  Gift,
  RefreshCw,
  CreditCard,
  DollarSign,
} from 'lucide-react';
import { saasApi } from '../api/saas.api';
import type {
  SaasPlan,
  SaasCoupon,
  SubscriptionDetail,
  SaasInvoice,
} from '../types/saas.types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/sonner';

interface ManageSubscriptionModalProps {
  isOpen: boolean;
  company: {
    id: string;
    tradeName: string;
    legalName: string;
    taxId: string;
    primaryColor?: string;
  } | null;
  onClose: () => void;
  onUpdated?: () => void;
}

export const ManageSubscriptionModal: React.FC<ManageSubscriptionModalProps> = ({
  isOpen,
  company,
  onClose,
  onUpdated,
}) => {
  const [plans, setPlans] = useState<SaasPlan[]>([]);
  const [subDetail, setSubDetail] = useState<SubscriptionDetail | null>(null);
  const [invoices, setInvoices] = useState<SaasInvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [isComplimentary, setIsComplimentary] = useState(false);
  const [complimentaryReason, setComplimentaryReason] = useState('Restaurante Aliado / Socio');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<SaasCoupon | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Manual payment form state
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentRef, setPaymentRef] = useState<string>('');
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [recordingPayment, setRecordingPayment] = useState(false);

  const loadData = useCallback(async () => {
    if (!company) return;
    try {
      setLoading(true);
      const [plansData, currentSub, invs] = await Promise.all([
        saasApi.getPlans(),
        saasApi.getCompanySubscription(company.id),
        saasApi.getCompanyInvoices(company.id),
      ]);
      setPlans(plansData);
      setSubDetail(currentSub);
      setInvoices(invs);

      if (currentSub?.subscription) {
        setSelectedPlanId(currentSub.subscription.planId);
        setBillingInterval(currentSub.subscription.billingInterval || 'month');
        setIsComplimentary(currentSub.subscription.isComplimentary);
        setComplimentaryReason(
          currentSub.subscription.complimentaryReason || 'Restaurante Aliado / Socio'
        );
        if (currentSub.coupon) {
          setAppliedCoupon(currentSub.coupon);
          setCouponCode(currentSub.coupon.code);
        }
      } else if (plansData.length > 0) {
        // Default to first active plan (e.g. Pro or Starter)
        const defaultPlan = plansData.find((p) => p.slug === 'pro') || plansData[0];
        setSelectedPlanId(defaultPlan.id);
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar los datos de suscripción');
    } finally {
      setLoading(false);
    }
  }, [company]);

  useEffect(() => {
    if (isOpen && company) {
      loadData();
    }
  }, [isOpen, company, loadData]);

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Ingresa un código de cupón');
      return;
    }
    try {
      setValidatingCoupon(true);
      const res = await saasApi.validateCoupon(
        couponCode.trim(),
        selectedPlanId || undefined,
        company?.id
      );
      setAppliedCoupon(res.coupon);
      toast.success(
        `¡Cupón "${res.coupon.code}" válido! Descuento: ${
          res.coupon.discountType === 'percentage'
            ? `${res.coupon.discountValue}%`
            : `$${Number(res.coupon.discountValue).toLocaleString()} COP`
        }`
      );
    } catch (err: any) {
      setAppliedCoupon(null);
      toast.error(err.message || 'Cupón inválido');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleSaveSubscription = async () => {
    if (!company || !selectedPlanId) {
      toast.error('Selecciona un plan de suscripción');
      return;
    }

    try {
      setSaving(true);
      await saasApi.assignSubscription({
        companyId: company.id,
        planId: selectedPlanId,
        billingInterval,
        isComplimentary,
        complimentaryReason: isComplimentary ? complimentaryReason : undefined,
        couponCode: !isComplimentary && appliedCoupon ? appliedCoupon.code : undefined,
      });

      toast.success(
        isComplimentary
          ? '¡Cortesía total (100% gratis) concedida exitosamente!'
          : 'Suscripción actualizada exitosamente'
      );
      await loadData();
      onUpdated?.();
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar la suscripción');
    } finally {
      setSaving(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subDetail?.subscription) {
      toast.error('No hay una suscripción activa');
      return;
    }
    const amountNum = parseFloat(paymentAmount);
    if (isNaN(amountNum) || amountNum < 0) {
      toast.error('Ingresa un monto válido');
      return;
    }

    try {
      setRecordingPayment(true);
      await saasApi.recordManualPayment({
        subscriptionId: subDetail.subscription.id,
        amount: amountNum,
        paymentReference: paymentRef || undefined,
        notes: paymentNotes || undefined,
      });

      toast.success('Pago manual registrado exitosamente');
      setPaymentAmount('');
      setPaymentRef('');
      setPaymentNotes('');
      setShowPaymentForm(false);
      await loadData();
      onUpdated?.();
    } catch (err: any) {
      toast.error(err.message || 'Error al registrar el pago');
    } finally {
      setRecordingPayment(false);
    }
  };

  const activePlan = plans.find((p) => p.id === selectedPlanId);
  const basePrice = activePlan ? Number(activePlan.price) : 0;
  let discountAmount = 0;
  if (!isComplimentary && appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = (basePrice * Number(appliedCoupon.discountValue)) / 100;
    } else {
      discountAmount = Math.min(basePrice, Number(appliedCoupon.discountValue));
    }
  }
  const finalPrice = isComplimentary ? 0 : Math.max(0, basePrice - discountAmount);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:rounded-3xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between gap-3">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Suscripción & Facturación SaaS
            </DialogTitle>
            {subDetail?.subscription?.isComplimentary && (
              <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1.5 py-1">
                <Sparkles className="w-3.5 h-3.5 fill-amber-500" />
                Cortesía Total (100% Gratis)
              </Badge>
            )}
          </div>
          <DialogDescription className="text-xs">
            Administra el plan de cobro, descuentos y condiciones para{' '}
            <strong className="text-foreground">{company?.tradeName}</strong> (NIT: {company?.taxId}).
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-muted-foreground text-sm">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <span>Cargando suscripción y planes...</span>
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            {/* Status Card */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Estado Actual
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <h4 className="text-base font-bold text-foreground">
                    {subDetail?.plan ? subDetail.plan.name : 'Sin Plan Asignado'}
                  </h4>
                  {subDetail?.subscription && (
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold uppercase ${
                        subDetail.subscription.status === 'complimentary'
                          ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                          : subDetail.subscription.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                          : 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                      }`}
                    >
                      {subDetail.subscription.status}
                    </Badge>
                  )}
                </div>
                {subDetail?.subscription && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Periodo vigente hasta:{' '}
                    <span className="font-medium text-foreground">
                      {new Date(subDetail.subscription.currentPeriodEnd).toLocaleDateString()}
                    </span>
                  </p>
                )}
              </div>

              {subDetail?.subscription?.isComplimentary && (
                <div className="text-right">
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1 justify-end">
                    <Gift className="w-4 h-4" /> Bonificado
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    {subDetail.subscription.complimentaryReason}
                  </p>
                </div>
              )}
            </div>

            {/* TOGGLE: GRATIS TODO (CORTESÍA 100%) */}
            <div className="p-4 rounded-2xl border-2 border-amber-500/30 bg-amber-500/5 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-amber-600" />
                    <label className="text-sm font-bold text-foreground cursor-pointer">
                      Dar Gratis Todo al Restaurante (Cortesía Total 100%)
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Exonera completamente del pago, activa todos los módulos y otorga límites ilimitados.
                  </p>
                </div>
                <Switch
                  checked={isComplimentary}
                  onCheckedChange={(checked) => setIsComplimentary(checked)}
                />
              </div>

              {isComplimentary && (
                <div className="pt-2 border-t border-amber-500/20 space-y-2">
                  <label className="text-xs font-semibold text-foreground">
                    Motivo de la Cortesía / Alianza:
                  </label>
                  <Input
                    value={complimentaryReason}
                    onChange={(e) => setComplimentaryReason(e.target.value)}
                    placeholder="Ej. Socio Fundador, Restaurante Piloto, Alianza Comercial"
                    className="text-xs bg-background"
                  />
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-300 font-medium pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Facturación de software bonificada a $0 COP. Módulos KDS, Sedes y Mesas ilimitados.</span>
                  </div>
                </div>
              )}
            </div>

            {/* PLAN SELECTION & COUPONS */}
            <div className="space-y-4">
              <h4 className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                Configuración del Plan
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {plans.map((p) => {
                  const isSelected = selectedPlanId === p.id;
                  const priceFormatted = Number(p.price).toLocaleString();
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPlanId(p.id)}
                      className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm'
                          : 'border-border/70 hover:border-border hover:bg-muted/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-sm text-foreground">{p.name}</span>
                        <span className="text-xs font-extrabold text-primary">
                          ${priceFormatted} <span className="text-[10px] text-muted-foreground font-normal">/{p.billingInterval}</span>
                        </span>
                      </div>
                      {p.description && (
                        <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                          {p.description}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-1">
                        <Badge variant="secondary" className="text-[9px]">
                          {p.limits?.maxVenues === -1 ? 'Sedes ilimitadas' : `Hasta ${p.limits?.maxVenues || 1} sedes`}
                        </Badge>
                        <Badge variant="secondary" className="text-[9px]">
                          {p.features?.kds ? 'KDS Activo' : 'Sin KDS'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Coupon Redemption Input (Only if not complimentary) */}
              {!isComplimentary && (
                <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Tag className="w-3.5 h-3.5 text-primary" />
                    <span>Aplicar Cupón de Descuento</span>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Ej. ZOGUI50, BIENVENIDA100"
                      className="font-mono uppercase text-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleValidateCoupon}
                      disabled={validatingCoupon || !couponCode.trim()}
                      className="shrink-0 text-xs"
                    >
                      {validatingCoupon ? 'Validando...' : 'Aplicar'}
                    </Button>
                  </div>

                  {appliedCoupon && (
                    <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                      <span>
                        Cupón <strong>{appliedCoupon.code}</strong> aplicado ({appliedCoupon.name})
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setAppliedCoupon(null);
                          setCouponCode('');
                        }}
                        className="h-6 text-[11px] text-muted-foreground hover:text-destructive"
                      >
                        Quitar
                      </Button>
                    </div>
                  )}

                  {/* Summary of Price */}
                  <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Valor a cobrar por período:</span>
                    <div className="text-right">
                      {discountAmount > 0 && (
                        <span className="line-through text-muted-foreground text-[11px] mr-2">
                          ${basePrice.toLocaleString()} COP
                        </span>
                      )}
                      <span className="font-black text-base text-foreground">
                        ${finalPrice.toLocaleString()} COP
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSaveSubscription}
              disabled={saving}
              className="w-full h-11 rounded-xl text-sm font-bold shadow-md"
            >
              {saving ? 'Guardando...' : isComplimentary ? 'Conceder Cortesía Total (100% Gratis)' : 'Guardar y Actualizar Suscripción'}
            </Button>

            {/* SECTION: INVOICES & MANUAL PAYMENTS */}
            <div className="pt-4 border-t border-border/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-bold text-foreground">
                    Historial de Facturación y Pagos
                  </h4>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowPaymentForm(!showPaymentForm)}
                  className="text-xs h-7 gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  {showPaymentForm ? 'Cancelar' : 'Registrar Pago Manual'}
                </Button>
              </div>

              {/* Record Manual Payment Form */}
              {showPaymentForm && (
                <form
                  onSubmit={handleRecordPayment}
                  className="p-4 rounded-2xl bg-muted/40 border border-primary/30 space-y-3"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Registrar Cobro Manual (Transferencia / Consignación)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground">
                        Monto Pagado (COP):
                      </label>
                      <Input
                        type="number"
                        required
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="Ej. 149000"
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground">
                        Referencia / Comprobante:
                      </label>
                      <Input
                        value={paymentRef}
                        onChange={(e) => setPaymentRef(e.target.value)}
                        placeholder="Ej. Transf. Bancolombia #8372"
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground">
                      Notas u Observaciones:
                    </label>
                    <Input
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      placeholder="Ej. Pago correspondiente a la mensualidad de Noviembre"
                      className="text-xs"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={recordingPayment}
                    size="sm"
                    className="w-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {recordingPayment ? 'Registrando...' : 'Confirmar y Extender Suscripción'}
                  </Button>
                </form>
              )}

              {/* Invoices List */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {invoices.length > 0 ? (
                  invoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-2.5 rounded-xl bg-card border border-border/60 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">
                            ${Number(inv.amountPaid).toLocaleString()} COP
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[9px] font-bold ${
                              inv.status === 'free_waiver'
                                ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                                : inv.status === 'paid'
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {inv.status === 'free_waiver'
                              ? 'CORTESÍA 100%'
                              : inv.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {inv.notes || (inv.paymentReference ? `Ref: ${inv.paymentReference}` : 'Factura de suscripción')} • {new Date(inv.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="text-right text-[11px] text-muted-foreground">
                        {inv.paidAt ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            Pagado
                          </span>
                        ) : (
                          <span className="text-amber-600">Pendiente</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic text-center py-3">
                    No hay facturas registradas para esta empresa.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
