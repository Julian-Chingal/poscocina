import React, { useState } from 'react';
import { Store, MapPin, Phone, Layers, Wallet, UtensilsCrossed, Users, Trash2, Star } from 'lucide-react';
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

interface Props {
  venue: VenueItem;
  isCurrent: boolean;
  canManage?: boolean;
  isSuperAdmin?: boolean;
  summary?: VenueSummaryData['stats'];
  onSwitch: (id: string) => void;
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
  onToggleStatus,
  onDelete,
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [confirmName, setConfirmName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const isActive = venue.isActive !== false;

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

  return (
    <>
      <Card
        className={`p-6 transition flex flex-col justify-between space-y-4 ${
          !isActive
            ? 'opacity-70 bg-muted/20 border-dashed border-border'
            : isCurrent
            ? 'border-primary/80 shadow-lg shadow-primary/10'
            : 'border-border hover:border-muted-foreground/30'
        }`}
      >
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow ${
                  isCurrent
                    ? 'bg-primary text-primary-foreground'
                    : !isActive
                    ? 'bg-muted-foreground/20 text-muted-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-foreground text-sm leading-snug">{venue.name}</h4>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {venue.slug ? `/${venue.slug}` : 'sede principal'}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-1.5">
              {venue.isPrimary && (
                <Badge variant="outline" className="text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1">
                  <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                  Principal
                </Badge>
              )}
              {isCurrent ? (
                <Badge variant="outline" className="text-[10px] font-bold bg-primary/15 text-primary border-primary/30">
                  Terminal Actual
                </Badge>
              ) : !isActive ? (
                <Badge variant="outline" className="text-[10px] font-bold bg-destructive/15 text-destructive border-destructive/30">
                  Inactiva
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                  Activa
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-1 text-xs text-muted-foreground">
            {venue.address && (
              <div className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground/80 shrink-0" />
                <span className="truncate">{venue.address}</span>
              </div>
            )}
            {venue.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-muted-foreground/80 shrink-0" />
                <span>{venue.phone}</span>
              </div>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Card className="bg-muted/40 border-border p-2.5">
              <div className="flex items-center space-x-1.5 text-muted-foreground text-[10px]">
                <Layers className="w-3 h-3 text-primary" />
                <span>Mesas</span>
              </div>
              <div className="text-sm font-bold text-foreground mt-1">
                {summary ? `${summary.tables.occupied} / ${summary.tables.total}` : '...'}
              </div>
            </Card>

            <Card className="bg-muted/40 border-border p-2.5">
              <div className="flex items-center space-x-1.5 text-muted-foreground text-[10px]">
                <Wallet className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                <span>Caja</span>
              </div>
              <div className="text-xs font-bold mt-1">
                {summary ? (
                  summary.openShift ? (
                    <span className="text-emerald-600 dark:text-emerald-400">Turno Abierto</span>
                  ) : (
                    <span className="text-muted-foreground">Cerrada</span>
                  )
                ) : (
                  '...'
                )}
              </div>
            </Card>

            <Card className="bg-muted/40 border-border p-2.5">
              <div className="flex items-center space-x-1.5 text-muted-foreground text-[10px]">
                <UtensilsCrossed className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                <span>Comandas</span>
              </div>
              <div className="text-sm font-bold text-foreground mt-1">
                {summary ? `${summary.activeOrders} activas` : '...'}
              </div>
            </Card>

            <Card className="bg-muted/40 border-border p-2.5">
              <div className="flex items-center space-x-1.5 text-muted-foreground text-[10px]">
                <Users className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                <span>Personal</span>
              </div>
              <div className="text-sm font-bold text-foreground mt-1">
                {summary ? `${summary.activeStaff} activos` : '...'}
              </div>
            </Card>
          </div>

          {/* Admin Management Controls: Switch Status & Delete */}
          {canManage && (
            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-[11px] text-muted-foreground">Habilitada:</span>
                <Switch
                  checked={isActive}
                  disabled={isCurrent || isToggling}
                  onCheckedChange={handleToggle}
                  aria-label="Alternar estado de la sede"
                />
              </div>

              {isSuperAdmin && !isCurrent && (
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => {
                    setConfirmName('');
                    setShowDeleteDialog(true);
                  }}
                  className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10 text-xs font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Eliminar
                </Button>
              )}
            </div>
          )}
        </div>

        <CardFooter className="p-0 border-t-0 mt-0">
          {isCurrent ? (
            <div className="w-full py-2 text-center text-xs font-semibold text-primary bg-primary/10 rounded-xl">
              Operando actualmente en este terminal
            </div>
          ) : isSuperAdmin ? (
            <Button
              variant="outline"
              type="button"
              disabled={!isActive}
              onClick={() => onSwitch(venue.id)}
              className="w-full py-2 h-auto text-center text-xs font-semibold text-foreground rounded-xl transition cursor-pointer"
            >
              {!isActive ? 'Sede Desactivada' : 'Cambiar a esta Sede'}
            </Button>
          ) : (
            <div className="w-full py-2 text-center text-xs text-muted-foreground bg-muted/30 rounded-xl border border-dashed border-border/60">
              Sin acceso a esta sede
            </div>
          )}
        </CardFooter>
      </Card>

      {/* Confirmation Dialog for Venue Deletion */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-destructive">
              ¿Eliminar Sede Permanentemente?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground space-y-2">
              <p>
                Esta acción desactivará la sede <span className="font-semibold text-foreground">"{venue.name}"</span>.
                Para proteger la integridad de los datos, la sede no debe tener turnos de caja abiertos ni comandas activas.
              </p>
              <p className="font-medium text-foreground pt-1">
                Escribe <span className="font-mono text-primary font-bold">{venue.name}</span> para confirmar:
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
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold"
            >
              {isDeleting ? 'Eliminando...' : 'Sí, eliminar sede'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

