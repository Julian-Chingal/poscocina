import React from 'react';
import { Shield, KeyRound, Edit2, XCircle, CheckCircle } from 'lucide-react';
import { UserItem } from '../types/users.types';
import { Button } from '@/components/ui/button';
import { Card, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UserCardProps {
  user: UserItem;
  isSelf: boolean;
  onEdit: (user: UserItem) => void;
  onResetPin: (user: UserItem) => void;
  onToggleActive: (user: UserItem) => void;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  isSelf,
  onEdit,
  onResetPin,
  onToggleActive,
}) => {
  const isManager = user.roleHierarchy >= 80;

  return (
    <Card
      className={`w-full min-w-0 h-full rounded-3xl p-5 shadow-sm transition flex flex-col justify-between ${
        user.isActive ? 'border-border hover:border-primary/50' : 'border-border/40 opacity-60 bg-muted/20'
      }`}
    >
      <div className="w-full min-w-0">
        {/* Header with Avatar & Role */}
        <div className="flex items-start justify-between gap-3 mb-4 min-w-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black uppercase shrink-0 ${
                isManager
                  ? 'bg-primary/20 border border-primary/40 text-primary'
                  : 'bg-muted border border-border text-foreground'
              }`}
            >
              {user.name.slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5 truncate">
                <span className="truncate">{user.name}</span>
                {isSelf && (
                  <Badge variant="outline" className="text-[10px] bg-primary/15 text-primary border-primary/30 font-normal shrink-0">
                    Tú
                  </Badge>
                )}
              </h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                <Shield className="w-3 h-3 text-primary shrink-0" />
                <span className="truncate">{user.roleLabel}</span>
              </p>
            </div>
          </div>

          <Badge
            variant="outline"
            className={`text-[10px] font-bold uppercase tracking-wider ${
              user.isActive
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                : 'bg-destructive/15 text-destructive border-destructive/30'
            }`}
          >
            {user.isActive ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>

        {/* Details */}
        <Card className="bg-muted/40 p-3 border-border space-y-1.5 text-xs text-muted-foreground mb-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground/80">Email:</span>
            <span className="font-mono text-foreground truncate max-w-[180px]">
              {user.email || '— Sin correo (Solo PIN) —'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground/80">Acceso PIN:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <KeyRound className="w-3 h-3" />
              <span>Habilitado (••••)</span>
            </span>
          </div>
        </Card>
      </div>

      {/* Actions Footer */}
      <CardFooter className="p-0 pt-3 border-t border-border flex items-center justify-between text-xs mt-0">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(user)}
            title="Editar empleado"
            className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground transition cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onResetPin(user)}
            title="Restablecer PIN"
            className="h-8 w-8 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5" />
          </Button>
        </div>

        {!isSelf && (
          <Button
            variant="ghost"
            onClick={() => onToggleActive(user)}
            className={`px-3 py-1.5 h-auto rounded-xl font-semibold transition cursor-pointer flex items-center gap-1 text-[11px] ${
              user.isActive
                ? 'bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20'
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
            }`}
          >
            {user.isActive ? (
              <>
                <XCircle className="w-3.5 h-3.5" />
                <span>Desactivar</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Reactivar</span>
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
