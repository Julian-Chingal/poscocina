import React from 'react';
import { UserInfo } from '@/stores/auth.store';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowRight, UserCheck } from 'lucide-react';
import { PIN_RESTRICTED_HIERARCHY } from '@poscocina/shared';

interface UserAvatarSelectorProps {
  users: UserInfo[];
  selectedUser: UserInfo | null;
  venueName?: string;
  onSelectUser: (user: UserInfo) => void;
  onSwitchToPasswordLogin?: () => void;
}

export const UserAvatarSelector: React.FC<UserAvatarSelectorProps> = ({
  users,
  selectedUser,
  venueName,
  onSelectUser,
  onSwitchToPasswordLogin,
}) => {
  // Excluir administradores y gerentes de la lista de selección de PIN rápido (RBAC)
  const operativeUsers = users.filter((u) => {
    const isRestrictedByRole =
      u.roleName === 'manager' ||
      u.roleName === 'super_admin' ||
      u.role === 'manager' ||
      u.role === 'super_admin';
    const isRestrictedByHierarchy =
      u.hierarchy !== undefined && u.hierarchy >= PIN_RESTRICTED_HIERARCHY && u.hierarchy > 10;
    return !isRestrictedByRole && !isRestrictedByHierarchy;
  });

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs font-semibold text-muted-foreground block truncate max-w-[210px]" title={venueName ? `Operadores en ${venueName}` : undefined}>
            {venueName ? `Operadores en ${venueName}:` : 'Selecciona tu usuario operativo:'}
          </Label>
          <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">
            {operativeUsers.length} disponibles
          </span>
        </div>

        {operativeUsers.length === 0 ? (
          <div className="p-4 rounded-2xl bg-muted/40 border border-border text-center space-y-2 my-2">
            <UserCheck className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
            <p className="text-xs text-muted-foreground font-medium">
              No hay usuarios operativos registrados para acceso con PIN {venueName ? `en ${venueName}` : 'en esta sede'}.
            </p>
          </div>
        ) : (
          <div className="max-h-[260px] overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-2 scrollbar-thin">
            {operativeUsers.map((u) => {
              const isSelected = selectedUser?.id === u.id;
              return (
                <Button
                  key={u.id}
                  variant="ghost"
                  type="button"
                  onClick={() => onSelectUser(u)}
                  className={`h-auto w-full flex items-center justify-start gap-2.5 p-2.5 rounded-xl border transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'bg-primary/15 border-primary text-foreground shadow-xs ring-1 ring-primary/40'
                      : 'bg-card hover:bg-muted/60 border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 uppercase transition-colors ${
                      isSelected
                        ? 'bg-primary text-primary-foreground font-black shadow-xs'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {u.name.slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold leading-tight truncate text-foreground">
                      {u.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate leading-none mt-1">
                      {u.roleLabel || u.roleName}
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {/* Enlace alternativo para roles administrativos */}
      {onSwitchToPasswordLogin && (
        <div className="mt-4 pt-3 border-t border-border/60">
          <button
            type="button"
            onClick={onSwitchToPasswordLogin}
            className="w-full text-left group p-2.5 rounded-xl bg-muted/30 hover:bg-muted/60 border border-border/50 transition cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="text-[11px] leading-tight text-muted-foreground group-hover:text-foreground transition-colors">
                <span className="font-semibold text-foreground">¿Eres Administrador o Gerente?</span>
                <span className="block text-[10px] text-muted-foreground">Inicia sesión con correo y contraseña</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-0.5 shrink-0" />
          </button>
        </div>
      )}
    </div>
  );
};

