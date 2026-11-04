import React, { useState, useEffect } from 'react';
import {
  Layers,
  Tag,
  Plus,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { saasApi } from '../api/saas.api';
import type {
  SaasPlan,
  SaasCoupon,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';

interface PlansAndCouponsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChanged?: () => void;
}

export const PlansAndCouponsManagerModal: React.FC<PlansAndCouponsManagerModalProps> = ({
  isOpen,
  onClose,
  onChanged,
}) => {
  const [activeTab, setActiveTab] = useState<'plans' | 'coupons'>('plans');
  const [plans, setPlans] = useState<SaasPlan[]>([]);
  const [coupons, setCoupons] = useState<SaasCoupon[]>([]);
  const [loading, setLoading] = useState(false);

  // New Plan form state
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [planName, setPlanName] = useState('');
  const [planSlug, setPlanSlug] = useState('');
  const [planPrice, setPlanPrice] = useState('99000');
  const [planDesc, setPlanDesc] = useState('');
  const [planVenues, setPlanVenues] = useState('1');
  const [planTables, setPlanTables] = useState('20');
  const [planHasKds, setPlanHasKds] = useState(true);
  const [planHasDelivery, setPlanHasDelivery] = useState(true);
  const [submittingPlan, setSubmittingPlan] = useState(false);

  // New Coupon form state
  const [isCreatingCoupon, setIsCreatingCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponName, setCouponName] = useState('');
  const [couponType, setCouponType] = useState<'percentage' | 'fixed_amount'>('percentage');
  const [couponValue, setCouponValue] = useState('20');
  const [couponDuration, setCouponDuration] = useState<'once' | 'repeating' | 'forever'>('once');
  const [couponMaxUses, setCouponMaxUses] = useState('50');
  const [submittingCoupon, setSubmittingCoupon] = useState(false);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [plansData, couponsData] = await Promise.all([
        saasApi.getPlans(),
        saasApi.getCoupons(),
      ]);
      setPlans(plansData);
      setCoupons(couponsData);
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar planes y cupones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAll();
    }
  }, [isOpen]);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName.trim() || !planSlug.trim()) {
      toast.error('Nombre y slug son requeridos');
      return;
    }
    try {
      setSubmittingPlan(true);
      await saasApi.createPlan({
        name: planName.trim(),
        slug: planSlug.trim().toLowerCase(),
        price: parseFloat(planPrice) || 0,
        description: planDesc.trim() || undefined,
        billingInterval: 'month',
        trialDays: 14,
        features: {
          kds: planHasKds,
          inventory: true,
          delivery: planHasDelivery,
          reservations: true,
          advancedReports: false,
          multiStation: true,
        },
        limits: {
          maxVenues: parseInt(planVenues) || 1,
          maxTables: parseInt(planTables) || 20,
          maxUsers: 5,
          maxProducts: -1,
          maxOrdersPerMonth: -1,
        },
        isActive: true,
        isPublic: true,
      });

      toast.success('Plan creado exitosamente');
      setIsCreatingPlan(false);
      setPlanName('');
      setPlanSlug('');
      await loadAll();
      onChanged?.();
    } catch (err: any) {
      toast.error(err.message || 'Error al crear el plan');
    } finally {
      setSubmittingPlan(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim() || !couponName.trim()) {
      toast.error('Código y nombre del cupón son requeridos');
      return;
    }
    try {
      setSubmittingCoupon(true);
      await saasApi.createCoupon({
        code: couponCode.trim().toUpperCase(),
        name: couponName.trim(),
        discountType: couponType,
        discountValue: parseFloat(couponValue) || 0,
        duration: couponDuration,
        maxRedemptions: couponMaxUses ? parseInt(couponMaxUses) : undefined,
        isActive: true,
      });

      toast.success('Cupón creado exitosamente');
      setIsCreatingCoupon(false);
      setCouponCode('');
      setCouponName('');
      await loadAll();
      onChanged?.();
    } catch (err: any) {
      toast.error(err.message || 'Error al crear el cupón');
    } finally {
      setSubmittingCoupon(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Configuración de Tarifas & Descuentos SaaS
          </DialogTitle>
          <DialogDescription className="text-xs">
            Crea y administra los planes de suscripción y cupones de descuento para los restaurantes de Zogui.cloud.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-2 rounded-2xl h-11 p-1 bg-muted/60">
            <TabsTrigger value="plans" className="rounded-xl font-bold text-xs gap-2">
              <Layers className="w-4 h-4" />
              Planes de Suscripción ({plans.length})
            </TabsTrigger>
            <TabsTrigger value="coupons" className="rounded-xl font-bold text-xs gap-2">
              <Tag className="w-4 h-4" />
              Cupones de Descuento ({coupons.length})
            </TabsTrigger>
          </TabsList>

          {/* TAB: PLANS */}
          <TabsContent value="plans" className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Define los niveles de precio y límites de sedes/mesas.
              </span>
              <Button
                size="sm"
                onClick={() => setIsCreatingPlan(!isCreatingPlan)}
                className="text-xs font-bold gap-1.5 rounded-xl"
              >
                <Plus className="w-4 h-4" />
                {isCreatingPlan ? 'Cancelar' : 'Nuevo Plan'}
              </Button>
            </div>

            {/* Create Plan Form */}
            {isCreatingPlan && (
              <form
                onSubmit={handleCreatePlan}
                className="p-4 rounded-2xl bg-muted/30 border border-primary/30 space-y-3 text-xs"
              >
                <h4 className="font-bold text-foreground">Crear Nuevo Plan de Suscripción</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">Nombre del Plan:</label>
                    <Input
                      required
                      placeholder="Ej. Plan Gourmet"
                      value={planName}
                      onChange={(e) => {
                        setPlanName(e.target.value);
                        if (!planSlug) {
                          setPlanSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                        }
                      }}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">Slug único:</label>
                    <Input
                      required
                      placeholder="ej. gourmet"
                      value={planSlug}
                      onChange={(e) => setPlanSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      className="text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">Precio Mensual (COP):</label>
                    <Input
                      type="number"
                      required
                      placeholder="Ej. 129000"
                      value={planPrice}
                      onChange={(e) => setPlanPrice(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">Descripción:</label>
                    <Input
                      placeholder="Breve detalle de a quién va dirigido"
                      value={planDesc}
                      onChange={(e) => setPlanDesc(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-semibold text-muted-foreground">Máx Sedes (-1 ilimitado):</label>
                      <Input
                        type="number"
                        value={planVenues}
                        onChange={(e) => setPlanVenues(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-muted-foreground">Máx Mesas (-1 ilimitado):</label>
                      <Input
                        type="number"
                        value={planTables}
                        onChange={(e) => setPlanTables(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-foreground">
                    <input
                      type="checkbox"
                      checked={planHasKds}
                      onChange={(e) => setPlanHasKds(e.target.checked)}
                      className="rounded"
                    />
                    <span>Incluye Pantalla KDS Cocina</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-foreground">
                    <input
                      type="checkbox"
                      checked={planHasDelivery}
                      onChange={(e) => setPlanHasDelivery(e.target.checked)}
                      className="rounded"
                    />
                    <span>Incluye Módulo Delivery</span>
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={submittingPlan}
                  size="sm"
                  className="w-full font-bold mt-2 rounded-xl"
                >
                  {submittingPlan ? 'Guardando...' : 'Crear Plan'}
                </Button>
              </form>
            )}

            {/* Plans List */}
            {loading ? (
              <div className="py-8 flex items-center justify-center gap-2 text-muted-foreground text-xs">
                <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                <span>Cargando datos...</span>
              </div>
            ) : (
              <div className="space-y-2">
                {plans.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-2xl bg-card border border-border/60 flex items-center justify-between text-xs hover:border-border transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{p.name}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">({p.slug})</span>
                        {p.price === '0.00' && (
                          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[9px]">
                            CORTESÍA 100%
                          </Badge>
                        )}
                      </div>
                      {p.description && (
                        <p className="text-[11px] text-muted-foreground">{p.description}</p>
                      )}
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground/80 pt-0.5">
                        <span>Sedes: {p.limits?.maxVenues === -1 ? 'Ilimitadas' : p.limits?.maxVenues}</span>
                        <span>•</span>
                        <span>Mesas: {p.limits?.maxTables === -1 ? 'Ilimitadas' : p.limits?.maxTables}</span>
                        <span>•</span>
                        <span>KDS: {p.features?.kds ? 'Sí' : 'No'}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-primary">
                        ${Number(p.price).toLocaleString()} COP
                      </span>
                      <p className="text-[10px] text-muted-foreground">/{p.billingInterval}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB: COUPONS */}
          <TabsContent value="coupons" className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Crea códigos promocionales para aplicar descuentos en la facturación.
              </span>
              <Button
                size="sm"
                onClick={() => setIsCreatingCoupon(!isCreatingCoupon)}
                className="text-xs font-bold gap-1.5 rounded-xl"
              >
                <Plus className="w-4 h-4" />
                {isCreatingCoupon ? 'Cancelar' : 'Nuevo Cupón'}
              </Button>
            </div>

            {/* Create Coupon Form */}
            {isCreatingCoupon && (
              <form
                onSubmit={handleCreateCoupon}
                className="p-4 rounded-2xl bg-muted/30 border border-primary/30 space-y-3 text-xs"
              >
                <h4 className="font-bold text-foreground">Crear Nuevo Cupón de Descuento</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">Código del Cupón:</label>
                    <Input
                      required
                      placeholder="Ej. LANZAMIENTO50"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="text-xs font-mono uppercase"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">Nombre / Campaña:</label>
                    <Input
                      required
                      placeholder="Ej. Descuento de Apertura"
                      value={couponName}
                      onChange={(e) => setCouponName(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">Tipo de Descuento:</label>
                    <select
                      value={couponType}
                      onChange={(e: any) => setCouponType(e.target.value)}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm"
                    >
                      <option value="percentage">Porcentaje (%)</option>
                      <option value="fixed_amount">Monto Fijo (COP)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">
                      Valor del Descuento ({couponType === 'percentage' ? '%' : 'COP'}):
                    </label>
                    <Input
                      type="number"
                      required
                      placeholder={couponType === 'percentage' ? 'Ej. 50' : 'Ej. 50000'}
                      value={couponValue}
                      onChange={(e) => setCouponValue(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">Duración:</label>
                    <select
                      value={couponDuration}
                      onChange={(e: any) => setCouponDuration(e.target.value)}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm"
                    >
                      <option value="once">Un solo mes (Primer corte)</option>
                      <option value="repeating">Recurrente por varios meses</option>
                      <option value="forever">Perpetuo (100% vitalicio)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground">Máx. de Canjes Permitidos:</label>
                    <Input
                      type="number"
                      placeholder="Ej. 100"
                      value={couponMaxUses}
                      onChange={(e) => setCouponMaxUses(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={submittingCoupon}
                  size="sm"
                  className="w-full font-bold mt-2 rounded-xl"
                >
                  {submittingCoupon ? 'Guardando...' : 'Crear Cupón'}
                </Button>
              </form>
            )}

            {/* Coupons List */}
            <div className="space-y-2">
              {coupons.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-2xl bg-card border border-border/60 flex items-center justify-between text-xs hover:border-border transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono font-bold text-xs bg-muted/40">
                        {c.code}
                      </Badge>
                      <span className="font-semibold text-foreground">{c.name}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Duración: <strong className="text-foreground">{c.duration}</strong> • Usos: {c.timesRedeemed} / {c.maxRedemptions ?? '∞'}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-xs font-bold">
                      {c.discountType === 'percentage'
                        ? `${c.discountValue}% OFF`
                        : `$${Number(c.discountValue).toLocaleString()} COP`}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
