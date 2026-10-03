import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Camera,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  Upload,
  Ruler,
  Rotate3d,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Trash2,
  Smartphone,
  Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ProductDimensions, DisplayMediaType } from '../types/catalog.types';
import { catalogApi } from '../api/catalog.api';
import { toast } from '@/components/ui/sonner';
import { Product3dViewer } from './Product3dViewer';
import { ScanPoseIllustration } from './ScanPoseIllustration';

interface ScanStep {
  id: number;
  title: string;
  subtitle: string;
  tip: string;
  guideShape: 'level' | 'angle45' | 'circle';
}

const SCAN_STEPS: ScanStep[] = [
  {
    id: 1,
    title: 'Paso 1: Vista Frontal (Nivel de Mesa)',
    subtitle: 'Coloca la cámara al nivel del plato',
    tip: 'Mantén la cámara horizontal paralela a la mesa para registrar la altura y presentación frontal del plato.',
    guideShape: 'level',
  },
  {
    id: 2,
    title: 'Paso 2: Ángulo de 45° (Profundidad)',
    subtitle: 'Inclina la cámara 45 grados',
    tip: 'Apunta a la comida desde un ángulo medio para capturar el volumen, salsas y guarniciones con profundidad.',
    guideShape: 'angle45',
  },
  {
    id: 3,
    title: 'Paso 3: Vista Cenital (Desde Arriba)',
    subtitle: 'Alinea el plato en el círculo central',
    tip: 'Coloca la cámara verticalmente sobre el plato. Centra el borde del plato dentro del círculo para calcular el diámetro.',
    guideShape: 'circle',
  },
];

interface Props {
  isOpen: boolean;
  productName: string;
  currentImageUrl?: string | null;
  currentModel3dUrl?: string | null;
  currentDimensions?: ProductDimensions | null;
  currentDisplayMedia?: DisplayMediaType;
  onClose: () => void;
  onComplete: (data: {
    imageUrl?: string;
    model3dUrl?: string;
    dimensions: ProductDimensions;
    displayMedia: DisplayMediaType;
  }) => void;
}

