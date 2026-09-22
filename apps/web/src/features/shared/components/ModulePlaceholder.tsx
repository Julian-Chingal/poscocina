import React from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { MODULE_DETAILS } from '../constants/roadmap.constants';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export interface ModulePlaceholderProps {
  moduleId: string;
  onBack: () => void;
}

export const ModulePlaceholder: React.FC<ModulePlaceholderProps> = ({ moduleId, onBack }) => {
  const details = MODULE_DETAILS[moduleId] || {
    title: 'Módulo en desarrollo',
    subtitle: 'Esta funcionalidad estará disponible en la siguiente fase.',
    phase: 'Próximamente',
    features: [],
  };

  return (
    <div className="max-w-4xl mx-auto p-12 text-center">
      <Button
        variant="ghost"
        onClick={onBack}
        className="inline-flex items-center space-x-2 text-xs font-semibold text-muted-foreground hover:text-foreground mb-8 bg-muted/60 px-4 py-2 rounded-xl border border-border"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a Aplicaciones</span>
      </Button>

      <Card className="bg-card border-border rounded-3xl p-10 shadow-2xl relative overflow-hidden">
        <Badge variant="outline" className="inline-flex items-center space-x-2 text-xs font-bold px-3 py-1 rounded-full bg-primary/15 text-primary border-primary/30 mb-4">
          <Sparkles className="w-3.5 h-3.5 mr-1" />
          <span>Roadmap — {details.phase}</span>
        </Badge>

        <h2 className="text-3xl font-black text-foreground tracking-tight">{details.title}</h2>
        <p className="text-muted-foreground text-sm max-w-xl mx-auto mt-2">{details.subtitle}</p>

        <Separator className="bg-border max-w-lg mx-auto my-8" />

        <div className="max-w-lg mx-auto text-left">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">
            Alcance del Módulo:
          </h4>
          <ul className="space-y-2.5 text-xs text-muted-foreground">
            {details.features.map((feat, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default ModulePlaceholder;
