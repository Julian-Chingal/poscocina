import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  CreditCard,
  Layers,
  Tag,
  Building2,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { saasApi } from './api/saas.api';
import { restaurantsApi } from '../restaurants/api/restaurants.api';
import type { CompanyItem } from '../restaurants/types/restaurants.types';
import type { SaasPlan, SaasCoupon } from './types/saas.types';
import { ManageSubscriptionModal } from './components/ManageSubscriptionModal';
import { PlansAndCouponsManagerModal } from './components/PlansAndCouponsManagerModal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';

export const SaasSubscriptionsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tenants' | 'plans' | 'coupons'>('tenants');
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [subscriptionsMap, setSubscriptionsMap] = useState<Record<string, any>>({});
  const [plans, setPlans] = useState<SaasPlan[]>([]);
  const [coupons, setCoupons] = useState<SaasCoupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [selectedCompany, setSelectedCompany] = useState<CompanyItem | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [comps, subs, plansData, couponsData] = await Promise.all([
        restaurantsApi.getCompanies(),
        saasApi.getAllSubscriptions().catch(() => []),
        saasApi.getPlans(),
        saasApi.getCoupons(),
      ]);

      setCompanies(comps);
      setPlans(plansData);
      setCoupons(couponsData);

      const map: Record<string, any> = {};
      subs.forEach((item: any) => {
        if (item.subscription?.companyId) {
          map[item.subscription.companyId] = item;
        }
      });
      setSubscriptionsMap(map);
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar datos de facturación SaaS');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Metrics
  const totalCompanies = companies.length;
  const complimentaryCount = Object.values(subscriptionsMap).filter(
    (s: any) => s.subscription?.isComplimentary
  ).length;
  const activePaidCount = Object.values(subscriptionsMap).filter(
    (s: any) => s.subscription?.status === 'active' && !s.subscription?.isComplimentary
  ).length;

  const filteredCompanies = companies.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.tradeName.toLowerCase().includes(q) ||
      c.legalName.toLowerCase().includes(q) ||
      c.taxId.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-foreground">
                  Planes & Suscripciones SaaS
                </h1>
                <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                  Super Admin
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Monetización de restaurantes: tarifas, cupones de descuento y cortesías 100% bonificadas
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="h-10 rounded-xl gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>

          <Button
            onClick={() => setIsConfigOpen(true)}
            className="h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Plan / Cupón</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="rounded-2xl p-4 bg-card/60 backdrop-blur-xs border-border flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground font-medium">Restaurantes Totales</p>
            <p className="text-2xl font-black text-foreground">{totalCompanies}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </Card>

        <Card className="rounded-2xl p-4 bg-card/60 backdrop-blur-xs border-border flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground font-medium">Suscripciones Activas</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{activePaidCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </Card>

        <Card className="rounded-2xl p-4 bg-card/60 backdrop-blur-xs border-border flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground font-medium">100% Cortesía (Gratis)</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{complimentaryCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </Card>

        <Card className="rounded-2xl p-4 bg-card/60 backdrop-blur-xs border-border flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground font-medium">Cupones Activos</p>
            <p className="text-2xl font-black text-violet-600 dark:text-violet-400">{coupons.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 text-violet-600 dark:text-violet-400 flex items-center justify-center">
            <Tag className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="space-y-4">
        <TabsList className="grid w-full sm:w-[480px] grid-cols-3 rounded-2xl h-11 p-1 bg-muted/60">
          <TabsTrigger value="tenants" className="rounded-xl font-bold text-xs gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            Restaurantes ({companies.length})
          </TabsTrigger>
          <TabsTrigger value="plans" className="rounded-xl font-bold text-xs gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            Planes ({plans.length})
          </TabsTrigger>
          <TabsTrigger value="coupons" className="rounded-xl font-bold text-xs gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            Cupones ({coupons.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: RESTAURANTES Y SUSCRIPCIONES */}
        <TabsContent value="tenants" className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar restaurante por nombre, NIT o razón social..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-11 rounded-2xl bg-card border-border/80 text-sm shadow-xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCompanies.map((c) => {
              const subInfo = subscriptionsMap[c.id];
              const isComp = subInfo?.subscription?.isComplimentary;
              const plan = subInfo?.plan;

              return (
                <Card
                  key={c.id}
                  className="rounded-3xl border-border/70 overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-bold text-base text-foreground truncate">
                          {c.tradeName}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">{c.legalName}</p>
                      </div>

                      {isComp ? (
                        <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[10px] font-bold gap-1 shrink-0 py-0.5">
                          <Sparkles className="w-3 h-3 fill-amber-500" />
                          100% Gratis
                        </Badge>
                      ) : plan ? (
                        <Badge variant="outline" className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shrink-0 py-0.5">
                          {plan.name}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground border-dashed shrink-0 py-0.5">
                          Sin Plan
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2 p-3 rounded-2xl bg-muted/30 border border-border/60 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>NIT / Tax ID:</span>
                        <span className="font-mono text-foreground font-medium">{c.taxId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sedes creadas:</span>
                        <span className="text-foreground font-semibold">{c.venues?.length || 0} sedes</span>
                      </div>
                      {subInfo?.subscription && (
                        <div className="flex justify-between border-t border-border/40 pt-1.5">
                          <span>Vigencia hasta:</span>
                          <span className="text-foreground font-medium">
                            {new Date(subInfo.subscription.currentPeriodEnd).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 bg-muted/20 border-t border-border/60 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">
                      {isComp ? 'Cortesía bonificada' : plan ? `$${Number(plan.price).toLocaleString()} COP` : 'Inactivo'}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => setSelectedCompany(c)}
                      className="h-8 text-xs font-semibold gap-1.5 rounded-xl bg-primary text-primary-foreground"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Gestionar Plan</span>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* TAB 2: PLANES DISPONIBLES */}
        <TabsContent value="plans" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((p) => (
              <Card
                key={p.id}
                className="p-5 rounded-3xl border-border/70 flex flex-col justify-between space-y-4 hover:shadow-md transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {p.slug}
                    </Badge>
                    {p.price === '0.00' && (
                      <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[9px]">
                        VIP
                      </Badge>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{p.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {p.description || 'Sin descripción'}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-border/60">
                    <span className="text-2xl font-black text-primary">
                      ${Number(p.price).toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground"> COP/{p.billingInterval}</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-muted-foreground pt-2">
                    <div className="flex justify-between">
                      <span>Sedes:</span>
                      <strong className="text-foreground">{p.limits?.maxVenues === -1 ? 'Ilimitadas' : p.limits?.maxVenues}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Mesas:</span>
                      <strong className="text-foreground">{p.limits?.maxTables === -1 ? 'Ilimitadas' : p.limits?.maxTables}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Cocina KDS:</span>
                      <strong className="text-foreground">{p.features?.kds ? 'Incluido' : 'No incluido'}</strong>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB 3: CUPONES ACTIVOS */}
        <TabsContent value="coupons" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {coupons.map((cp) => (
              <Card key={cp.id} className="p-5 rounded-3xl border-border/70 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-mono font-bold text-sm bg-muted/40">
                    {cp.code}
                  </Badge>
                  <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-bold">
                    {cp.discountType === 'percentage'
                      ? `${cp.discountValue}% OFF`
                      : `$${Number(cp.discountValue).toLocaleString()} COP`}
                  </Badge>
                </div>
                <h4 className="font-bold text-sm text-foreground">{cp.name}</h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Duración: <strong className="text-foreground">{cp.duration}</strong></p>
                  <p>Usos canjeados: <strong className="text-foreground">{cp.timesRedeemed} / {cp.maxRedemptions ?? '∞'}</strong></p>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <ManageSubscriptionModal
        isOpen={!!selectedCompany}
        company={selectedCompany}
        onClose={() => setSelectedCompany(null)}
        onUpdated={loadData}
      />

      <PlansAndCouponsManagerModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onChanged={loadData}
      />
    </div>
  );
};

export default SaasSubscriptionsView;