export const Product3dScannerModal: React.FC<Props> = ({
  isOpen,
  productName,
  currentImageUrl,
  currentModel3dUrl,
  currentDimensions,
  currentDisplayMedia = 'both',
  onClose,
  onComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0); // 0,1,2 = steps, 3 = dimensions, 4 = preview
  const [capturedFrames, setCapturedFrames] = useState<string[]>([]);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPoseIllustration, setShowPoseIllustration] = useState(true);
  const [isDesktopBrowser, setIsDesktopBrowser] = useState(false);
  const [showDesktopMobileNotice, setShowDesktopMobileNotice] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (window.matchMedia && window.matchMedia('(max-width: 768px)').matches);
      setIsDesktopBrowser(!isMobile);
    }
  }, []);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Enlace copiado al portapapeles. Puedes abrirlo en tu celular para escanear');
    }
  };

  // Dimensions state
  const [diameter, setDiameter] = useState<string>(
    currentDimensions?.diameter ? String(currentDimensions.diameter) : '24'
  );
  const [height, setHeight] = useState<string>(
    currentDimensions?.height ? String(currentDimensions.height) : '6'
  );
  const [portion, setPortion] = useState<string>(
    currentDimensions?.portion || '350g'
  );
  const [unit, setUnit] = useState<string>(currentDimensions?.unit || 'cm');
  const [displayMedia, setDisplayMedia] = useState<DisplayMediaType>(currentDisplayMedia || 'both');

  // Uploaded 3D model (.glb/.gltf)
  const [uploadedModelUrl, setUploadedModelUrl] = useState<string | null>(currentModel3dUrl || null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modelFileInputRef = useRef<HTMLInputElement>(null);

  // Stop camera stream safely
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  // Start camera stream
  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Tu navegador no soporta acceso directo a la cámara. Puedes subir fotos manualmente.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access denied or failed:', err);
      // Fallback try without facingMode constraints
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.play().catch(() => {});
        }
        setIsCameraActive(true);
      } catch (fallbackErr: any) {
        setCameraError('No se pudo acceder a la cámara. Revisa los permisos del navegador o sube las imágenes desde archivo.');
      }
    }
  }, [facingMode, stopCamera]);

  useEffect(() => {
    if (isOpen && currentStepIndex < 3) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, currentStepIndex, startCamera, stopCamera]);

  // Flip camera between environment and front
  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Capture current video frame to base64
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    const updated = [...capturedFrames];
    updated[currentStepIndex] = dataUrl;
    setCapturedFrames(updated);

    toast.success(`Toma ${currentStepIndex + 1} capturada`);

    // Advance to next step
    if (currentStepIndex < 2) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Finished all 3 shots, go to dimensions step
      setCurrentStepIndex(3);
    }
  };

  // Handle local file upload fallback for steps
  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const updated = [...capturedFrames];
      updated[currentStepIndex] = dataUrl;
      setCapturedFrames(updated);

      if (currentStepIndex < 2) {
        setCurrentStepIndex(currentStepIndex + 1);
      } else {
        setCurrentStepIndex(3);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Upload custom 3D model (.glb / .gltf)
  const handleModelFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      const res = await catalogApi.uploadMedia(file);
      setUploadedModelUrl(res.url);
      toast.success('Modelo 3D (.glb) cargado con éxito');
    } catch (err: any) {
      toast.error('Error al subir modelo 3D: ' + (err.message || 'Error desconocido'));
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  // Finish and upload captured assets
  const handleSaveAndApply = async () => {
    try {
      setIsProcessing(true);
      let finalImageUrl = currentImageUrl || undefined;

      // Upload primary image (Frame 2 or Frame 1) if new capture was made
      if (capturedFrames.length > 0) {
        const primaryFrame = capturedFrames[1] || capturedFrames[0];
        if (primaryFrame && primaryFrame.startsWith('data:image')) {
          const res = await catalogApi.uploadBase64({
            base64Data: primaryFrame,
            filename: `${productName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-photo.jpg`,
            mimeType: 'image/jpeg',
          });
          finalImageUrl = res.url;
        }
      }

      const dimensionsData: ProductDimensions = {
        diameter: diameter ? parseFloat(diameter) : undefined,
        height: height ? parseFloat(height) : undefined,
        unit: unit || 'cm',
        portion: portion || undefined,
      };

      onComplete({
        imageUrl: finalImageUrl,
        model3dUrl: uploadedModelUrl || undefined,
        dimensions: dimensionsData,
        displayMedia,
      });

      toast.success('Presentación visual y dimensiones actualizadas');
      onClose();
    } catch (err: any) {
      toast.error('Error al guardar datos de escaneo: ' + (err.message || 'Error desconocido'));
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border/80 w-full max-w-4xl max-h-[95vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border/70 flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20 shadow-2xs">
              <Camera className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-foreground tracking-tight flex items-center gap-2">
                <span>Asistente de Escaneo 3D & Dimensiones</span>
                <Badge variant="outline" className="text-[10px] font-bold border-primary/40 text-primary">
                  Cámara Web
                </Badge>
              </h2>
              <p className="text-xs text-muted-foreground">
                Plato: <strong className="text-foreground">{productName || 'Nuevo Plato'}</strong>
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="size-8 rounded-xl text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Step Indicator Bar */}
        <div className="px-6 py-3 border-b border-border/60 bg-muted/15 flex items-center justify-between gap-1 overflow-x-auto">
          {[
            { label: '1. Frontal', idx: 0 },
            { label: '2. Ángulo 45°', idx: 1 },
            { label: '3. Cenital (90°)', idx: 2 },
            { label: '4. Medidas', idx: 3 },
            { label: '5. Previsualización', idx: 4 },
          ].map((st) => {
            const isDone = st.idx < currentStepIndex || (st.idx < 3 && Boolean(capturedFrames[st.idx]));
            const isCurrent = st.idx === currentStepIndex;

            return (
              <button
                key={st.idx}
                type="button"
                onClick={() => setCurrentStepIndex(st.idx)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isCurrent
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : isDone
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                ) : (
                  <span className="size-3.5 rounded-full border border-current flex items-center justify-center text-[9px]">
                    {st.idx + 1}
                  </span>
                )}
                <span>{st.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile Device Recommendation Notice for Desktop Browser Clients */}
        {isDesktopBrowser && showDesktopMobileNotice && (
          <div className="mx-4 sm:mx-6 mt-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-3 text-amber-950 dark:text-amber-100 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-start gap-3">
              <div className="size-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Smartphone className="size-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs sm:text-sm font-black text-amber-900 dark:text-amber-200">
                    💡 Recomendación: Escanea desde un Dispositivo Móvil
                  </h4>
                  <Badge variant="outline" className="text-[10px] font-extrabold border-amber-500/40 text-amber-700 dark:text-amber-300 bg-amber-500/10">
                    Mayor comodidad
                  </Badge>
                </div>
                <p className="text-xs text-amber-800/90 dark:text-amber-300/90 leading-relaxed max-w-2xl">
                  Para registrar los diferentes ángulos del plato (nivel de mesa a 0°, diagonal a 45° y cenital desde arriba a 90°) con mayor libertad de movimiento y comodidad, <strong>te recomendamos abrir este panel desde tu smartphone o tablet</strong>.
                </p>
                <div className="pt-1 flex items-center gap-2 flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    className="h-7 px-2.5 rounded-lg text-xs font-bold border-amber-500/40 text-amber-800 dark:text-amber-200 hover:bg-amber-500/20 gap-1.5 cursor-pointer"
                  >
                    <Copy className="size-3" />
                    <span>Copiar enlace para el móvil</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDesktopMobileNotice(false)}
                    className="h-7 px-2 rounded-lg text-xs font-bold text-amber-800/70 dark:text-amber-300/70 hover:bg-amber-500/15 cursor-pointer"
                  >
                    <span>Continuar con webcam en PC</span>
                  </Button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowDesktopMobileNotice(false)}
              className="size-7 rounded-lg text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
              title="Cerrar recomendación"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          {currentStepIndex < 3 ? (
            /* CAMERA CAPTURE STEPS (0, 1, 2) */
            <div className="space-y-4">
              {/* Step Instruction Card with Illustration */}
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-3 sm:p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="size-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="size-4" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-foreground">
                        {SCAN_STEPS[currentStepIndex].title}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {SCAN_STEPS[currentStepIndex].tip}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPoseIllustration((prev) => !prev)}
                    className="h-8 px-2.5 rounded-xl text-xs font-bold border-primary/30 text-primary hover:bg-primary/10 shrink-0 gap-1.5 cursor-pointer"
                  >
                    <Smartphone className="size-3.5" />
                    <span className="hidden sm:inline">
                      {showPoseIllustration ? 'Ocultar Ilustración' : 'Ver Cómo Colocar Móvil'}
                    </span>
                    <span className="sm:hidden">
                      {showPoseIllustration ? 'Ocultar' : 'Ilustración'}
                    </span>
                  </Button>
                </div>

                {/* Illustrated Pose Guide */}
                {showPoseIllustration && (
                  <div className="pt-2 border-t border-primary/15 animate-in fade-in duration-200">
                    <ScanPoseIllustration step={currentStepIndex} />
                  </div>
                )}
              </div>

              {/* Viewfinder Frame (Optimized for Mobile Height) */}
              <div className="relative aspect-[4/3] sm:aspect-video w-full min-h-[300px] sm:min-h-[360px] max-h-[440px] bg-black rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center border border-border/80">
                {cameraError ? (
                  <div className="p-6 text-center space-y-3 max-w-sm">
                    <AlertCircle className="size-10 text-destructive mx-auto" />
                    <p className="text-xs text-muted-foreground">{cameraError}</p>
                    <div className="flex justify-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={startCamera}
                        className="text-xs font-bold"
                      >
                        <RefreshCw className="size-3.5 mr-1.5" /> Reintentar cámara
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-bold bg-primary text-primary-foreground"
                      >
                        <Upload className="size-3.5 mr-1.5" /> Subir foto
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      autoPlay
                      className="w-full h-full object-cover"
                    />

                    {/* HUD Guidance Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-3 sm:p-4">
                      {/* Top status bar */}
                      <div className="w-full flex items-center justify-between gap-2">
                        <div className="px-3.5 py-1.5 bg-black/75 backdrop-blur-md rounded-full text-[11px] sm:text-xs font-bold text-white/95 border border-white/20 flex items-center gap-2 shadow-lg">
                          <span
                            className={`size-2.5 rounded-full ${
                              isCameraActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                            }`}
                          />
                          <span>{SCAN_STEPS[currentStepIndex].subtitle}</span>
                        </div>

                        {!showPoseIllustration && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setShowPoseIllustration(true)}
                            className="pointer-events-auto h-7 px-2.5 rounded-full bg-black/75 hover:bg-black/90 text-white text-[10px] font-bold backdrop-blur-md border border-white/25 shadow-md flex items-center gap-1 cursor-pointer"
                          >
                            <Smartphone className="size-3" />
                            <span>Ver Postura</span>
                          </Button>
                        )}
                      </div>

                      {/* Center Reticle Shape */}
                      <div className="relative w-full max-w-xs flex items-center justify-center pointer-events-none">
                        {currentStepIndex === 0 && (
                          /* Horizontal Level guide with Plate Silhouette */
                          <div className="w-full flex flex-col items-center justify-center">
                            {/* Plate Silhouette Ghost */}
                            <div className="w-44 h-12 rounded-[50%] border-2 border-dashed border-primary/60 bg-primary/10 flex items-center justify-center mb-1">
                              <span className="text-[9px] font-black text-primary bg-black/75 px-2 py-0.5 rounded-full">
                                Centra el plato
                              </span>
                            </div>
                            {/* Horizontal Level line */}
                            <div className="w-full border-t-2 border-dashed border-primary relative flex items-center justify-center">
                              <span className="px-2.5 py-0.5 bg-black/85 rounded-full text-[10px] text-white font-extrabold border border-primary/40 -mt-2.5 shadow-sm">
                                0° Nivel de Mesa
                              </span>
                            </div>
                          </div>
                        )}

                        {currentStepIndex === 1 && (
                          /* 45 degree oval guide with depth angle */
                          <div className="w-52 h-36 rounded-[100%] border-2 border-dashed border-primary bg-primary/10 flex flex-col items-center justify-center animate-pulse">
                            <span className="text-[10px] text-white font-black bg-black/85 px-2.5 py-0.5 rounded-full border border-primary/50 shadow-sm">
                              45° Inclinación
                            </span>
                            <span className="text-[9px] text-primary-foreground font-semibold mt-1">
                              Apunta al centro
                            </span>
                          </div>
                        )}

                        {currentStepIndex === 2 && (
                          /* Top-down circular rim guide */
                          <div className="size-48 rounded-full border-2 border-dashed border-emerald-400 bg-emerald-500/10 flex flex-col items-center justify-center animate-pulse relative">
                            <div className="size-3.5 rounded-full bg-emerald-400 ring-4 ring-emerald-400/30" />
                            <span className="text-[10px] text-white font-black bg-black/85 px-2.5 py-0.5 rounded-full border border-emerald-400/50 mt-2 shadow-sm">
                              90° Cenital (Desde arriba)
                            </span>
                            {/* Crosshairs */}
                            <div className="absolute top-0 w-0.5 h-3 bg-emerald-400" />
                            <div className="absolute bottom-0 w-0.5 h-3 bg-emerald-400" />
                            <div className="absolute left-0 w-3 h-0.5 bg-emerald-400" />
                            <div className="absolute right-0 w-3 h-0.5 bg-emerald-400" />
                          </div>
                        )}
                      </div>

                      {/* Bottom camera flip & upload buttons */}
                      <div className="flex items-center gap-2 pointer-events-auto">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={toggleCameraFacing}
                          className="h-8 px-3 rounded-xl bg-black/70 hover:bg-black/90 text-white text-xs font-semibold backdrop-blur-md border border-white/20 shadow-md cursor-pointer"
                        >
                          <RefreshCw className="size-3.5 mr-1" />
                          <span>Cambiar Cámara</span>
                        </Button>

                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="h-8 px-3 rounded-xl bg-black/70 hover:bg-black/90 text-white text-xs font-semibold backdrop-blur-md border border-white/20 shadow-md cursor-pointer"
                        >
                          <Upload className="size-3.5 mr-1" />
                          <span>Subir Archivo</span>
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Shutter Capture Button */}
              <div className="flex items-center justify-center pt-2">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="size-16 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center shadow-xl ring-4 ring-primary/30 transition-transform active:scale-90 cursor-pointer"
                >
                  <Camera className="size-7" />
                </button>
              </div>

              {/* Mini Gallery of Captured Steps */}
              {capturedFrames.length > 0 && (
                <div className="pt-2 border-t border-border/60">
                  <span className="text-xs font-bold text-foreground block mb-2">
                    Tomas Registradas:
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    {[0, 1, 2].map((idx) => {
                      const img = capturedFrames[idx];
                      return (
                        <div
                          key={idx}
                          className={`relative aspect-video rounded-xl overflow-hidden border ${
                            img ? 'border-primary/50 bg-muted' : 'border-border/60 bg-muted/30'
                          } flex items-center justify-center`}
                        >
                          {img ? (
                            <>
                              <img src={img} alt={`Toma ${idx + 1}`} className="w-full h-full object-cover" />
                              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-white">
                                {idx === 0 ? 'Frontal' : idx === 1 ? '45°' : 'Cenital'}
                              </span>
                            </>
                          ) : (
                            <span className="text-[10px] text-muted-foreground font-semibold">
                              Sin toma {idx + 1}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : currentStepIndex === 3 ? (
            /* STEP 4: DIMENSIONS CONFIGURATION */
            <div className="space-y-6 max-w-xl mx-auto py-2">
              <div className="text-center space-y-1">
                <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2 ring-1 ring-primary/20">
                  <Ruler className="size-6" />
                </div>
                <h3 className="text-lg font-black text-foreground">
                  Dimensiones Físicas y Porción del Plato
                </h3>
                <p className="text-xs text-muted-foreground">
                  Estas medidas permitirán a los clientes y camareros conocer la escala real del plato en 3D y Realidad Aumentada (AR).
                </p>
              </div>

              {/* Illustrated Dimensions Guide */}
              <ScanPoseIllustration step={3} className="max-w-md mx-auto" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/20 p-5 rounded-2xl border border-border/80">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-foreground">
                    Diámetro del Plato (Ancho)
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.5"
                      min="1"
                      value={diameter}
                      onChange={(e) => setDiameter(e.target.value)}
                      placeholder="24"
                      className="h-10 pr-12 rounded-xl text-sm font-bold bg-background"
                    />
                    <button
                      type="button"
                      onClick={() => setUnit(unit === 'cm' ? 'in' : 'cm')}
                      title="Cambiar unidad (cm / in)"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-primary hover:underline cursor-pointer"
                    >
                      {unit}
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Diámetro exterior de vajilla (típico: 22 - 30 cm)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-foreground">
                    Altura / Profundidad
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.5"
                      min="1"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="6"
                      className="h-10 pr-12 rounded-xl text-sm font-bold bg-background"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                      {unit}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Altura de emplatado o borde (típico: 4 - 12 cm)
                  </p>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-xs font-bold text-foreground">
                    Porción / Peso Estimado
                  </Label>
                  <Input
                    type="text"
                    value={portion}
                    onChange={(e) => setPortion(e.target.value)}
                    placeholder="Ej. 400g • Apto para compartir"
                    className="h-10 rounded-xl text-sm font-semibold bg-background"
                  />
                </div>
              </div>

              {/* Optional 3D Model File Upload (.glb) */}
              <div className="p-4 rounded-2xl border border-dashed border-border/80 bg-muted/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Rotate3d className="size-4 text-primary" />
                      <span>Archivo de Modelo 3D (.glb / .gltf)</span>
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {uploadedModelUrl
                        ? 'Modelo 3D vinculado correctamente.'
                        : 'Opcional: Si posees un modelo fotogramétrico .glb o escaneado por LiDAR, cárgalo aquí.'}
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => modelFileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="text-xs font-bold rounded-xl"
                  >
                    <Upload className="size-3.5 mr-1" />
                    <span>{uploadedModelUrl ? 'Reemplazar .glb' : 'Subir .glb'}</span>
                  </Button>
                </div>

                {uploadedModelUrl && (
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 text-xs">
                    <span className="font-mono text-primary truncate max-w-sm">
                      {uploadedModelUrl}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setUploadedModelUrl(null)}
                      className="size-6 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Display Media Choice */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-foreground">
                  Modo de Presentación en Carta / POS
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'image', label: 'Solo Foto 2D', desc: 'Presentación tradicional rápida' },
                    { id: 'model3d', label: 'Solo 3D', desc: 'Interactivo y dimensiones' },
                    { id: 'both', label: 'Ambos (Recomendado)', desc: 'Conmutador foto y 3D interactivo' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setDisplayMedia(opt.id as DisplayMediaType)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        displayMedia === opt.id
                          ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                          : 'border-border/70 bg-card hover:bg-muted/40'
                      }`}
                    >
                      <span className="text-xs font-bold text-foreground block">
                        {opt.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground block mt-0.5 leading-tight">
                        {opt.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* STEP 5: FINAL PREVIEW */
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="text-center space-y-1">
                <h3 className="text-base font-black text-foreground">
                  Previsualización de Presentación 3D
                </h3>
                <p className="text-xs text-muted-foreground">
                  Verifica cómo interactuarán los clientes con la rotación y dimensiones del plato.
                </p>
              </div>

              <div className="h-[340px] w-full rounded-2xl overflow-hidden shadow-md">
                <Product3dViewer
                  name={productName}
                  modelUrl={uploadedModelUrl}
                  imageUrl={capturedFrames[1] || capturedFrames[0] || currentImageUrl}
                  multiAngleImages={capturedFrames.filter(Boolean)}
                  dimensions={{
                    diameter: diameter ? parseFloat(diameter) : undefined,
                    height: height ? parseFloat(height) : undefined,
                    unit: unit || 'cm',
                    portion: portion || undefined,
                  }}
                  showDimensionsDefault={true}
                  autoRotate={true}
                />
              </div>

              <div className="bg-muted/30 p-3.5 rounded-2xl border border-border/70 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-foreground block">Configuración Lista</span>
                  <span className="text-muted-foreground text-[11px] block">
                    Modo: {displayMedia === 'both' ? 'Foto + 3D' : displayMedia === 'model3d' ? 'Solo 3D' : 'Solo Foto'} • {diameter}x{height} {unit}
                  </span>
                </div>
                <Badge variant="outline" className="text-emerald-600 border-emerald-500/30">
                  Listo para Guardar
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-border/70 bg-muted/20 flex items-center justify-between">
          <div>
            {currentStepIndex > 0 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentStepIndex(currentStepIndex - 1)}
                className="rounded-xl text-xs font-semibold"
              >
                <ChevronLeft className="size-3.5 mr-1" />
                <span>Anterior</span>
              </Button>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {currentStepIndex < 4 ? (
              <Button
                type="button"
                size="sm"
                onClick={() => setCurrentStepIndex(currentStepIndex + 1)}
                className="rounded-xl text-xs font-bold bg-primary text-primary-foreground shadow-xs cursor-pointer"
              >
                <span>Siguiente Paso</span>
                <ChevronRight className="size-3.5 ml-1" />
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                disabled={isProcessing}
                onClick={handleSaveAndApply}
                className="rounded-xl text-xs font-bold bg-primary text-primary-foreground shadow-xs cursor-pointer px-5"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <span className="size-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    <span>Guardando y Subiendo...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-4" />
                    <span>Aplicar al Plato</span>
                  </span>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Hidden file input for image uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleLocalImageUpload}
      />

      {/* Hidden file input for 3D model uploads */}
      <input
        ref={modelFileInputRef}
        type="file"
        accept=".glb,.gltf"
        className="hidden"
        onChange={handleModelFileUpload}
      />
    </div>,
    document.body
  );
};

export default Product3dScannerModal;
