import React, { useState, useRef, useEffect } from 'react';
import { Settings, Lock, LogOut, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { usePermissions } from '../../hooks/usePermissions';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface UserNavProps {
  onNavigateSettings: () => void;
  className?: string;
}

export const UserNav: React.FC<UserNavProps> = ({
  onNavigateSettings,
  className,
}) => {
  const { currentUser, lockScreen, logout } = useAuthStore();
  const { isManager } = usePermissions();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => lockScreen()}
        className="h-auto text-xs text-amber-400 hover:text-amber-300 font-medium px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 cursor-pointer transition-colors"
      >
        Identificarse
      </Button>
    );
  }

  const initial = currentUser.name.trim().charAt(0).toUpperCase();

  return (
    <div className={cn('relative', className)} ref={menuRef}>
      {/* Trigger: User summary card */}
      <Button
        variant="ghost"
        onClick={() => setIsOpen((prev) => !prev)}
        title="Menú de Usuario y Configuración (Ctrl+L para bloquear)"
        className={cn(
          'h-auto flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl transition cursor-pointer select-none text-left',
          'border border-transparent hover:border-border hover:bg-muted/70',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
          isOpen && 'bg-muted/80 border-border'
        )}
      >
        <Avatar size="sm" className="size-6 border border-primary/40">
          <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">
            {initial}
          </AvatarFallback>
        </Avatar>

        <div className="hidden sm:flex flex-col min-w-0">
          <span className="font-semibold text-xs text-foreground truncate leading-tight max-w-[120px]">
            {currentUser.name}
          </span>
          <span className="text-[10px] text-muted-foreground truncate leading-none mt-0.5">
            {currentUser.roleLabel || currentUser.roleName}
          </span>
        </div>
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-popover text-popover-foreground border border-border rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* User Profile Header */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/50 border border-border mb-1">
            <Avatar size="default" className="size-9 border border-primary/40">
              <AvatarFallback className="bg-primary/20 text-primary font-bold text-sm">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-xs text-foreground truncate">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-muted-foreground truncate">
                {currentUser.email || 'Terminal operativa'}
              </div>
              <div className="mt-1 flex items-center gap-1">
                <Badge variant="outline" className="text-[9px] py-0 px-1.5 border-border text-primary bg-primary/10">
                  <ShieldCheck className="size-2.5" />
                  <span>{currentUser.roleLabel || currentUser.roleName}</span>
                </Badge>
              </div>
            </div>
          </div>

          <Separator className="my-1 bg-border" />

          {/* Relocated Settings Option for Managers / Super Admins */}
          {isManager && (
            <Button
              variant="ghost"
              onClick={() => {
                setIsOpen(false);
                onNavigateSettings();
              }}
              className="w-full h-auto px-2.5 py-2 text-left text-xs flex items-center justify-start gap-2.5 rounded-lg text-foreground hover:bg-muted hover:text-foreground transition cursor-pointer select-none"
            >
              <div className="p-1 rounded-md bg-muted text-primary">
                <Settings className="size-3.5" />
              </div>
              <div className="flex-1">
                <div className="font-medium leading-none">Ajustes del Sistema</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Marca, facturación, impuestos e impresoras
                </div>
              </div>
            </Button>
          )}

          {/* Quick Lock / PIN change */}
          <Button
            variant="ghost"
            onClick={() => {
              setIsOpen(false);
              lockScreen();
            }}
            className="w-full h-auto px-2.5 py-2 text-left text-xs flex items-center justify-between rounded-lg text-foreground hover:bg-muted hover:text-foreground transition cursor-pointer select-none"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1 rounded-md bg-muted text-primary">
                <Lock className="size-3.5" />
              </div>
              <div>
                <div className="font-medium leading-none">Bloquear Terminal</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Cambiar usuario con PIN
                </div>
              </div>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-muted border border-border rounded text-muted-foreground">
              Ctrl+L
            </kbd>
          </Button>

          <Separator className="my-1 bg-border" />

          {/* Logout Action */}
          <Button
            variant="ghost"
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            className="w-full h-auto px-2.5 py-1.5 text-left text-xs flex items-center justify-start gap-2.5 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive transition cursor-pointer select-none"
          >
            <LogOut className="size-3.5 ml-1" />
            <span className="font-medium">Cerrar Sesión</span>
          </Button>
        </div>
      )}
    </div>
  );
};
