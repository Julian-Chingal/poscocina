import React from "react";
import { Settings, Lock, LogOut, ShieldCheck } from "lucide-react";
import { useAuthStore } from "../../stores/auth.store";
import { usePermissions } from "../../hooks/usePermissions";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "../ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface UserNavProps {
  onNavigateSettings: () => void;
  className?: string;
}

export const UserNav: React.FC<UserNavProps> = ({
  onNavigateSettings,
  className,
}) => {
  // Atomic Zustand selectors
  const currentUser = useAuthStore((s) => s.currentUser);
  const lockScreen = useAuthStore((s) => s.lockScreen);
  const logout = useAuthStore((s) => s.logout);

  const { isManager } = usePermissions();

  if (!currentUser) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => lockScreen()}
        className={cn(
          "h-auto text-xs text-amber-500 hover:text-amber-400 font-medium px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 cursor-pointer transition-colors",
          className,
        )}
      >
        Identificarse
      </Button>
    );
  }

  const initial = currentUser.name.trim().charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      {/* Trigger: User summary button */}
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          title="Menú de Usuario y Configuración (Ctrl+L para bloquear)"
          aria-label="Menú de Usuario y Configuración"
          className={cn(
            "group h-auto flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl transition-all cursor-pointer select-none text-left",
            "border border-transparent hover:border-border hover:bg-muted/70",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            "data-[state=open]:bg-muted/80 data-[state=open]:border-border",
            className,
          )}
        >
          <Avatar size="sm" className="size-6 border border-primary/40">
            <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">
              {initial}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col min-w-0 text-left">
            <span className="font-semibold text-xs text-foreground truncate leading-tight max-w-[85px] sm:max-w-[120px]">
              {currentUser.name}
            </span>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground truncate leading-none mt-0.5">
              {currentUser.roleLabel || currentUser.roleName}
            </span>
          </div>
        </button>
      </DropdownMenuTrigger>

      {/* shadcn DropdownMenuContent with keyboard navigation and collision handling */}
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="w-68 bg-popover text-popover-foreground border border-border rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* User Profile Header */}
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/50 border border-border">
            <Avatar size="default" className="size-9 border border-primary/40 shrink-0">
              <AvatarFallback className="bg-primary/20 text-primary font-bold text-sm">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-xs text-foreground truncate">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-muted-foreground truncate">
                {currentUser.email || "Terminal operativa"}
              </div>
              <div className="mt-1 flex items-center gap-1">
                <Badge
                  variant="outline"
                  className="text-[9px] py-0 px-1.5 border-border text-primary bg-primary/10 gap-1"
                >
                  <ShieldCheck className="size-2.5 shrink-0" strokeWidth={2} />
                  <span className="truncate">{currentUser.roleLabel || currentUser.roleName}</span>
                </Badge>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-1.5 bg-border" />

        <DropdownMenuGroup>
          {/* Settings Option for Managers / Super Admins */}
          {isManager && (
            <DropdownMenuItem
              onSelect={onNavigateSettings}
              className="cursor-pointer gap-2.5 p-2 rounded-lg text-foreground focus:bg-muted focus:text-foreground text-xs"
            >
              <div className="p-1 rounded-md bg-muted text-primary shrink-0">
                <Settings className="size-3.5 shrink-0" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium leading-none truncate">Ajustes del Sistema</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
                  Marca, facturación e impresoras
                </div>
              </div>
            </DropdownMenuItem>
          )}

          {/* Quick Lock / Switch User */}
          <DropdownMenuItem
            onSelect={() => lockScreen()}
            className="cursor-pointer gap-2.5 p-2 rounded-lg text-foreground focus:bg-muted focus:text-foreground text-xs"
          >
            <div className="p-1 rounded-md bg-muted text-primary shrink-0">
              <Lock className="size-3.5 shrink-0" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium leading-none truncate">Bloquear Terminal</div>
              <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
                Cambiar usuario con PIN
              </div>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-muted border border-border rounded text-muted-foreground shrink-0">
              Ctrl+L
            </kbd>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1.5 bg-border" />

        {/* Logout Action */}
        <DropdownMenuItem
          onSelect={() => logout()}
          className="cursor-pointer gap-2.5 p-2 rounded-lg text-destructive focus:bg-destructive/10 focus:text-destructive text-xs"
        >
          <div className="p-1 rounded-md bg-destructive/10 text-destructive shrink-0">
            <LogOut className="size-3.5 shrink-0" strokeWidth={2} />
          </div>
          <span className="font-medium">Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
