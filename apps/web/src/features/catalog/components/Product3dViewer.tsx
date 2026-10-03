import React, { useState, useEffect, useRef } from 'react';
import {
  Rotate3d,
  Ruler,
  Maximize2,
  Minimize2,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { ProductDimensions } from '../types/catalog.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Dynamic import for model-viewer custom element
if (typeof window !== 'undefined') {
  import('@google/model-viewer').catch((err) => {
    console.warn('Failed to load @google/model-viewer:', err);
  });
}

const ModelViewer = 'model-viewer' as any;

interface Props {
  modelUrl?: string | null;
  imageUrl?: string | null;
  name: string;
  dimensions?: ProductDimensions | null;
  multiAngleImages?: string[]; // Array of angles if captured via 360 turntable
  className?: string;
  autoRotate?: boolean;
  showDimensionsDefault?: boolean;
}

export const Product3dViewer: React.FC<Props> = ({
  modelUrl,
  imageUrl,
  name,
  dimensions,
  multiAngleImages = [],
  className = '',
  autoRotate = true,
  showDimensionsDefault = true,
}) => {
  const [showDimensions, setShowDimensions] = useState(showDimensionsDefault);
  const [isRotating, setIsRotating] = useState(autoRotate);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);

  // Check if we have a real GLB/GLTF model
  const is3DModel = Boolean(modelUrl && (modelUrl.endsWith('.glb') || modelUrl.endsWith('.gltf') || modelUrl.includes('/3d/')));
  const hasFrames = multiAngleImages.length > 1;

  // Handle frame drag for 360 photo turntable
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!hasFrames) return;
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !hasFrames) return;
    const diff = e.clientX - startXRef.current;
    if (Math.abs(diff) > 15) {
      const step = diff > 0 ? -1 : 1;
      setCurrentFrameIndex((prev) => {
        const next = (prev + step + multiAngleImages.length) % multiAngleImages.length;
        return next;
      });
      startXRef.current = e.clientX;
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Touch handlers for mobile turntable
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!hasFrames || e.touches.length === 0) return;
    isDraggingRef.current = true;
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || !hasFrames || e.touches.length === 0) return;
    const diff = e.touches[0].clientX - startXRef.current;
    if (Math.abs(diff) > 12) {
      const step = diff > 0 ? -1 : 1;
      setCurrentFrameIndex((prev) => (prev + step + multiAngleImages.length) % multiAngleImages.length);
      startXRef.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const hasAnyDimensions = dimensions && (dimensions.diameter || dimensions.height || dimensions.portion);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[280px] bg-gradient-to-b from-card via-muted/30 to-muted/60 rounded-2xl overflow-hidden border border-border/70 select-none group flex flex-col justify-between ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Floating Controls Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <Badge
            variant="secondary"
            className="bg-background/85 backdrop-blur-md border border-border/60 text-foreground font-bold text-[10px] px-2.5 py-1 shadow-xs flex items-center gap-1.5"
          >
            <Rotate3d className="size-3.5 text-primary animate-spin-slow" />
            <span>{is3DModel ? 'Modelo 3D Interactivo' : 'Giro 360°'}</span>
          </Badge>

          {hasAnyDimensions && (
            <Button
              type="button"
              variant={showDimensions ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowDimensions(!showDimensions)}
              className="h-7 px-2.5 rounded-lg text-[10px] font-bold shadow-2xs backdrop-blur-md cursor-pointer transition-all"
            >
              <Ruler className="size-3 mr-1" />
              <span>Dimensiones</span>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1 pointer-events-auto">
          {is3DModel && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setIsRotating(!isRotating)}
              title={isRotating ? 'Pausar rotación' : 'Auto-rotar'}
              className="size-7 rounded-lg bg-background/80 backdrop-blur-md border-border/60 hover:bg-muted text-foreground"
            >
              <Rotate3d className={`size-3.5 ${isRotating ? 'text-primary' : 'text-muted-foreground'}`} />
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            className="size-7 rounded-lg bg-background/80 backdrop-blur-md border-border/60 hover:bg-muted text-foreground"
          >
            {isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
          </Button>
        </div>
      </div>

      {/* Main 3D / 360 Render Area */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden">
        {is3DModel ? (
          <ModelViewer
            src={modelUrl || ''}
            alt={name}
            camera-controls=""
            auto-rotate={isRotating ? 'true' : undefined}
            rotation-per-second="30deg"
            shadow-intensity="1.2"
            shadow-softness="0.8"
            exposure="1"
            ar=""
            ar-modes="webxr scene-viewer quick-look"
            className="w-full h-full cursor-grab active:cursor-grabbing"
            style={{ width: '100%', height: '100%', minHeight: '260px' }}
          >
            {/* Slot for AR Button on mobile */}
            <button
              slot="ar-button"
              className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-lg hover:bg-primary/90 transition-all pointer-events-auto"
            >
              <Smartphone className="size-3.5" />
              <span>Ver en tu Mesa (AR)</span>
            </button>
          </ModelViewer>
        ) : hasFrames ? (
          <div className="relative w-full h-full flex items-center justify-center p-4 cursor-ew-resize">
            <img
              src={multiAngleImages[currentFrameIndex]}
              alt={`${name} - ángulo ${currentFrameIndex + 1}`}
              className="max-h-[85%] max-w-[85%] object-contain drop-shadow-xl transition-transform duration-75 select-none pointer-events-none"
              draggable={false}
            />
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-background/85 backdrop-blur-md rounded-full border border-border/60 text-[10px] font-semibold text-muted-foreground shadow-2xs pointer-events-none flex items-center gap-1.5">
              <span>↔ Arrastra para girar el plato</span>
              <span className="text-primary font-bold">
                {currentFrameIndex + 1}/{multiAngleImages.length}
              </span>
            </div>
          </div>
        ) : imageUrl ? (
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <img
              src={imageUrl}
              alt={name}
              className="max-h-[85%] max-w-[85%] object-contain drop-shadow-xl select-none"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground gap-2 p-6">
            <Rotate3d className="size-10 stroke-[1.5] text-muted-foreground/40" />
            <p className="text-xs font-semibold">Visualizador 3D disponible</p>
          </div>
        )}

        {/* Dimension Overlay Badges */}
        {showDimensions && hasAnyDimensions && (
          <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-end gap-2 z-10">
            <div className="bg-background/90 backdrop-blur-md p-3 rounded-xl border border-border/80 shadow-lg max-w-[280px] pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground mb-1.5">
                <Ruler className="size-3.5 text-primary" />
                <span>Dimensiones Reales</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {dimensions?.diameter ? (
                  <div className="bg-muted/50 rounded-lg p-1.5 border border-border/50">
                    <span className="text-[10px] text-muted-foreground block font-medium">Diámetro</span>
                    <span className="font-bold text-foreground">
                      Ø {dimensions.diameter} {dimensions.unit || 'cm'}
                    </span>
                  </div>
                ) : null}

                {dimensions?.height ? (
                  <div className="bg-muted/50 rounded-lg p-1.5 border border-border/50">
                    <span className="text-[10px] text-muted-foreground block font-medium">Altura</span>
                    <span className="font-bold text-foreground">
                      ↕ {dimensions.height} {dimensions.unit || 'cm'}
                    </span>
                  </div>
                ) : null}

                {dimensions?.portion ? (
                  <div className="col-span-2 bg-muted/50 rounded-lg p-1.5 border border-border/50 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground font-medium">Porción / Peso</span>
                    <span className="font-bold text-primary">{dimensions.portion}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subtle Bottom Instruction */}
      <div className="px-4 py-2 bg-background/60 backdrop-blur-xs border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="font-medium truncate max-w-[200px]">{name}</span>
        <div className="flex items-center gap-1">
          <Sparkles className="size-3 text-amber-500" />
          <span className="text-[10px] font-semibold">Rotación táctil libre</span>
        </div>
      </div>
    </div>
  );
};

export default Product3dViewer;
