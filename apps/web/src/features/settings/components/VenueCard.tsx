import React, { useState } from 'react';
import {
  Store,
  MapPin,
  Phone,
  Layers,
  Wallet,
  UtensilsCrossed,
  Users,
  Trash2,
  Star,
  Edit2,
  Check,
  Copy,
  Clock,
  User,
  Radio,
} from 'lucide-react';
import { VenueItem } from '@/stores/branding.store';
import { VenueSummaryData } from '../types/settings.types';
import { Button } from '@/components/ui/button';
import { Card, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/sileo';

interface Props {
  venue: VenueItem;
  isCurrent: boolean;
  canManage?: boolean;
  isSuperAdmin?: boolean;
  summary?: VenueSummaryData['stats'];
  onSwitch: (id: string) => void;
  onEdit?: (venue: VenueItem) => void;
  onToggleStatus?: (id: string, isActive: boolean) => void;
  onDelete?: (id: string) => void;
}

export const VenueCard: React.FC<Props> = ({
  venue,
  isCurrent,
  canManage = false,
  isSuperAdmin = false,
  summary,
  onSwitch,
  onEdit,
  onToggleStatus,
  onDelete,
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [confirmName, setConfirmName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const isActive = venue.isActive !== false;
  const settings = (venue.settings || {}) as Record<string, any>;
  const phone = venue.phone || settings.phone || '';
  const address = venue.address || '';
  const city = settings.city || '';
  const managerName = settings.managerName || '';
  const openingHours = settings.openingHours || '';
  const slug = venue.slug || settings.slug || venue.name.toLowerCase().replace(/\s+/g, '-');

  const copyToClipboard = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`Copiado: ${text}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleToggle = async (checked: boolean) => {
    if (!onToggleStatus) return;
    setIsToggling(true);
    try {
      await onToggleStatus(venue.id, checked);
    } finally {
      setIsToggling(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!onDelete || confirmName.trim() !== venue.name.trim()) return;
    setIsDeleting(true);
    try {
      await onDelete(venue.id);
      setShowDeleteDialog(false);
      setConfirmName('');
    } finally {
      setIsDeleting(false);
    }
  };

  // Table occupancy calculation
  const totalTables = summary?.tables?.total || 0;
  const occupiedTables = summary?.tables?.occupied || 0;
  const occupancyPct = totalTables > 0 ? Math.round((occupiedTables / totalTables) * 100) : 0;
  const hasOpenShift = !!summary?.openShift;

  return (
    <>
      <Card
        className={`relative overflow-hidden transition-all duration-200 flex flex-col justify-between rounded-2xl ${
          !isActive
            ? 'opacity-70 bg-muted/15 border-dashed border-border shadow-none'
            : isCurrent
            ? 'border-primary/60 bg-card shadow-lg shadow-primary/5 ring-1 ring-primary/30'
            : 'border-border/80 bg-card hover:border-border hover:shadow-md'
        }`}
      >
        {/* Top Accent Strip */}
        <div
          className={`h-1.5 w-full ${
            !isActive
              ? 'bg-muted-foreground/30'
              : isCurrent
              ? 'bg-gradient-to-r from-primary via-primary/80 to-amber-500'
              : 'bg-muted-foreground/20'
          }`}
        />

        <div className="p-5 space-y-4">
          {/* Header Bar */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center space-x-3 min-w-0">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shrink-0 shadow-sm transition-colors ${
                  isCurrent
                    ? 'bg-primary text-primary-foreground shadow-primary/25'
                    : !isActive
                    ? 'bg-muted text-muted-foreground'
                    : 'bg-primary/10 text-primary'
                }`}
              >
                <Store className="w-5 h-5" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="font-bold text-foreground text-base leading-tight truncate">
                    {venue.name}
                  </h4>
                  {venue.isPrimary && (
                    <Badge
                      variant="outline"
                      className="text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1 px-1.5 py-0"
                    >
                      <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                      Principal
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                  <span className="font-mono text-[11px] text-muted-foreground/90 bg-muted/60 px-1.5 py-0.5 rounded-md">
                    /{slug}
                  </span>
                  {city && <span className="text-[11px] text-muted-foreground/80">• {city}</span>}
                </div>
              </div>
            </div>

            {/* Status Pills */}
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              {isCurrent ? (
                <Badge
                  variant="outline"
                  className="text-[10px] font-bold bg-primary/15 text-primary border-primary/30 flex items-center gap-1 shadow-sm"
                >
                  <Radio className="w-2.5 h-2.5 animate-pulse text-primary" />
                  Terminal Actual
                </Badge>
              ) : !isActive ? (
                <Badge
                  variant="outline"
                  className="text-[10px] font-bold bg-destructive/15 text-destructive border-destructive/30"
                >
                  Inactiva
                </Badge>
              ) : hasOpenShift ? (
                <Badge
                  variant="outline"
                  className="text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 flex items-center gap-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  En Servicio
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-[10px] font-bold bg-muted text-muted-foreground border-border"
                >
                  Caja Cerrada
                </Badge>
              )}
            </div>
          </div>

          <Separator className="opacity-60" />

          {/* Location and Contact Info */}
          <div className="space-y-1.5 text-xs text-muted-foreground">
            {address ? (
              <div className="flex items-center justify-between group">
                <div className="flex items-center space-x-2 truncate pr-2">
                  <MapPin className="w-3.5 h-3.5 text-primary/80 shrink-0" />
                  <span className="truncate text-foreground/90 font-medium">{address}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(address, 'address')}
                  title="Copiar dirección"
                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100 transition shrink-0 cursor-pointer"
                >
                  {copiedField === 'address' ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-muted-foreground/60 italic">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>Sin dirección registrada</span>
              </div>
            )}

            {phone && (
              <div className="flex items-center justify-between group">
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground/80 shrink-0" />
                  <span className="font-mono text-[11px] text-foreground/80">{phone}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(phone, 'phone')}
                  title="Copiar teléfono"
                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100 transition shrink-0 cursor-pointer"
                >
                  {copiedField === 'phone' ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            )}

            {(managerName || openingHours) && (
              <div className="flex items-center gap-3 pt-1 text-[11px] text-muted-foreground/80 flex-wrap">
                {managerName && (
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3 text-muted-foreground/70" />
                    <span className="truncate">{managerName}</span>
                  </div>
                )}
                {openingHours && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-muted-foreground/70" />
                    <span className="truncate">{openingHours}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Operational Metrics Panel */}
          <div className="pt-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground mb-2">
              <span>Operación en Vivo</span>
              {summary && totalTables > 0 && (
                <span className="text-[10px] font-mono text-muted-foreground/80">
                  {occupancyPct}% ocupación
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Tables */}
              <div className="bg-muted/40 hover:bg-muted/60 transition-colors border border-border/70 rounded-xl p-2.5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-muted-foreground text-[10px]">
                  <div className="flex items-center space-x-1.5">
                    <Layers className="w-3 h-3 text-primary" />
                    <span className="font-medium">Mesas</span>
                  </div>
                  <span className="font-mono text-[9px] text-muted-foreground/80">
                    {summary ? `${summary.tables.free} libres` : ''}
                  </span>
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-sm font-bold text-foreground">
                    {summary ? `${occupiedTables} / ${totalTables}` : '—'}
                  </span>
                  {summary && totalTables > 0 && (
                    <div className="w-12 bg-muted rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          occupancyPct > 80 ? 'bg-destructive' : occupancyPct > 40 ? 'bg-amber-500' : 'bg-primary'
                        }`}
                        style={{ width: `${occupancyPct}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Cash Shift */}
              <div className="bg-muted/40 hover:bg-muted/60 transition-colors border border-border/70 rounded-xl p-2.5 flex flex-col justify-between">
                <div className="flex items-center space-x-1.5 text-muted-foreground text-[10px]">
                  <Wallet className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                  <span className="font-medium">Caja</span>
                </div>
                <div className="mt-1">
                  {summary ? (
                    summary.openShift ? (
                      <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Turno Abierto</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground font-semibold text-xs">Cerrada</span>
                    )
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </div>
              </div>

              {/* Orders in Preparation */}
              <div className="bg-muted/40 hover:bg-muted/60 transition-colors border border-border/70 rounded-xl p-2.5 flex flex-col justify-between">
                <div className="flex items-center space-x-1.5 text-muted-foreground text-[10px]">
                  <UtensilsCrossed className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                  <span className="font-medium">Comandas</span>
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-sm font-bold text-foreground">
                    {summary ? summary.activeOrders : '—'}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {summary && summary.activeOrders > 0 ? 'en cocina' : 'activas'}
                  </span>
                </div>
              </div>

              {/* Staff on Duty */}
              <div className="bg-muted/40 hover:bg-muted/60 transition-colors border border-border/70 rounded-xl p-2.5 flex flex-col justify-between">
                <div className="flex items-center space-x-1.5 text-muted-foreground text-[10px]">
                  <Users className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                  <span className="font-medium">Personal</span>
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-sm font-bold text-foreground">
                    {summary ? summary.activeStaff : '—'}
                  </span>
                  <span className="text-[10px] text-muted-foreground">activos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Management Controls: Switch Status & Edit / Delete */}
          {canManage && (
            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-medium text-muted-foreground">Habilitada:</span>
                <Switch
                  checked={isActive}
                  disabled={isCurrent || isToggling}
                  onCheckedChange={handleToggle}
                  aria-label="Alternar estado de la sede"
                />
              </div>

              <div className="flex items-center space-x-1">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => onEdit(venue)}
                    className="h-7 px-2 text-foreground/80 hover:text-foreground hover:bg-muted text-xs font-semibold cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-1 text-primary" />
                    Editar
                  </Button>
                )}

                {isSuperAdmin && !isCurrent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => {
                      setConfirmName('');
                      setShowDeleteDialog(true);
                    }}
                    className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10 text-xs font-semibold cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Eliminar
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Card Footer: Terminal Switch & Status */}
        <CardFooter className="p-4 pt-0 border-t-0">
          {isCurrent ? (
            <div className="w-full py-2.5 px-3 text-center text-xs font-bold text-primary bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center gap-1.5 shadow-sm">
              <Check className="w-4 h-4 text-primary" />
              <span>Operando actualmente en este terminal</span>
            </div>
          ) : isSuperAdmin ? (
            <Button
              variant="outline"
              type="button"
              disabled={!isActive}
              onClick={() => onSwitch(venue.id)}
              className="w-full py-2.5 h-auto text-center text-xs font-semibold text-foreground hover:text-primary hover:border-primary/50 bg-background hover:bg-primary/5 rounded-xl transition cursor-pointer shadow-sm"
            >
              {!isActive ? 'Sede Desactivada' : 'Cambiar a esta Sede'}
            </Button>
          ) : (
            <div className="w-full py-2.5 text-center text-xs text-muted-foreground bg-muted/30 rounded-xl border border-dashed border-border/60">
              Sin acceso a esta sede
            </div>
          )}
        </CardFooter>
      </Card>

      {/* Confirmation Dialog for Venue Deletion */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              <span>¿Eliminar Sede Permanentemente?</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground space-y-2">
              <p>
                Esta acción desactivará la sede{' '}
                <span className="font-semibold text-foreground">"{venue.name}"</span>.
                Para proteger la integridad histórica de ventas y facturación, la sede no debe tener turnos de caja abiertos ni comandas activas.
              </p>
              <p className="font-medium text-foreground pt-1">
                Escribe <span className="font-mono text-primary font-bold">{venue.name}</span> para confirmar la eliminación:
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="my-2">
            <Input
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={venue.name}
              className="text-xs"
              autoFocus
            />
          </div>

          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel
              disabled={isDeleting}
              onClick={() => {
                setShowDeleteDialog(false);
                setConfirmName('');
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={confirmName.trim() !== venue.name.trim() || isDeleting}
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold cursor-pointer"
            >
              {isDeleting ? 'Eliminando...' : 'Sí, eliminar sede'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default VenueCard;
