import React from 'react';
import {
  Plus,
  Store,
  Layers,
  Wallet,
  UtensilsCrossed,
  Users,
  Search,
  LayoutGrid,
  List,
  RefreshCw,
  Building,
  CheckCircle2,
  MapPin,
  Phone,
  Edit2,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useVenuesManagement } from '../hooks/useVenuesManagement';
import { VenueCard } from './VenueCard';
import { VenueModal } from './VenueModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Props {
  isActive: boolean;
}

export const VenuesTab: React.FC<Props> = ({ isActive }) => {
  const currentUser = useAuthStore((s) => s.currentUser);
  const {
    venues,
    filteredVenues,
    currentVenueId,
    summaries,
    chainMetrics,
    isModalOpen,
    editingVenue,
    isSaving,
    modalError,
    openCreateModal,
    openEditModal,
    closeModal,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    viewMode,
    setViewMode,
    isRefreshing,
    refreshData,
    handleSwitch,
    createVenue,
    updateVenue,
    toggleVenueStatus,
    deleteVenue,
  } = useVenuesManagement(isActive);

  const isSuperAdmin = currentUser?.roleName === 'super_admin';
  const canManage = isSuperAdmin || currentUser?.roleName === 'manager';

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-foreground text-xl">Red de Sucursales & Sedes</h3>
            <Badge variant="secondary" className="font-bold text-xs">
              {venues.length} {venues.length === 1 ? 'Sede' : 'Sedes'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
            Gestiona, monitorea en tiempo real y centraliza la operación de mesas, turnos de caja y personal de todas las sedes del negocio.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isRefreshing}
            className="h-9 px-3 rounded-xl text-xs font-semibold gap-1.5 cursor-pointer"
            title="Sincronizar estado en tiempo real"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
            <span className="hidden sm:inline">Sincronizar</span>
          </Button>

          {isSuperAdmin && (
            <Button
              type="button"
              onClick={openCreateModal}
              className="flex items-center space-x-1.5 px-4 h-9 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs transition cursor-pointer shadow-md shadow-primary/20 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Sede</span>
            </Button>
          )}
        </div>
      </div>

      {/* Global Chain Operations Bar (Executive Metrics) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {/* Total Sedes */}
        <Card className="p-3.5 bg-card border-border/80 rounded-2xl flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span className="font-medium text-[11px]">Sedes Totales</span>
            <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Store className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-foreground tracking-tight">
              {chainMetrics.totalVenues}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{chainMetrics.activeVenues} activas</span>
            </div>
          </div>
        </Card>

        {/* Global Tables */}
        <Card className="p-3.5 bg-card border-border/80 rounded-2xl flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span className="font-medium text-[11px]">Mesas en Red</span>
            <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-foreground tracking-tight">
              {chainMetrics.totalTables}
            </span>
            <span className="text-[11px] font-mono font-medium text-muted-foreground">
              {chainMetrics.occupiedTables} ocupadas ({chainMetrics.occupancyRate}%)
            </span>
          </div>
        </Card>

        {/* Open Cash Shifts */}
        <Card className="p-3.5 bg-card border-border/80 rounded-2xl flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span className="font-medium text-[11px]">Cajas Operando</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-foreground tracking-tight">
              {chainMetrics.openShiftsCount}
            </span>
            <span className="text-[11px] text-muted-foreground">
              de {chainMetrics.activeVenues} sedes
            </span>
          </div>
        </Card>

        {/* Active Orders */}
        <Card className="p-3.5 bg-card border-border/80 rounded-2xl flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span className="font-medium text-[11px]">Comandas Activas</span>
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <UtensilsCrossed className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-foreground tracking-tight">
              {chainMetrics.totalActiveOrders}
            </span>
            <span className="text-[11px] text-muted-foreground">en cocina</span>
          </div>
        </Card>

        {/* Active Staff */}
        <Card className="p-3.5 bg-card border-border/80 rounded-2xl flex flex-col justify-between shadow-xs col-span-2 md:col-span-4 lg:col-span-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span className="font-medium text-[11px]">Personal en Turno</span>
            <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-foreground tracking-tight">
              {chainMetrics.totalActiveStaff}
            </span>
            <span className="text-[11px] text-muted-foreground">colaboradores</span>
          </div>
        </Card>
      </div>

      {/* Control & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-muted/30 p-2 rounded-2xl border border-border/60">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, dirección, código o ciudad..."
              className="pl-8 text-xs h-9 bg-background/80 border-border/60 focus:bg-background rounded-xl"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground hover:text-foreground font-bold px-1.5 py-0.5 rounded cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2">
          {/* Status Filter Tabs */}
          <div className="flex items-center bg-muted/80 p-0.5 rounded-xl border border-border/50 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Todas ({venues.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Activas ({chainMetrics.activeVenues})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('inactive')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                statusFilter === 'inactive'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Inactivas ({chainMetrics.inactiveVenues})
            </button>
          </div>

          {/* View Mode Toggle: Grid vs Table */}
          <div className="flex items-center bg-muted/80 p-0.5 rounded-xl border border-border/50">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              title="Vista Cuadrícula"
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              title="Vista Tabla"
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredVenues.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center space-y-3 border-dashed border-border rounded-2xl">
          <div className="w-12 h-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center">
            <Store className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-foreground text-sm">No se encontraron sedes</h4>
            <p className="text-xs text-muted-foreground max-w-sm">
              {searchTerm
                ? `No hay sucursales que coincidan con la búsqueda "${searchTerm}".`
                : 'No hay sucursales registradas con el filtro seleccionado.'}
            </p>
          </div>
          {searchTerm && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSearchTerm('')}
              className="text-xs rounded-xl cursor-pointer"
            >
              Limpiar Búsqueda
            </Button>
          )}
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="space-y-6">
          {/* If there is only 1 venue, show it in a nicely proportioned 2-column layout with an informative expansion card */}
          {venues.length === 1 && !searchTerm && statusFilter === 'all' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Sede Card takes 7 columns */}
              <div className="lg:col-span-7">
                <VenueCard
                  key={filteredVenues[0].id}
                  venue={filteredVenues[0]}
                  isCurrent={filteredVenues[0].id === currentVenueId}
                  canManage={canManage}
                  isSuperAdmin={isSuperAdmin}
                  summary={summaries[filteredVenues[0].id]?.stats}
                  onSwitch={handleSwitch}
                  onEdit={openEditModal}
                  onToggleStatus={toggleVenueStatus}
                  onDelete={deleteVenue}
                />
              </div>

              {/* Expansion / Multi-branch info card takes 5 columns */}
              <div className="lg:col-span-5 space-y-4">
                <Card className="p-6 bg-gradient-to-br from-primary/5 via-card to-card border-border/80 rounded-2xl space-y-4 shadow-sm">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <Building className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-foreground text-sm">
                      Expansión Multi-Sucursal
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Zogui.cloud te permite operar cadenas de restaurantes con múltiples sucursales bajo una misma cuenta empresarial.
                    </p>
                  </div>

                  <div className="space-y-2.5 text-xs text-muted-foreground pt-1">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Catálogos y Precios:</strong> Comparte el menú o maneja precios y platos independientes por sede.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Mesas y Salones:</strong> Distribución y planos de mesas personalizados para cada punto físico.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Caja e Impresoras:</strong> Arqueos de caja independientes y tickets en periféricos locales de cada local.</span>
                    </div>
                  </div>

                  {isSuperAdmin && (
                    <div className="pt-2">
                      <Button
                        type="button"
                        onClick={openCreateModal}
                        variant="outline"
                        className="w-full text-xs font-bold rounded-xl border-primary/30 text-primary hover:bg-primary/10 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        Registrar Sede Adicional
                      </Button>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          ) : (
            <div className="w-full min-w-0 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
              {filteredVenues.map((v) => (
                <VenueCard
                  key={v.id}
                  venue={v}
                  isCurrent={v.id === currentVenueId}
                  canManage={canManage}
                  isSuperAdmin={isSuperAdmin}
                  summary={summaries[v.id]?.stats}
                  onSwitch={handleSwitch}
                  onEdit={openEditModal}
                  onToggleStatus={toggleVenueStatus}
                  onDelete={deleteVenue}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Detailed Table View */
        <Card className="overflow-hidden rounded-2xl border-border/80 shadow-xs">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="border-border">
                <TableHead className="text-xs font-bold text-foreground">Sede & Código</TableHead>
                <TableHead className="text-xs font-bold text-foreground">Ubicación & Contacto</TableHead>
                <TableHead className="text-xs font-bold text-foreground text-center">Estado</TableHead>
                <TableHead className="text-xs font-bold text-foreground text-center">Mesas</TableHead>
                <TableHead className="text-xs font-bold text-foreground text-center">Caja</TableHead>
                <TableHead className="text-xs font-bold text-foreground text-center">Comandas</TableHead>
                <TableHead className="text-xs font-bold text-foreground text-center">Personal</TableHead>
                <TableHead className="text-xs font-bold text-foreground text-right pr-6">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVenues.map((v) => {
                const isCurrent = v.id === currentVenueId;
                const isActive = v.isActive !== false;
                const stats = summaries[v.id]?.stats;
                const settings = (v.settings || {}) as Record<string, any>;
                const phone = v.phone || settings.phone || '';
                const slug = v.slug || settings.slug || v.name.toLowerCase().replace(/\s+/g, '-');

                return (
                  <TableRow
                    key={v.id}
                    className={`border-border transition-colors ${
                      isCurrent ? 'bg-primary/5 font-medium' : 'hover:bg-muted/30'
                    }`}
                  >
                    {/* Sede & Code */}
                    <TableCell className="py-3.5">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isCurrent
                              ? 'bg-primary text-primary-foreground shadow-xs'
                              : 'bg-muted text-foreground'
                          }`}
                        >
                          <Store className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-foreground">{v.name}</span>
                            {v.isPrimary && (
                              <Badge
                                variant="outline"
                                className="text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 px-1 py-0"
                              >
                                Principal
                              </Badge>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            /{slug}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Location & Contact */}
                    <TableCell className="py-3.5">
                      <div className="space-y-0.5 text-xs text-muted-foreground">
                        {v.address ? (
                          <div className="flex items-center gap-1 truncate max-w-[200px]">
                            <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                            <span className="truncate">{v.address}</span>
                          </div>
                        ) : (
                          <span className="italic text-muted-foreground/60 text-[11px]">Sin dirección</span>
                        )}
                        {phone && (
                          <div className="flex items-center gap-1 text-[11px] font-mono">
                            <Phone className="w-3 h-3 text-muted-foreground shrink-0" />
                            <span>{phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-3.5 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {isCurrent ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] font-bold bg-primary/15 text-primary border-primary/30"
                          >
                            Terminal Actual
                          </Badge>
                        ) : !isActive ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] font-bold bg-destructive/15 text-destructive border-destructive/30"
                          >
                            Inactiva
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                          >
                            Activa
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {/* Tables */}
                    <TableCell className="py-3.5 text-center text-xs font-semibold">
                      {stats ? `${stats.tables.occupied} / ${stats.tables.total}` : '—'}
                    </TableCell>

                    {/* Cash Shift */}
                    <TableCell className="py-3.5 text-center">
                      {stats?.openShift ? (
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          Abierta
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">Cerrada</span>
                      )}
                    </TableCell>

                    {/* Active Orders */}
                    <TableCell className="py-3.5 text-center text-xs font-semibold">
                      {stats ? (
                        stats.activeOrders > 0 ? (
                          <span className="text-amber-600 dark:text-amber-400 font-bold">
                            {stats.activeOrders}
                          </span>
                        ) : (
                          '0'
                        )
                      ) : (
                        '—'
                      )}
                    </TableCell>

                    {/* Active Staff */}
                    <TableCell className="py-3.5 text-center text-xs font-semibold">
                      {stats ? stats.activeStaff : '—'}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-3.5 text-right pr-6">
                      <div className="flex items-center justify-end space-x-1.5">
                        {canManage && (
                          <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            onClick={() => openEditModal(v)}
                            className="h-7 px-2 text-xs font-semibold text-foreground/80 hover:text-foreground cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5 mr-1 text-primary" />
                            Editar
                          </Button>
                        )}

                        {isSuperAdmin && !isCurrent && (
                          <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            disabled={!isActive}
                            onClick={() => handleSwitch(v.id)}
                            className="h-7 px-2.5 text-xs font-semibold cursor-pointer"
                          >
                            Cambiar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Unified Create & Edit Venue Modal */}
      <VenueModal
        isOpen={isModalOpen}
        isSaving={isSaving}
        editingVenue={editingVenue}
        error={modalError}
        onClose={closeModal}
        onCreate={createVenue}
        onUpdate={updateVenue}
      />
    </div>
  );
};

export default VenuesTab;
