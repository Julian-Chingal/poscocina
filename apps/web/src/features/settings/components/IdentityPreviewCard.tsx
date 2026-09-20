import React from 'react';
import { UtensilsCrossed } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Props {
  companyName: string;
  logoUrl: string;
  primaryColor: string;
  venueAddress: string;
  phone: string;
}

export const IdentityPreviewCard: React.FC<Props> = ({
  companyName,
  logoUrl,
  primaryColor,
  venueAddress,
  phone,
}) => (
  <Card className="text-center shadow-sm">
    <CardHeader className="pb-3 border-b border-border">
      <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Previsualización de Encabezado
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-6 space-y-4">
      <div
        className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white shadow-xl overflow-hidden"
        style={{ backgroundColor: primaryColor }}
      >
        {logoUrl ? (
          <img src={logoUrl} alt="Logo" className="w-12 h-12 object-contain" />
        ) : (
          <UtensilsCrossed className="w-8 h-8" />
        )}
      </div>
      <div>
        <h4 className="font-bold text-foreground text-lg">{companyName || 'Nombre Empresa'}</h4>
        <p className="text-xs text-muted-foreground mt-1">{venueAddress}</p>
        <p className="text-xs text-muted-foreground">{phone}</p>
      </div>
      <div className="pt-2">
        <Badge variant="outline" className="inline-block px-3 py-1 text-xs font-semibold text-emerald-500 bg-emerald-500/10 border-emerald-500/20">
          Estilo Visual Activo
        </Badge>
      </div>
    </CardContent>
  </Card>
);
