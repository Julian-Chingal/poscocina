import React from 'react';
import { Store, Briefcase, ArrowRight, Building2 } from 'lucide-react';
import { ContextOption } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AccountContextSelectorProps {
  options: ContextOption[];
  onSelect: (option: ContextOption) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const AccountContextSelector: React.FC<AccountContextSelectorProps> = ({
  options,
  onSelect,
  onCancel,
  isLoading = false,
}) => {
  return (
    <div className="w-full max-w-lg mx-auto p-6 bg-card border border-border/80 rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
      <div className="text-center mb-6">
        <div className="size-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mx-auto mb-3 shadow-xs">
          <Building2 className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-foreground">
          Selecciona tu Lugar de Trabajo
        </h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
          Detectamos que estás registrado en múltiples restaurantes o sedes. ¿En cuál deseas iniciar turno hoy?
        </p>
      </div>

      <div className="space-y-3 mb-6 max-h-[320px] overflow-y-auto pr-1">
        {options.map((opt) => (
          <button
            key={`${opt.companyId}-${opt.venueId}-${opt.userId}`}
            type="button"
            disabled={isLoading}
            onClick={() => onSelect(opt)}
            className="w-full flex items-center justify-between p-4 rounded-2xl border border-border/70 bg-muted/20 hover:bg-muted/50 hover:border-primary/50 transition-all text-left group cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-xs"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="size-11 rounded-xl bg-card border border-border flex items-center justify-center text-primary group-hover:scale-105 transition-transform shrink-0 shadow-2xs">
                {opt.companyLogo ? (
                  <img
                    src={opt.companyLogo}
                    alt={opt.companyName}
                    className="size-8 object-contain rounded-lg"
                  />
                ) : (
                  <Store className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-foreground truncate">
                  {opt.companyName}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground truncate">
                    {opt.venueName}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 h-4 border-border/80 bg-background text-muted-foreground font-normal"
                  >
                    <Briefcase className="w-2.5 h-2.5 mr-1" />
                    {opt.roleLabel}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="size-8 rounded-full bg-card border border-border/80 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary/40 group-hover:bg-primary/10 transition-colors shrink-0 ml-3">
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        ))}
      </div>

      <div className="text-center pt-2 border-t border-border/50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={isLoading}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Volver y digitar otra cédula
        </Button>
      </div>
    </div>
  );
};
