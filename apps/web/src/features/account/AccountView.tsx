import React, { useEffect, useState } from 'react';
import {
  User,
  Shield,
  KeyRound,
  Lock,
  Mail,
  Building,
  Store,
  CheckCircle2,
  AlertTriangle,
  Unlink,
  Loader2,
  CreditCard,
  RefreshCw,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GoogleAuthButton } from '@/features/auth/components/GoogleAuthButton';
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';

export const AccountView: React.FC = () => {
  const accountProfile = useAuthStore((s) => s.accountProfile);
  const fetchAccountProfile = useAuthStore((s) => s.fetchAccountProfile);
  const linkGoogleAccount = useAuthStore((s) => s.linkGoogleAccount);
  const unlinkGoogleAccount = useAuthStore((s) => s.unlinkGoogleAccount);
  const currentUser = useAuthStore((s) => s.currentUser);

  const [isLoading, setIsLoading] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [showConfirmUnlink, setShowConfirmUnlink] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetchAccountProfile().finally(() => setIsLoading(false));
  }, [fetchAccountProfile]);

  const handleLinkGoogle = async (idToken: string) => {
    setIsLoading(true);
    const res = await linkGoogleAccount(idToken);
    setIsLoading(false);
    if (res.success) {
      toast.success('Cuenta de Google vinculada exitosamente');
    } else {
      toast.error(res.error || 'No se pudo vincular la cuenta de Google');
    }
  };

  const handleUnlinkGoogle = async () => {
    setIsUnlinking(true);
    const res = await unlinkGoogleAccount();
    setIsUnlinking(false);
    setShowConfirmUnlink(false);
    if (res.success) {
      toast.success('Cuenta de Google desvinculada exitosamente');
    } else {
      toast.error(res.error || 'No se pudo desvincular la cuenta de Google');
    }
  };

  const profile = accountProfile || {
    id: currentUser?.id || '',
    name: currentUser?.name || 'Usuario',
    email: currentUser?.email || null,
    documentNumber: currentUser?.documentNumber || null,
    roleName: currentUser?.roleName || currentUser?.role || 'Personal',
    roleHierarchy: currentUser?.hierarchy || 0,
    companyName: null,
    companyLogo: null,
    venueName: null,
    hasGoogleLinked: false,
    googleEmail: null,
    hasPassword: false,
    hasPin: false,
    allVenuesAccess: false,
  };

  const initial = profile.name.trim().charAt(0).toUpperCase();

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-150">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                Mi Cuenta & Seguridad
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Gestiona tus credenciales, métodos de acceso y vinculación con Google.
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIsLoading(true);
            fetchAccountProfile().finally(() => setIsLoading(false));
          }}
          disabled={isLoading}
          className="self-start sm:self-auto gap-2 text-xs rounded-xl"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', isLoading && 'animate-spin')} />
          <span>Actualizar</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Información de Identidad */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="size-16 border-2 border-primary/30 shadow-xs">
                <AvatarFallback className="bg-primary/15 text-primary text-xl font-bold">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-bold text-foreground truncate">
                  {profile.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-border bg-muted/60 font-semibold text-primary">
                    <Shield className="w-3 h-3 mr-1" />
                    {profile.roleName}
                  </Badge>
                  {profile.allVenuesAccess && (
                    <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                      Multi-Sede
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-3.5 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" /> Correo Principal
                </span>
                <span className="font-medium text-foreground truncate max-w-[200px]">
                  {profile.email || 'No registrado'}
                </span>
              </div>

              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5" /> Documento / Cédula
                </span>
                <span className="font-medium text-foreground">
                  {profile.documentNumber || 'Sin cédula'}
                </span>
              </div>

              {profile.companyName && (
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5" /> Empresa
                  </span>
                  <span className="font-medium text-foreground truncate max-w-[200px]">
                    {profile.companyName}
                  </span>
                </div>
              )}

              {profile.venueName && (
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Store className="w-3.5 h-3.5" /> Sede Asignada
                  </span>
                  <span className="font-medium text-foreground truncate max-w-[200px]">
                    {profile.venueName}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Tarjeta de Métodos de Acceso */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-primary" />
              Métodos de Ingreso al Sistema
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl border border-border bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-foreground">Contraseña de Acceso</div>
                    <div className="text-[11px] text-muted-foreground">
                      Para administradores y gerentes
                    </div>
                  </div>
                </div>
                <Badge
                  variant={profile.hasPassword ? 'default' : 'secondary'}
                  className={cn(
                    'text-[10px] font-semibold',
                    profile.hasPassword
                      ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {profile.hasPassword ? 'Configurada' : 'No configurada'}
                </Badge>
              </div>

              <div className="p-3 rounded-xl border border-border bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <KeyRound className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-foreground">PIN de Terminal</div>
                    <div className="text-[11px] text-muted-foreground">
                      Acceso rápido para cajeros y meseros
                    </div>
                  </div>
                </div>
                <Badge
                  variant={profile.hasPin ? 'default' : 'secondary'}
                  className={cn(
                    'text-[10px] font-semibold',
                    profile.hasPin
                      ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {profile.hasPin ? 'PIN Activo' : 'Sin PIN'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Vinculación con Google */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-2xl bg-muted border border-border flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Vinculación con Google
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Permite iniciar sesión con un clic usando tu cuenta corporativa o personal de Google.
                  </p>
                </div>
              </div>

              <Badge
                variant={profile.hasGoogleLinked ? 'default' : 'outline'}
                className={cn(
                  'text-xs font-semibold px-2.5 py-1 shrink-0',
                  profile.hasGoogleLinked
                    ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                    : 'bg-muted text-muted-foreground border-border'
                )}
              >
                {profile.hasGoogleLinked ? (
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Vinculada
                  </span>
                ) : (
                  <span>No vinculada</span>
                )}
              </Badge>
            </div>

            <div className="border-t border-border pt-4">
              {profile.hasGoogleLinked ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-emerald-500">
                        Cuenta de Google Conectada
                      </span>
                      <span className="text-[11px] text-muted-foreground">OAuth 2.0</span>
                    </div>
                    <div className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Mail className="w-4 h-4 text-emerald-500" />
                      <span>{profile.googleEmail || profile.email}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Puedes iniciar sesión en la pantalla de bloqueo o terminal con el botón oficial de Google.
                    </p>
                  </div>

                  {!showConfirmUnlink ? (
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowConfirmUnlink(true)}
                        className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30 rounded-xl gap-2 cursor-pointer"
                      >
                        <Unlink className="w-3.5 h-3.5" />
                        <span>Desvincular cuenta de Google</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 space-y-3 animate-in fade-in">
                      <div className="flex items-start gap-2.5 text-rose-300 text-xs">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-foreground">¿Confirmas desvincular Google?</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Ya no podrás acceder directamente con Google. Asegúrate de tener tu contraseña o PIN disponible.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowConfirmUnlink(false)}
                          disabled={isUnlinking}
                          className="text-xs rounded-xl"
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={handleUnlinkGoogle}
                          disabled={isUnlinking}
                          className="text-xs font-bold rounded-xl gap-2 cursor-pointer"
                        >
                          {isUnlinking ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Desvinculando...</span>
                            </>
                          ) : (
                            <span>Sí, Desvincular</span>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Vincula tu cuenta de Google para simplificar el inicio de sesión sin necesidad de recordar contraseñas complejas.
                  </p>

                  <div className="max-w-md pt-1">
                    <GoogleAuthButton
                      mode="link"
                      onSuccess={handleLinkGoogle}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 text-muted-foreground text-[11px] space-y-1">
                    <p className="font-semibold text-foreground">Nota sobre seguridad:</p>
                    <p>
                      La vinculación asocia el identificador único seguro de tu cuenta de Google a tu usuario en PosCocina. En ningún momento accedemos a tus contraseñas ni correos personales.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountView;
