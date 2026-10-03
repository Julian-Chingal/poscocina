import React from 'react';
import { Smartphone, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ScanPoseIllustrationProps {
  step: number; // 0 = Frontal, 1 = 45°, 2 = Cenital, 3 = Medidas
  className?: string;
  showDetails?: boolean;
}

export const ScanPoseIllustration: React.FC<ScanPoseIllustrationProps> = ({
  step,
  className = '',
  showDetails = true,
}) => {
  return (
    <div
      className={`relative w-full rounded-2xl bg-gradient-to-b from-muted/50 to-muted/20 border border-border/80 overflow-hidden flex flex-col items-center justify-between p-3 select-none ${className}`}
    >
      {/* Step Badge & Title */}
      <div className="w-full flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <Smartphone className="size-4 text-primary shrink-0" />
          <span className="text-[11px] font-black text-foreground tracking-tight">
            {step === 0 && 'Postura 1: Vista Frontal (0°)'}
            {step === 1 && 'Postura 2: Inclinación Media (45°)'}
            {step === 2 && 'Postura 3: Vista Cenital (90°)'}
            {step === 3 && 'Guía de Medidas (Escala Real)'}
          </span>
        </div>
        <Badge
          variant="outline"
          className="text-[10px] font-extrabold px-2 py-0.5 bg-primary/10 text-primary border-primary/30"
        >
          {step === 0 && '0° Mesa'}
          {step === 1 && '45° Diagonal'}
          {step === 2 && '90° Cenital'}
          {step === 3 && 'Medidas'}
        </Badge>
      </div>

      {/* Dynamic SVG Illustration Area */}
      <div className="w-full h-36 sm:h-44 relative flex items-center justify-center">
        {step === 0 && (
          /* STEP 0: FRONTAL / LEVEL VIEW */
          <svg viewBox="0 0 340 160" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="tableGrad0" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="beamGrad0" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Table Surface */}
            <rect x="20" y="125" width="300" height="24" rx="4" fill="url(#tableGrad0)" className="text-foreground" />
            <line x1="20" y1="125" x2="320" y2="125" stroke="currentColor" strokeWidth="2" className="text-border" />

            {/* Plate on Table (Profile View) */}
            <g transform="translate(200, 125)">
              {/* Plate Foot */}
              <ellipse cx="0" cy="0" rx="35" ry="3" fill="#94a3b8" />
              {/* Plate Rim */}
              <ellipse cx="0" cy="-4" rx="55" ry="8" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" />
              <ellipse cx="0" cy="-6" rx="42" ry="5" fill="#f8fafc" />
              {/* Food mound */}
              <path d="M -30 -6 C -25 -28, 25 -28, 30 -6 Z" fill="#f97316" fillOpacity="0.85" />
              <path d="M -15 -14 C -10 -22, 10 -22, 15 -14 Z" fill="#ea580c" />
              {/* Garnish */}
              <circle cx="0" cy="-22" r="3.5" fill="#22c55e" />
              {/* Steam waves */}
              <path d="M -8 -30 Q -6 -38 -8 -44" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 3" opacity="0.6" />
              <path d="M 8 -30 Q 10 -38 8 -44" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 3" opacity="0.6" />
            </g>

            {/* Smartphone (Standing Upright at Eye/Table Level) */}
            <g transform="translate(60, 60)">
              {/* Outer phone body */}
              <rect x="0" y="0" width="38" height="65" rx="7" fill="#1e293b" stroke="#334155" strokeWidth="2" />
              {/* Screen */}
              <rect x="3" y="4" width="32" height="57" rx="4" fill="#0f172a" />
              {/* Viewfinder rectangle on screen */}
              <rect x="6" y="10" width="26" height="45" rx="2" fill="#f97316" fillOpacity="0.15" stroke="#f97316" strokeWidth="1" strokeDasharray="2 2" />
              {/* Camera Lens */}
              <circle cx="19" cy="7" r="2.5" fill="#38bdf8" />
              <circle cx="19" cy="7" r="1" fill="#ffffff" />
            </g>

            {/* Parallel Sight Laser Beam */}
            <path d="M 98 92 L 170 92 L 180 110 L 98 110 Z" fill="url(#beamGrad0)" />
            <line x1="98" y1="102" x2="165" y2="102" stroke="#f97316" strokeWidth="2" strokeDasharray="4 3" />
            <polygon points="163,98 171,102 163,106" fill="#f97316" />

            {/* Badges / Callouts */}
            <rect x="105" y="76" width="60" height="18" rx="9" fill="#f97316" />
            <text x="135" y="89" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#ffffff">
              0° Nivel
            </text>
            <text x="135" y="118" textAnchor="middle" fontSize="9" fontWeight="bold" fill="currentColor" className="text-muted-foreground">
              Móvil paralelo
            </text>
          </svg>
        )}

        {step === 1 && (
          /* STEP 1: 45 DEGREE INCLINED VIEW */
          <svg viewBox="0 0 340 160" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="tableGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="beamGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0.08" />
              </linearGradient>
            </defs>

            {/* Table Surface */}
            <rect x="20" y="125" width="300" height="24" rx="4" fill="url(#tableGrad1)" className="text-foreground" />
            <line x1="20" y1="125" x2="320" y2="125" stroke="currentColor" strokeWidth="2" className="text-border" />

            {/* Plate on Table (Slight Perspective) */}
            <g transform="translate(210, 122)">
              <ellipse cx="0" cy="0" rx="55" ry="12" fill="#94a3b8" />
              <ellipse cx="0" cy="-4" rx="54" ry="11" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" />
              <ellipse cx="0" cy="-6" rx="42" ry="8" fill="#f8fafc" />
              {/* Food inside */}
              <ellipse cx="0" cy="-7" rx="30" ry="6" fill="#f97316" fillOpacity="0.85" />
              <circle cx="0" cy="-9" r="4" fill="#22c55e" />
            </g>

            {/* Smartphone Tilted at 45 Degrees */}
            <g transform="translate(75, 45) rotate(42)">
              <rect x="-18" y="-32" width="36" height="64" rx="7" fill="#1e293b" stroke="#334155" strokeWidth="2" />
              <rect x="-15" y="-28" width="30" height="56" rx="4" fill="#0f172a" />
              <rect x="-12" y="-22" width="24" height="44" rx="2" fill="#f97316" fillOpacity="0.15" stroke="#f97316" strokeWidth="1" strokeDasharray="2 2" />
              <circle cx="0" cy="-25" r="2.5" fill="#38bdf8" />
            </g>

            {/* 45 Degree Vision Cone */}
            <polygon points="95,50 240,110 180,125" fill="url(#beamGrad1)" />
            <line x1="95" y1="52" x2="205" y2="114" stroke="#f97316" strokeWidth="2" strokeDasharray="4 3" />
            <polygon points="202,108 210,116 200,118" fill="#f97316" />

            {/* 45° Angle Arc & Badge */}
            <path d="M 130 125 A 40 40 0 0 0 108 85" stroke="#f97316" strokeWidth="1.5" strokeDasharray="3 2" />
            <rect x="95" y="70" width="48" height="18" rx="9" fill="#f97316" />
            <text x="119" y="83" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#ffffff">
              45°
            </text>
            <text x="119" y="105" textAnchor="middle" fontSize="9" fontWeight="bold" fill="currentColor" className="text-muted-foreground">
              Inclinado
            </text>
          </svg>
        )}

        {step === 2 && (
          /* STEP 2: 90 DEGREE TOP-DOWN (CENITAL) VIEW */
          <svg viewBox="0 0 340 160" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="beamGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.08" />
              </linearGradient>
            </defs>

            {/* Table or Placemat */}
            <rect x="60" y="105" width="220" height="45" rx="8" fill="currentColor" fillOpacity="0.05" className="text-foreground" />

            {/* Circular Plate Viewed from Above */}
            <g transform="translate(170, 122)">
              <ellipse cx="0" cy="0" rx="55" ry="18" fill="#94a3b8" />
              <ellipse cx="0" cy="-3" rx="54" ry="17" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" />
              <ellipse cx="0" cy="-5" rx="40" ry="12" fill="#f8fafc" />
              {/* Food top-down garnish */}
              <ellipse cx="0" cy="-6" rx="26" ry="8" fill="#f97316" fillOpacity="0.85" />
              <circle cx="0" cy="-6" r="4" fill="#22c55e" />
              {/* Circular Target Ring */}
              <ellipse cx="0" cy="-5" rx="46" ry="14" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" />
            </g>

            {/* Smartphone Held Completely Flat / Horizontal Above */}
            <g transform="translate(138, 22)">
              <rect x="0" y="0" width="64" height="34" rx="7" fill="#1e293b" stroke="#334155" strokeWidth="2" />
              <rect x="4" y="3" width="56" height="28" rx="4" fill="#0f172a" />
              <rect x="8" y="6" width="48" height="22" rx="2" fill="#10b981" fillOpacity="0.15" stroke="#10b981" strokeWidth="1" strokeDasharray="2 2" />
              {/* Center Camera sensor icon */}
              <circle cx="32" cy="17" r="3" fill="#10b981" />
              <circle cx="32" cy="17" r="1" fill="#ffffff" />
            </g>

            {/* Downward Vertical Vision Projection Cone */}
            <polygon points="142,56 198,56 215,115 125,115" fill="url(#beamGrad2)" />
            <line x1="170" y1="56" x2="170" y2="108" stroke="#10b981" strokeWidth="2" strokeDasharray="4 3" />
            <polygon points="166,108 170,116 174,108" fill="#10b981" />

            {/* Badge 90° Cenital */}
            <rect x="68" y="28" width="54" height="18" rx="9" fill="#10b981" />
            <text x="95" y="41" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#ffffff">
              90° Cenital
            </text>
            <text x="95" y="58" textAnchor="middle" fontSize="9" fontWeight="bold" fill="currentColor" className="text-muted-foreground">
              Totalmente plano
            </text>
          </svg>
        )}

        {step === 3 && (
          /* STEP 3: PHYSICAL DIMENSIONS ILLUSTRATION */
          <svg viewBox="0 0 340 160" className="w-full h-full" fill="none">
            {/* Table Line */}
            <line x1="30" y1="130" x2="310" y2="130" stroke="currentColor" strokeWidth="2" className="text-border" />

            {/* Isometric / 3D Plate */}
            <g transform="translate(170, 115)">
              <ellipse cx="0" cy="0" rx="65" ry="18" fill="#94a3b8" />
              <ellipse cx="0" cy="-5" rx="64" ry="17" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" />
              <ellipse cx="0" cy="-9" rx="50" ry="13" fill="#f8fafc" />
              <ellipse cx="0" cy="-11" rx="34" ry="9" fill="#f97316" fillOpacity="0.85" />
              <circle cx="0" cy="-11" r="4.5" fill="#22c55e" />
            </g>

            {/* Horizontal Diameter Dimension Arrow */}
            <line x1="105" y1="65" x2="235" y2="65" stroke="#f97316" strokeWidth="2" />
            <polygon points="108,62 100,65 108,68" fill="#f97316" />
            <polygon points="232,62 240,65 232,68" fill="#f97316" />
            <line x1="105" y1="60" x2="105" y2="108" stroke="#f97316" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
            <line x1="235" y1="60" x2="235" y2="108" stroke="#f97316" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
            <rect x="142" y="55" width="56" height="20" rx="6" fill="#f97316" />
            <text x="170" y="69" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#ffffff">
              Diámetro ⌀
            </text>

            {/* Vertical Height Dimension Arrow */}
            <line x1="260" y1="104" x2="260" y2="130" stroke="#3b82f6" strokeWidth="2" />
            <polygon points="257,107 260,100 263,107" fill="#3b82f6" />
            <polygon points="257,127 260,134 263,127" fill="#3b82f6" />
            <line x1="235" y1="104" x2="265" y2="104" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
            <line x1="235" y1="130" x2="265" y2="130" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
            <rect x="270" y="108" width="46" height="18" rx="6" fill="#3b82f6" />
            <text x="293" y="121" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#ffffff">
              Altura ↕
            </text>
          </svg>
        )}
      </div>

      {/* Educational Guidance Footer */}
      {showDetails && (
        <div className="w-full mt-2 pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5 font-medium">
            <Check className="size-3.5 text-primary shrink-0" />
            <span>
              {step === 0 && 'Coloca el teléfono vertical sobre la mesa o a la altura del plato.'}
              {step === 1 && 'Sube el móvil y reclínalo 45° apuntando hacia el centro del plato.'}
              {step === 2 && 'Sostén el móvil en posición horizontal directamente encima del plato.'}
              {step === 3 && 'Ingresa el diámetro y altura del plato para la visualización 3D y AR.'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
