import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Store,
  Plus,
  Search,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Hash,
  ShieldCheck,
  Layers,
  Sparkles,
  CreditCard,
} from 'lucide-react';
import { CompanyItem, CreateCompanyPayload } from './types/restaurants.types';
import { restaurantsApi } from './api/restaurants.api';
import { CreateRestaurantModal } from './components/CreateRestaurantModal';
import {
  ManageSubscriptionModal,
  PlansAndCouponsManagerModal,
  saasApi,
} from '../saas-subscriptions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { useAuthStore } from '@/stores/auth.store';
import { useBrandingStore } from '@/stores/branding.store';

export const RestaurantsView: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // SaaS Subscriptions & Plans Management
  const [selectedSubCompany, setSelectedSubCompany] = useState<CompanyItem | null>(null);
  const [isPlansCouponsOpen, setIsPlansCouponsOpen] = useState(false);
  const [subscriptionsMap, setSubscriptionsMap] = useState<Record<string, any>>({});

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const [data, subs] = await Promise.all([
        restaurantsApi.getCompanies(),
        saasApi.getAllSubscriptions().catch(() => []),
      ]);
      setCompanies(data);

      const map: Record<string, any> = {};
      subs.forEach((item: any) => {
        if (item.subscription?.companyId) {
          map[item.subscription.companyId] = item;
        }
      });
      setSubscriptionsMap(map);
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar los restaurantes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleCreateRestaurant = async (payload: CreateCompanyPayload): Promise<boolean> => {
    setSubmitting(true);
    setActionError(null);
    try {
      const created = await restaurantsApi.createCompany(payload);
      toast.success(`Restaurante "${created.tradeName}" creado exitosamente`);
      await fetchCompanies();
      return true;
    } catch (err: any) {
      const message = err.message || 'No se pudo crear el restaurante';
      setActionError(message);
      toast.error(message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleSwitchToCompany = async (company: CompanyItem) => {
    try {
      localStorage.setItem('poscocina_company_id', company.id);
      const primaryVenue = company.venues?.find((v) => v.isPrimary) || company.venues?.[0];
      if (primaryVenue) {
        useAuthStore.getState().setVenueId(primaryVenue.id);
        await useBrandingStore.getState().switchVenue(primaryVenue.id);
      }
      await useBrandingStore.getState().loadAllVenues(company.id);
      toast.success(`Cambiaste al restaurante "${company.tradeName}"`, {
        description: `Sede activa: ${primaryVenue?.name || 'Sede Principal'}. Los ajustes ahora aplican a esta empresa.`,
      });
    } catch {
      toast.error('Error al cambiar de restaurante');
    }
  };

  const filteredCompanies = companies.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.tradeName.toLowerCase().includes(q) ||
      c.legalName.toLowerCase().includes(q) ||
      c.taxId.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q) ||
      c.venues?.some((v) => v.name.toLowerCase().includes(q))
    );
  });

  const totalCompanies = companies.length;
  const totalVenues = companies.reduce((acc, c) => acc + (c.venues?.length || 0), 0);
  const activeVenues = companies.reduce(
    (acc, c) => acc + (c.venues?.filter((v) => v.isActive)?.length || 0),
    0
  );

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto p-6 space-y-6 animate-in fade-in duration-200">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span>Restaurantes y Cadenas</span>
              <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                Super Admin
              </Badge>
            </h1>
            <p className="text-xs text-muted-foreground">
              Administración multi-tenant de marcas, razones sociales y sus sedes operativas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPlansCouponsOpen(true)}
            className="h-10 rounded-xl gap-2 border-primary/30 hover:border-primary/60 text-xs font-semibold"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">Tarifas & Cupones</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchCompanies}
            disabled={loading}
            className="h-10 rounded-xl gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>

          <Button
            onClick={() => {
              setActionError(null);
              setIsCreateOpen(true);
            }}
            className="h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Restaurante</span>
          </Button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl p-4 bg-card/60 backdrop-blur-xs border-border flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground font-medium">Empresas / Marcas</p>
            <p className="text-2xl font-black text-foreground">{totalCompanies}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </Card>

        <Card className="rounded-2xl p-4 bg-card/60 backdrop-blur-xs border-border flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground font-medium">Sedes Registradas</p>
            <p className="text-2xl font-black text-foreground">{totalVenues}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Store className="w-5 h-5" />
          </div>
        </Card>

        <Card className="rounded-2xl p-4 bg-card/60 backdrop-blur-xs border-border flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground font-medium">Sedes Operativas Activas</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{activeVenues}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar por nombre comercial, razón social, NIT o slug..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11 rounded-2xl bg-background border-border text-sm"
        />
      </div>

      {/* Grid of Companies */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando restaurantes registrados...</p>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <Card className="p-12 text-center rounded-3xl border-dashed border-2">
          <Building2 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <h3 className="font-bold text-base text-foreground">No se encontraron restaurantes</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No hay resultados para "${searchQuery}". Intente con otro término.`
              : 'Aún no hay empresas o restaurantes creados. Cree el primero con el botón superior.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((c) => (
            <Card
              key={c.id}
              className="rounded-3xl border-border hover:border-primary/40 transition shadow-sm overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Brand Banner */}
                <div
                  className="h-3 w-full"
                  style={{ backgroundColor: c.primaryColor || '#ea580c' }}
                />

                <div className="p-5 space-y-4">
                  {/* Brand & Names */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black uppercase shrink-0 border"
                        style={{
                          backgroundColor: `${c.primaryColor || '#ea580c'}15`,
                          borderColor: `${c.primaryColor || '#ea580c'}30`,
                          color: c.primaryColor || '#ea580c',
                        }}
                      >
                        {c.tradeName.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base text-foreground truncate">
                          {c.tradeName}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">{c.legalName}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        NIT: {c.taxId}
                      </Badge>
                      {(() => {
                        const subInfo = subscriptionsMap[c.id];
                        if (subInfo?.subscription?.isComplimentary) {
                          return (
                            <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[10px] font-bold gap-1 py-0.5">
                              <Sparkles className="w-3 h-3 fill-amber-500" />
                              100% Gratis
                            </Badge>
                          );
                        }
                        if (subInfo?.plan) {
                          return (
                            <Badge variant="outline" className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 py-0.5">
                              {subInfo.plan.name}
                            </Badge>
                          );
                        }
                        return (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground border-dashed py-0.5">
                            Sin Plan
                          </Badge>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Slug & Details */}
                  <div className="space-y-1.5 text-xs text-muted-foreground bg-muted/30 p-3 rounded-2xl border border-border/60">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-muted-foreground/80">
                        <Hash className="w-3.5 h-3.5" />
                        <span>Slug:</span>
                      </span>
                      <span className="font-mono font-medium text-foreground">{c.slug}</span>
                    </div>

                    {c.phone && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-muted-foreground/80">
                          <Phone className="w-3.5 h-3.5" />
                          <span>Teléfono:</span>
                        </span>
                        <span className="text-foreground">{c.phone}</span>
                      </div>
                    )}

                    {c.email && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-muted-foreground/80">
                          <Mail className="w-3.5 h-3.5" />
                          <span>Email:</span>
                        </span>
                        <span className="text-foreground truncate max-w-[160px]">{c.email}</span>
                      </div>
                    )}

                    {c.address && (
                      <div className="flex items-start justify-between gap-2 pt-1 border-t border-border/40">
                        <span className="flex items-center gap-1.5 text-muted-foreground/80 shrink-0">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Dirección:</span>
                        </span>
                        <span className="text-foreground text-right truncate">{c.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Venues (Sedes) List */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-primary" />
                        <span>Sedes ({c.venues?.length || 0})</span>
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {c.venues && c.venues.length > 0 ? (
                        c.venues.map((v) => (
                          <div
                            key={v.id}
                            className="flex items-center justify-between p-2 rounded-xl bg-card border border-border/60 text-xs"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <Store className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                              <span className="font-medium text-foreground truncate">{v.name}</span>
                              {v.isPrimary && (
                                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold shrink-0">
                                  ★ Principal
                                </span>
                              )}
                            </div>
                            <Badge
                              variant="outline"
                              className={`text-[9px] font-bold ${
                                v.isActive
                                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {v.isActive ? 'Activa' : 'Inactiva'}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px] text-muted-foreground italic">Sin sedes registradas</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-3.5 bg-muted/20 border-t border-border/60 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span
                    className="font-semibold"
                    style={{ color: c.primaryColor || '#ea580c' }}
                  >
                    {c.venues?.length || 0} sedes
                  </span>
                  <span>•</span>
                  <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedSubCompany(c)}
                    className="h-8 text-xs font-semibold gap-1.5 rounded-xl border-border hover:bg-muted"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Plan</span>
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => handleSwitchToCompany(c)}
                    className="h-8 text-xs font-semibold gap-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer"
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Administrar</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal for Creating Restaurant */}
      <CreateRestaurantModal
        isOpen={isCreateOpen}
        submitting={submitting}
        actionError={actionError}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateRestaurant}
      />

      {/* Modal for Managing Subscriptions & Complimentary Status */}
      <ManageSubscriptionModal
        isOpen={!!selectedSubCompany}
        company={selectedSubCompany}
        onClose={() => setSelectedSubCompany(null)}
        onUpdated={fetchCompanies}
      />

      {/* Modal for SuperAdmin Plans & Coupons Management */}
      <PlansAndCouponsManagerModal
        isOpen={isPlansCouponsOpen}
        onClose={() => setIsPlansCouponsOpen(false)}
        onChanged={fetchCompanies}
      />
    </div>
  );
};

export default RestaurantsView;
