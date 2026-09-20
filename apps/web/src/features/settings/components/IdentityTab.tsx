import React, { ChangeEvent, useRef } from 'react';
import { Building2, Image as ImageIcon, UtensilsCrossed, X } from 'lucide-react';
import { IdentityPreviewCard } from './IdentityPreviewCard';
import { ColorPickerSection } from './ColorPickerSection';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  companyName: string;
  logoUrl: string;
  primaryColor: string;
  venueAddress: string;
  phone: string;
  onFieldChange: (field: any, val: any) => void;
}

export const IdentityTab: React.FC<Props> = ({
  companyName,
  logoUrl,
  primaryColor,
  venueAddress,
  phone,
  onFieldChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onFieldChange('logoUrl', reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Card className="bg-card border-border p-6 shadow-sm">
          <div className="flex items-center space-x-2.5 pb-4 border-b border-border mb-5">
            <Building2 className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground text-base">Identidad Corporativa</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="block text-xs font-semibold text-foreground">
                Nombre Comercial del Restaurante / Empresa
              </Label>
              <Input
                type="text"
                value={companyName}
                onChange={(e) => onFieldChange('companyName', e.target.value)}
                placeholder="Ej. La Brasa Roja Gourmet"
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="block text-xs font-semibold text-foreground">
                Logo del Sistema y Tickets
              </Label>
              <div className="flex items-center space-x-4">
                {logoUrl ? (
                  <div className="w-16 h-16 rounded-xl border border-border bg-muted/40 p-1 flex items-center justify-center relative group">
                    <img src={logoUrl} alt="Logo" className="max-h-full max-w-full object-contain rounded" />
                    <Button
                      variant="destructive"
                      size="icon"
                      type="button"
                      onClick={() => onFieldChange('logoUrl', '')}
                      className="absolute -top-2 -right-2 rounded-full w-5 h-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <UtensilsCrossed className="w-8 h-8" />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <Input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => onFieldChange('logoUrl', e.target.value)}
                    placeholder="Pegar URL de imagen (https://...)"
                    className="h-8 text-xs"
                  />
                  <div>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-8 text-xs cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5 mr-1.5" />
                      <span>Subir desde dispositivo</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <ColorPickerSection
              primaryColor={primaryColor}
              onColorChange={(color) => onFieldChange('primaryColor', color)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <Label className="block text-xs font-semibold text-slate-300">Dirección de la Sede</Label>
                <Input
                  type="text"
                  value={venueAddress}
                  onChange={(e) => onFieldChange('venueAddress', e.target.value)}
                  className="h-10 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="block text-xs font-semibold text-slate-300">Teléfono de Contacto</Label>
                <Input
                  type="text"
                  value={phone}
                  onChange={(e) => onFieldChange('phone', e.target.value)}
                  className="h-10 text-sm"
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
      <IdentityPreviewCard
        companyName={companyName}
        logoUrl={logoUrl}
        primaryColor={primaryColor}
        venueAddress={venueAddress}
        phone={phone}
      />
    </div>
  );
};
