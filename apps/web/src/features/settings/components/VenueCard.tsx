import React from 'react';
import { Store, MapPin, Phone, Layers, Wallet, UtensilsCrossed, Users } from 'lucide-react';
import { VenueItem } from '@/stores/branding.store';
import { VenueSummaryData } from '../types/settings.types';
import { Button } from '@/components/ui/button';
import { Card, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Props {
  venue: VenueItem;
  isCurrent: boolean;
  summary?: VenueSummaryData['stats'];
  onSwitch: (id: string) => void;
}

export const VenueCard: React.FC<Props> = ({ venue, isCurrent, summary, onSwitch }) => (
  <Card
    className={`p-6 transition flex flex-col justify-between space-y-4 ${
      isCurrent
        ? 'border-orange-500/80 shadow-lg shadow-orange-500/10'
        : 'border-slate-700/60 hover:border-slate-600'
    }`}
  >
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow ${
              isCurrent ? 'bg-orange-600' : 'bg-slate-700'
            }`}
          >
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm leading-snug">{venue.name}</h4>
            <span className="text-[11px] text-slate-400 font-mono">/{venue.slug}</span>
          </div>
        </div>
        {isCurrent && (
          <Badge variant="outline" className="text-[10px] font-bold bg-orange-500/20 text-orange-400 border-orange-500/30">
            Sede Activa
          </Badge>
        )}
      </div>

      <Separator className="bg-slate-700/60" />

      <div className="space-y-1 text-xs text-slate-400">
        {venue.address && (
          <div className="flex items-center space-x-2">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">{venue.address}</span>
          </div>
        )}
        {venue.phone && (
          <div className="flex items-center space-x-2">
            <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>{venue.phone}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2">
        <Card className="bg-slate-900/60 border-slate-800 p-2.5">
          <div className="flex items-center space-x-1.5 text-slate-400 text-[10px]">
            <Layers className="w-3 h-3 text-orange-400" />
            <span>Mesas</span>
          </div>
          <div className="text-sm font-bold text-white mt-1">
            {summary ? `${summary.tables.occupied} / ${summary.tables.total}` : '...'}
          </div>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800 p-2.5">
          <div className="flex items-center space-x-1.5 text-slate-400 text-[10px]">
            <Wallet className="w-3 h-3 text-emerald-400" />
            <span>Caja</span>
          </div>
          <div className="text-xs font-bold mt-1">
            {summary ? (
              summary.openShift ? (
                <span className="text-emerald-400">Turno Abierto</span>
              ) : (
                <span className="text-slate-500">Cerrada</span>
              )
            ) : (
              '...'
            )}
          </div>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800 p-2.5">
          <div className="flex items-center space-x-1.5 text-slate-400 text-[10px]">
            <UtensilsCrossed className="w-3 h-3 text-amber-400" />
            <span>Comandas</span>
          </div>
          <div className="text-sm font-bold text-white mt-1">
            {summary ? `${summary.activeOrders} activas` : '...'}
          </div>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800 p-2.5">
          <div className="flex items-center space-x-1.5 text-slate-400 text-[10px]">
            <Users className="w-3 h-3 text-blue-400" />
            <span>Personal</span>
          </div>
          <div className="text-sm font-bold text-white mt-1">
            {summary ? `${summary.activeStaff} activos` : '...'}
          </div>
        </Card>
      </div>
    </div>

    <CardFooter className="p-0 border-t-0 mt-0">
      {isCurrent ? (
        <div className="w-full py-2 text-center text-xs font-semibold text-orange-400 bg-orange-500/10 rounded-xl">
          Operando actualmente en este terminal
        </div>
      ) : (
        <Button
          variant="ghost"
          type="button"
          onClick={() => onSwitch(venue.id)}
          className="w-full py-2 h-auto text-center text-xs font-semibold text-slate-300 hover:text-white bg-slate-700/60 hover:bg-slate-700 rounded-xl transition cursor-pointer"
        >
          Cambiar a esta Sede
        </Button>
      )}
    </CardFooter>
  </Card>
);
