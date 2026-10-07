import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
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
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Focus,
  SlidersHorizontal,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ProductDimensions, DisplayMediaType } from "../types/catalog.types";
import { catalogApi } from "../api/catalog.api";
import { toast } from "@/components/ui/sonner";
import { Product3dViewer } from "./Product3dViewer";
import { ScanPoseIllustration } from "./ScanPoseIllustration";

interface ScanStep {
  id: number;
  title: string;
  subtitle: string;
  tip: string;
}

const SCAN_STEPS: ScanStep[] = [
  {
    id: 1,
    title: "Paso 1: Vista Frontal (Nivel de Mesa)",
    subtitle: "Coloca la cámara al nivel del plato",
    tip: "Mantén la cámara horizontal paralela a la mesa para registrar la altura y presentación frontal del plato.",
  },
  {
    id: 2,
    title: "Paso 2: Ángulo de 45° (Profundidad)",
    subtitle: "Inclina la cámara 45 grados",
    tip: "Apunta a la comida desde un ángulo medio para capturar el volumen, salsas y guarniciones con profundidad.",
  },
  {
    id: 3,
    title: "Paso 3: Vista Cenital (Desde Arriba)",
    subtitle: "Alinea el plato en el círculo central",
    tip: "Coloca la cámara verticalmente sobre el plato. Centra el borde del plato dentro del círculo para calcular el diámetro.",
  },
];

interface AlignmentGuideProps {
  step: number; // 0 = Frontal (0°), 1 = 45°, 2 = Cenital (90°)
}

export const AlignmentGuide: React.FC<AlignmentGuideProps> = ({ step }) => {
  return (
    <div className="relative aspect-square w-full max-w-70 sm:max-w-90 flex items-center justify-center pointer-events-none select-none">
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full drop-shadow-md"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        {step === 0 && (
          /* STEP 0: FRONTAL / MESA (0°) */
          <g>
            {/* Línea de horizonte de la mesa */}
            <line
              x1="30"
              y1="270"
              x2="370"
              y2="270"
              stroke="#f97316"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              opacity="0.9"
            />

            {/* Silueta Plato Frontal (base y borde) */}
            <ellipse
              cx="200"
              cy="270"
              rx="90"
              ry="8"
              fill="#f97316"
              fillOpacity="0.15"
              stroke="#f97316"
              strokeWidth="2"
              strokeDasharray="4 3"
            />
            <ellipse
              cx="200"
              cy="235"
              rx="145"
              ry="24"
              fill="#f97316"
              fillOpacity="0.1"
              stroke="#f97316"
              strokeWidth="2.5"
            />

            {/* Comida / Silueta de porción */}
            <path
              d="M 85 235 C 105 145, 295 145, 315 235 Z"
              fill="#f97316"
              fillOpacity="0.08"
              stroke="#f97316"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />

            {/* Eje vertical y burbuja de nivelación */}
            <line
              x1="200"
              y1="120"
              x2="200"
              y2="235"
              stroke="#f97316"
              strokeWidth="1.5"
              strokeDasharray="2 3"
              opacity="0.6"
            />
            <circle cx="200" cy="235" r="4" fill="#f97316" />

            {/* Placa indicador */}
            <rect
              x="145"
              y="280"
              width="110"
              height="22"
              rx="11"
              fill="#000000"
              fillOpacity="0.8"
              stroke="#f97316"
              strokeWidth="1"
            />
            <text
              x="200"
              y="295"
              textAnchor="middle"
              fontSize="11"
              fontWeight="bold"
              fill="#ffffff"
            >
              0° Nivel de Mesa
            </text>
          </g>
        )}

        {step === 1 && (
          /* STEP 1: 45° INCLINACIÓN (Aspect ratio exacto ~0.707) */
          <g>
            {/* Borde exterior elíptico 45° */}
            <ellipse
              cx="200"
              cy="200"
              rx="145"
              ry="102"
              fill="#f97316"
              fillOpacity="0.08"
              stroke="#f97316"
              strokeWidth="2.5"
              strokeDasharray="5 4"
            />

            {/* Borde interior base del plato */}
            <ellipse
              cx="200"
              cy="200"
              rx="100"
              ry="70"
              fill="#f97316"
              fillOpacity="0.12"
              stroke="#f97316"
              strokeWidth="1.5"
            />

            {/* Retícula central */}
            <circle cx="200" cy="200" r="5" fill="#f97316" />
            <circle
              cx="200"
              cy="200"
              r="20"
              stroke="#f97316"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />

            {/* Ejes de referencia en los bordes */}
            <line
              x1="200"
              y1="65"
              x2="200"
              y2="98"
              stroke="#f97316"
              strokeWidth="2"
            />
            <line
              x1="200"
              y1="302"
              x2="200"
              y2="335"
              stroke="#f97316"
              strokeWidth="2"
            />
            <line
              x1="40"
              y1="200"
              x2="55"
              y2="200"
              stroke="#f97316"
              strokeWidth="2"
            />
            <line
              x1="345"
              y1="200"
              x2="360"
              y2="200"
              stroke="#f97316"
              strokeWidth="2"
            />

            {/* Placa indicador */}
            <rect
              x="140"
              y="35"
              width="120"
              height="22"
              rx="11"
              fill="#000000"
              fillOpacity="0.8"
              stroke="#f97316"
              strokeWidth="1"
            />
            <text
              x="200"
              y="50"
              textAnchor="middle"
              fontSize="11"
              fontWeight="bold"
              fill="#ffffff"
            >
              45° Inclinación
            </text>
          </g>
        )}

        {step === 2 && (
          /* STEP 2: 90° CENITAL (Círculo perfecto 1:1, garantizado sin distorsión) */
          <g>
            {/* Borde circular exterior */}
            <circle
              cx="200"
              cy="200"
              r="140"
              fill="#10b981"
              fillOpacity="0.08"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeDasharray="5 4"
            />

            {/* Círculo intermedio */}
            <circle
              cx="200"
              cy="200"
              r="95"
              fill="#10b981"
              fillOpacity="0.1"
              stroke="#10b981"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />

            {/* Diana central de alineación */}
            <circle
              cx="200"
              cy="200"
              r="26"
              stroke="#10b981"
              strokeWidth="1.5"
            />
            <circle cx="200" cy="200" r="5" fill="#10b981" />

            {/* Cruz de nivelación cenital */}
            <line
              x1="200"
              y1="35"
              x2="200"
              y2="165"
              stroke="#10b981"
              strokeWidth="2"
            />
            <line
              x1="200"
              y1="235"
              x2="200"
              y2="365"
              stroke="#10b981"
              strokeWidth="2"
            />
            <line
              x1="35"
              y1="200"
              x2="165"
              y2="200"
              stroke="#10b981"
              strokeWidth="2"
            />
            <line
              x1="235"
              y1="200"
              x2="365"
              y2="200"
              stroke="#10b981"
              strokeWidth="2"
            />

            {/* Marcadores de cuadrante */}
            <circle cx="200" cy="60" r="3" fill="#10b981" />
            <circle cx="200" cy="340" r="3" fill="#10b981" />
            <circle cx="60" cy="200" r="3" fill="#10b981" />
            <circle cx="340" cy="200" r="3" fill="#10b981" />

            {/* Placa indicador */}
            <rect
              x="130"
              y="8"
              width="140"
              height="22"
              rx="11"
              fill="#000000"
              fillOpacity="0.8"
              stroke="#10b981"
              strokeWidth="1"
            />
            <text
              x="200"
              y="23"
              textAnchor="middle"
              fontSize="11"
              fontWeight="bold"
              fill="#ffffff"
            >
              90° Vista Cenital
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};

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
  currentDisplayMedia = "both",
  onClose,
  onComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0); // 0,1,2 = steps, 3 = dimensions, 4 = preview
  const [capturedFrames, setCapturedFrames] = useState<string[]>([]);
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment",
  );
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPoseIllustration, setShowPoseIllustration] = useState(false);
  const [isDesktopBrowser, setIsDesktopBrowser] = useState(false);
  const [showDesktopMobileNotice, setShowDesktopMobileNotice] = useState(false);

  // UX/UI 4: Modo Foco (Focus Mode)
  const [isFocusMode, setIsFocusMode] = useState(true);

  // UX/UI 5: Interactive Alignment & Manipulation in Desktop/Web
  const [adjustingImage, setAdjustingImage] = useState<string | null>(null);
  const [adjustScale, setAdjustScale] = useState<number>(1.0);
  const [adjustRotation, setAdjustRotation] = useState<number>(0);
  const [adjustPan, setAdjustPan] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialPanRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // UX/UI 6: Non-invasive dimensions editing in preview
  const [showInlineDimensionsEdit, setShowInlineDimensionsEdit] =
    useState(false);

  // Dimensions state
  const [diameter, setDiameter] = useState<string>(
    currentDimensions?.diameter ? String(currentDimensions.diameter) : "24",
  );
  const [height, setHeight] = useState<string>(
    currentDimensions?.height ? String(currentDimensions.height) : "6",
  );
  const [portion, setPortion] = useState<string>(
    currentDimensions?.portion || "350g",
  );
  const [unit, setUnit] = useState<string>(currentDimensions?.unit || "cm");
  const [displayMedia, setDisplayMedia] = useState<DisplayMediaType>(
    currentDisplayMedia || "both",
  );

  // Check if valid dimensions exist to skip intrusive measurements modal
  const hasValidDimensions = Boolean(
    (currentDimensions?.diameter && Number(currentDimensions.diameter) > 0) ||
    (diameter && Number(diameter) > 0),
  );

  // Uploaded 3D model (.glb/.gltf)
  const [uploadedModelUrl, setUploadedModelUrl] = useState<string | null>(
    currentModel3dUrl || null,
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modelFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        ) ||
        (window.matchMedia && window.matchMedia("(max-width: 768px)").matches);
      setIsDesktopBrowser(!isMobile);
    }
  }, []);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success(
        "Enlace copiado al portapapeles. Puedes abrirlo en tu celular para escanear",
      );
    }
  };

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
      setCameraError(
        "Tu navegador no soporta acceso directo a la cámara. Puedes subir fotos manualmente.",
      );
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
      console.warn("Camera access denied or failed:", err);
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.play().catch(() => {});
        }
        setIsCameraActive(true);
      } catch (fallbackErr: any) {
        setCameraError(
          "No se pudo acceder a la cámara. Revisa los permisos del navegador o sube las imágenes desde archivo.",
        );
      }
    }
  }, [facingMode, stopCamera]);

  useEffect(() => {
    if (isOpen && currentStepIndex < 3 && !adjustingImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, currentStepIndex, adjustingImage, startCamera, stopCamera]);

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  // Helper to advance after step 2 (UX/UI 6: skip intrusive dimensions modal if valid)
  const advanceAfterStep2 = useCallback(() => {
    if (hasValidDimensions) {
      setCurrentStepIndex(4); // Straight to Preview!
    } else {
      setCurrentStepIndex(3); // To Dimensions if not yet set
    }
  }, [hasValidDimensions]);

  // Capture current video frame to base64
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);

    const updated = [...capturedFrames];
    updated[currentStepIndex] = dataUrl;
    setCapturedFrames(updated);

    toast.success(`Toma ${currentStepIndex + 1} capturada`);

    if (currentStepIndex < 2) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      advanceAfterStep2();
    }
  };

  // Handle local file upload fallback: open interactive alignment preview (UX/UI 5)
  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // Launch interactive alignment tool
      setAdjustingImage(dataUrl);
      setAdjustScale(1.0);
      setAdjustRotation(0);
      setAdjustPan({ x: 0, y: 0 });
      stopCamera();
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Re-adjust any previously captured shot
  const handleStartAdjustingExistingFrame = (frameIndex: number) => {
    const frame = capturedFrames[frameIndex];
    if (!frame) return;
    setCurrentStepIndex(frameIndex);
    setAdjustingImage(frame);
    setAdjustScale(1.0);
    setAdjustRotation(0);
    setAdjustPan({ x: 0, y: 0 });
    stopCamera();
  };

  // Interactive mouse/touch drag handlers
  const handlePointerDown = (clientX: number, clientY: number) => {
    setIsDraggingCanvas(true);
    dragStartRef.current = { x: clientX, y: clientY };
    initialPanRef.current = { ...adjustPan };
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDraggingCanvas) return;
    const dx = clientX - dragStartRef.current.x;
    const dy = clientY - dragStartRef.current.y;
    setAdjustPan({
      x: initialPanRef.current.x + dx,
      y: initialPanRef.current.y + dy,
    });
  };

  const handlePointerUp = () => {
    setIsDraggingCanvas(false);
  };

  // Confirm alignment and rasterize through offscreen canvas
  const handleConfirmAdjust = () => {
    if (!adjustingImage) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1280;
      canvas.height = 960;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Dark background
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      // Center of canvas + pan
      ctx.translate(
        canvas.width / 2 + adjustPan.x,
        canvas.height / 2 + adjustPan.y,
      );
      ctx.rotate((adjustRotation * Math.PI) / 180);
      ctx.scale(adjustScale, adjustScale);

      // Draw image centered
      const aspect = img.width / img.height;
      let drawW = canvas.width;
      let drawH = drawW / aspect;
      if (drawH > canvas.height) {
        drawH = canvas.height;
        drawW = drawH * aspect;
      }
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      const finalDataUrl = canvas.toDataURL("image/jpeg", 0.92);
      const updated = [...capturedFrames];
      updated[currentStepIndex] = finalDataUrl;
      setCapturedFrames(updated);
      setAdjustingImage(null);

      toast.success(`Toma ${currentStepIndex + 1} alineada y guardada`);

      if (currentStepIndex < 2) {
        setCurrentStepIndex(currentStepIndex + 1);
      } else {
        advanceAfterStep2();
      }
    };
    img.src = adjustingImage;
  };

  const handleCancelAdjust = () => {
    setAdjustingImage(null);
    if (isOpen && currentStepIndex < 3) {
      startCamera();
    }
  };

  // Upload custom 3D model (.glb / .gltf)
  const handleModelFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      const res = await catalogApi.uploadMedia(file);
      setUploadedModelUrl(res.url);
      toast.success("Modelo 3D (.glb) cargado con éxito");
    } catch (err: any) {
      toast.error(
        "Error al subir modelo 3D: " + (err.message || "Error desconocido"),
      );
    } finally {
      setIsProcessing(false);
      e.target.value = "";
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
        if (
          primaryFrame &&
          (primaryFrame.startsWith("data:image") ||
            primaryFrame.includes("base64"))
        ) {
          const res = await catalogApi.uploadBase64({
            dataUrl: primaryFrame,
            base64Data: primaryFrame,
            filename: `${productName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-photo.jpg`,
            mimeType: "image/jpeg",
          });
          finalImageUrl = res.url;
        }
      }

      const dimensionsData: ProductDimensions = {
        diameter: diameter ? parseFloat(diameter) : undefined,
        height: height ? parseFloat(height) : undefined,
        unit: unit || "cm",
        portion: portion || undefined,
      };

      onComplete({
        imageUrl: finalImageUrl,
        model3dUrl: uploadedModelUrl || undefined,
        dimensions: dimensionsData,
        displayMedia,
      });

      toast.success("Presentación visual y dimensiones actualizadas");
      onClose();
    } catch (err: any) {
      toast.error(
        "Error al guardar datos de escaneo: " +
          (err.message || "Error desconocido"),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-150 transition-colors duration-200 flex items-center justify-center ${
        isFocusMode
          ? "bg-black/98 p-0"
          : "bg-black/90 backdrop-blur-md p-0 sm:p-4"
      }`}
    >
      <div
        className={`bg-card flex flex-col min-h-0 overflow-hidden shadow-2xl transition-all duration-200 ${
          isFocusMode
            ? "w-full h-full rounded-none border-0"
            : "border-0 sm:border border-border/80 w-full max-w-4xl h-full sm:h-auto sm:max-h-[92vh] max-h-dvh rounded-none sm:rounded-3xl"
        }`}
      >
        {/* Header with Focus Mode Switcher */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3.5 border-b border-border/70 shrink-0 flex items-center justify-between bg-muted/40 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-8 sm:size-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center ring-1 ring-primary/20 shrink-0">
              <Camera className="size-4 sm:size-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-black text-foreground tracking-tight flex items-center gap-2 truncate">
                <span>Asistente de Captura 3D & Encuadre</span>
                <Badge
                  variant="outline"
                  className="hidden md:inline-flex text-[9px] font-bold border-primary/40 text-primary"
                >
                  {isFocusMode ? "Modo Foco" : "Modo Estándar"}
                </Badge>
              </h2>
              <p className="text-[11px] text-muted-foreground truncate">
                Plato:{" "}
                <strong className="text-foreground">
                  {productName || "Nuevo Plato"}
                </strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Toggle Modo Foco (UX/UI 4) */}
            <Button
              type="button"
              variant={isFocusMode ? "secondary" : "outline"}
              size="sm"
              onClick={() => setIsFocusMode(!isFocusMode)}
              className="h-7 sm:h-8 px-2 sm:px-3 rounded-xl text-[11px] font-bold gap-1.5 cursor-pointer shadow-xs"
              title={
                isFocusMode
                  ? "Volver a vista estándar"
                  : "Activar modo foco para mayor concentración"
              }
            >
              <Focus className="size-3.5 text-primary" />
              <span className="hidden sm:inline">
                {isFocusMode ? "Modo Normal" : "Modo Foco"}
              </span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="size-8 rounded-xl text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Step Indicator Bar */}
        <div className="px-3 sm:px-6 py-2 border-b border-border/60 bg-muted/20 shrink-0 flex items-center justify-between gap-1 overflow-x-auto touch-pan-x custom-scrollbar z-10">
          {[
            { label: "1. Frontal (0°)", idx: 0 },
            { label: "2. Ángulo 45°", idx: 1 },
            { label: "3. Cenital (90°)", idx: 2 },
            { label: "4. Medidas", idx: 3 },
            { label: "5. Previsualización", idx: 4 },
          ].map((st) => {
            const isDone =
              st.idx < currentStepIndex ||
              (st.idx < 3 && Boolean(capturedFrames[st.idx]));
            const isCurrent = st.idx === currentStepIndex;

            return (
              <button
                key={st.idx}
                type="button"
                onClick={() => {
                  setAdjustingImage(null);
                  setCurrentStepIndex(st.idx);
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isCurrent
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : isDone
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
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

        {/* Mobile Device Recommendation Notice (Shown only if not in focus mode) */}
        {!isFocusMode && isDesktopBrowser && showDesktopMobileNotice && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-3 text-amber-950 dark:text-amber-100 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <div className="size-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Smartphone className="size-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-amber-900 dark:text-amber-200">
                  💡 Tip: Puedes escanear con tu celular o subir fotos de tu PC
                </h4>
                <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                  En PC puedes seleccionar archivos existentes y usar la
                  herramienta de alineación interactiva (zoom, giro y encuadre).
                </p>
                <div className="pt-1 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    className="h-6 px-2 rounded-lg text-[10px] font-bold border-amber-500/40 text-amber-800 dark:text-amber-200 hover:bg-amber-500/20 gap-1 cursor-pointer"
                  >
                    <Copy className="size-3" />
                    <span>Copiar enlace</span>
                  </Button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowDesktopMobileNotice(false)}
              className="size-6 rounded-lg text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 flex items-center justify-center shrink-0 cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 sm:p-5 custom-scrollbar touch-pan-y flex flex-col justify-between">
          {currentStepIndex < 3 ? (
            /* CAPTURE & ALIGNMENT STEPS (0, 1, 2) */
            <div className="space-y-3 flex-1 flex flex-col justify-between">
              {/* Optional Step Header in Non-Focus Mode */}
              {!isFocusMode && (
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-3 flex items-start justify-between gap-2 shrink-0">
                  <div className="flex items-start gap-2.5">
                    <div className="size-7 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="size-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-foreground">
                        {SCAN_STEPS[currentStepIndex].title}
                      </h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {SCAN_STEPS[currentStepIndex].tip}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPoseIllustration((prev) => !prev)}
                    className="h-7 px-2 rounded-lg text-[10px] font-bold border-primary/30 text-primary shrink-0 cursor-pointer"
                  >
                    <span>
                      {showPoseIllustration ? "Ocultar Postura" : "Ver Postura"}
                    </span>
                  </Button>
                </div>
              )}

              {showPoseIllustration && !isFocusMode && (
                <div className="animate-in fade-in duration-200 shrink-0">
                  <ScanPoseIllustration step={currentStepIndex} />
                </div>
              )}

              {/* Viewfinder / Interactive Alignment Canvas Frame */}
              <div
                className={`relative w-full rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center border border-border/80 bg-black ${
                  isFocusMode
                    ? "flex-1 min-h-90"
                    : "aspect-4/3 sm:aspect-video min-h-75 sm:min-h-95 max-h-125"
                }`}
              >
                {adjustingImage ? (
                  /* UX/UI 5: INTERACTIVE ALIGNMENT / MANIPULATION CANVAS */
                  <div
                    className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-move select-none"
                    onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
                    onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
                    onMouseUp={handlePointerUp}
                    onTouchStart={(e) => {
                      if (e.touches[0])
                        handlePointerDown(
                          e.touches[0].clientX,
                          e.touches[0].clientY,
                        );
                    }}
                    onTouchMove={(e) => {
                      if (e.touches[0])
                        handlePointerMove(
                          e.touches[0].clientX,
                          e.touches[0].clientY,
                        );
                    }}
                    onTouchEnd={handlePointerUp}
                    onWheel={(e) => {
                      e.preventDefault();
                      const delta = e.deltaY > 0 ? -0.05 : 0.05;
                      setAdjustScale((s) =>
                        Math.min(3.0, Math.max(0.5, +(s + delta).toFixed(2))),
                      );
                    }}
                  >
                    {/* Transformed Image Preview */}
                    <img
                      src={adjustingImage}
                      alt="Encuadre"
                      draggable={false}
                      style={{
                        transform: `translate(${adjustPan.x}px, ${adjustPan.y}px) rotate(${adjustRotation}deg) scale(${adjustScale})`,
                        transformOrigin: "center center",
                        transition: isDraggingCanvas
                          ? "none"
                          : "transform 0.05s ease-out",
                      }}
                      className="max-w-none max-h-[90%] object-contain pointer-events-none select-none drop-shadow-2xl"
                    />

                    {/* Geometrically Undistorted Alignment Guide */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <AlignmentGuide step={currentStepIndex} />
                    </div>

                    {/* Top status overlay */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <Badge className="bg-black/80 backdrop-blur-md text-white border-white/20 font-bold text-[10px] px-2.5 py-1">
                        🎯 Arrastra, gira o ajusta el zoom para calzar con la
                        silueta
                      </Badge>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setAdjustScale(1.0);
                          setAdjustRotation(0);
                          setAdjustPan({ x: 0, y: 0 });
                        }}
                        className="pointer-events-auto h-7 px-2 text-[10px] rounded-lg bg-black/75 text-white border border-white/20 hover:bg-black/90 cursor-pointer"
                      >
                        Restablecer
                      </Button>
                    </div>

                    {/* Bottom floating toolbar for manipulation */}
                    <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 p-2 bg-black/85 backdrop-blur-md rounded-2xl border border-white/20 pointer-events-auto shadow-2xl">
                      {/* Zoom Controls */}
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setAdjustScale((s) =>
                              Math.max(0.5, +(s - 0.1).toFixed(2)),
                            )
                          }
                          className="size-7 rounded-lg text-white hover:bg-white/20"
                          title="Reducir zoom"
                        >
                          <ZoomOut className="size-3.5" />
                        </Button>
                        <span className="text-[10px] font-mono text-white/90 min-w-8 text-center font-bold">
                          {Math.round(adjustScale * 100)}%
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setAdjustScale((s) =>
                              Math.min(3.0, +(s + 0.1).toFixed(2)),
                            )
                          }
                          className="size-7 rounded-lg text-white hover:bg-white/20"
                          title="Aumentar zoom"
                        >
                          <ZoomIn className="size-3.5" />
                        </Button>
                      </div>

                      {/* Rotation Controls */}
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setAdjustRotation((r) => r - 90)}
                          className="size-7 rounded-lg text-white hover:bg-white/20"
                          title="Girar 90° izquierda"
                        >
                          <RotateCcw className="size-3.5" />
                        </Button>
                        <span className="text-[10px] font-mono text-white/90 min-w-10 text-center font-bold">
                          {adjustRotation}°
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setAdjustRotation((r) => r + 90)}
                          className="size-7 rounded-lg text-white hover:bg-white/20"
                          title="Girar 90° derecha"
                        >
                          <RotateCw className="size-3.5" />
                        </Button>
                      </div>

                      {/* Confirm / Cancel Actions */}
                      <div className="flex items-center gap-1.5 ml-auto">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelAdjust}
                          className="h-7 px-2.5 rounded-lg text-white/70 hover:text-white hover:bg-white/15 text-[11px] font-bold cursor-pointer"
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleConfirmAdjust}
                          className="h-7 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold gap-1 shadow-md cursor-pointer"
                        >
                          <Check className="size-3.5" />
                          <span>Confirmar Encuadre</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : cameraError ? (
                  /* Camera Error Fallback */
                  <div className="p-6 text-center space-y-3 max-w-sm">
                    <AlertCircle className="size-10 text-destructive mx-auto" />
                    <p className="text-xs text-muted-foreground">
                      {cameraError}
                    </p>
                    <div className="flex justify-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={startCamera}
                        className="text-xs font-bold"
                      >
                        <RefreshCw className="size-3.5 mr-1.5" /> Reintentar
                        cámara
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
                  /* Live Camera Viewfinder with Undistorted Guide */
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
                              isCameraActive
                                ? "bg-emerald-400 animate-pulse"
                                : "bg-amber-400"
                            }`}
                          />
                          <span>{SCAN_STEPS[currentStepIndex].subtitle}</span>
                        </div>

                        <div className="flex items-center gap-1.5 pointer-events-auto">
                          {capturedFrames[currentStepIndex] && (
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                handleStartAdjustingExistingFrame(
                                  currentStepIndex,
                                )
                              }
                              className="h-7 px-2.5 rounded-full bg-black/75 hover:bg-black/90 text-white text-[10px] font-bold backdrop-blur-md border border-white/25 shadow-md flex items-center gap-1 cursor-pointer"
                              title="Reencuadrar o rotar la toma guardada"
                            >
                              <SlidersHorizontal className="size-3" />
                              <span>Reencuadrar</span>
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Center Undistorted Geometric Reticle */}
                      <AlignmentGuide step={currentStepIndex} />

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

              {/* Shutter Capture Button (when camera is live) */}
              {!adjustingImage && (
                <div className="flex items-center justify-center shrink-0 py-1">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="size-16 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center shadow-xl ring-4 ring-primary/30 transition-transform active:scale-90 cursor-pointer"
                    title="Capturar foto"
                  >
                    <Camera className="size-7" />
                  </button>
                </div>
              )}

              {/* Mini Gallery of Captured Steps with Adjust Actions */}
              {capturedFrames.length > 0 && !adjustingImage && (
                <div className="pt-2 border-t border-border/60 shrink-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-foreground">
                      Tomas Registradas:
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Haz clic en cualquier toma para reencuadrarla
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {[0, 1, 2].map((idx) => {
                      const img = capturedFrames[idx];
                      return (
                        <div
                          key={idx}
                          onClick={() =>
                            img && handleStartAdjustingExistingFrame(idx)
                          }
                          className={`relative aspect-video rounded-xl overflow-hidden border transition-all ${
                            img
                              ? "border-primary/50 bg-muted cursor-pointer hover:ring-2 hover:ring-primary/40"
                              : "border-border/60 bg-muted/30 cursor-default"
                          } flex items-center justify-center`}
                        >
                          {img ? (
                            <>
                              <img
                                src={img}
                                alt={`Toma ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-white">
                                {idx === 0
                                  ? "Frontal"
                                  : idx === 1
                                    ? "45°"
                                    : "Cenital"}
                              </span>
                              <span className="absolute top-1 right-1 size-5 rounded-full bg-black/60 text-white flex items-center justify-center">
                                <SlidersHorizontal className="size-2.5" />
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
            <div className="space-y-5 max-w-xl mx-auto py-2 flex-1">
              <div className="text-center space-y-1">
                <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2 ring-1 ring-primary/20">
                  <Ruler className="size-5" />
                </div>
                <h3 className="text-base font-black text-foreground">
                  Dimensiones Físicas y Porción del Plato
                </h3>
                <p className="text-xs text-muted-foreground">
                  Estas medidas permitirán calcular la escala real en 3D y
                  Realidad Aumentada.
                </p>
              </div>

              {/* Illustrated Dimensions Guide */}
              <ScanPoseIllustration step={3} className="max-w-md mx-auto" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-muted/20 p-4 rounded-2xl border border-border/80">
                <div className="space-y-1.5">
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
                      className="h-9 pr-12 rounded-xl text-sm font-bold bg-background"
                    />
                    <button
                      type="button"
                      onClick={() => setUnit(unit === "cm" ? "in" : "cm")}
                      title="Cambiar unidad (cm / in)"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-primary hover:underline cursor-pointer"
                    >
                      {unit}
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Diámetro exterior de vajilla (típico: 22 - 30 cm)
                  </p>
                </div>

                <div className="space-y-1.5">
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
                      className="h-9 pr-12 rounded-xl text-sm font-bold bg-background"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                      {unit}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Altura de emplatado o borde (típico: 4 - 12 cm)
                  </p>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-bold text-foreground">
                    Porción / Peso Estimado
                  </Label>
                  <Input
                    type="text"
                    value={portion}
                    onChange={(e) => setPortion(e.target.value)}
                    placeholder="Ej. 400g • Apto para compartir"
                    className="h-9 rounded-xl text-sm font-semibold bg-background"
                  />
                </div>
              </div>

              {/* Optional 3D Model File Upload (.glb) */}
              <div className="p-3.5 rounded-2xl border border-dashed border-border/80 bg-muted/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Rotate3d className="size-4 text-primary" />
                      <span>Archivo de Modelo 3D (.glb / .gltf)</span>
                    </h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {uploadedModelUrl
                        ? "Modelo 3D vinculado correctamente."
                        : "Opcional: Si posees un archivo 3D .glb, súbelo aquí."}
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => modelFileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="text-xs font-bold rounded-xl h-8"
                  >
                    <Upload className="size-3 mr-1" />
                    <span>
                      {uploadedModelUrl ? "Reemplazar .glb" : "Subir .glb"}
                    </span>
                  </Button>
                </div>

                {uploadedModelUrl && (
                  <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs">
                    <span className="font-mono text-primary truncate max-w-sm text-[11px]">
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
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">
                  Modo de Presentación en Carta / POS
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      id: "image",
                      label: "Solo Foto 2D",
                      desc: "Rápido tradicional",
                    },
                    {
                      id: "model3d",
                      label: "Solo 3D",
                      desc: "Interactivo y escala",
                    },
                    {
                      id: "both",
                      label: "Ambos (Recomendado)",
                      desc: "Conmutador foto y 3D",
                    },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() =>
                        setDisplayMedia(opt.id as DisplayMediaType)
                      }
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        displayMedia === opt.id
                          ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                          : "border-border/70 bg-card hover:bg-muted/40"
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
            /* STEP 5: FINAL PREVIEW & NON-INVASIVE DIMENSIONS ADJUSTMENT */
            <div className="space-y-3.5 max-w-2xl mx-auto w-full flex-1 flex flex-col justify-between">
              <div className="text-center space-y-0.5 shrink-0">
                <h3 className="text-base font-black text-foreground">
                  Previsualización de Presentación 3D
                </h3>
                <p className="text-xs text-muted-foreground">
                  Verifica cómo interactuarán los clientes con la rotación y
                  dimensiones del plato.
                </p>
              </div>

              <div className="h-75 sm:h-85 w-full rounded-2xl overflow-hidden shadow-md shrink-0">
                <Product3dViewer
                  name={productName}
                  modelUrl={uploadedModelUrl}
                  imageUrl={
                    capturedFrames[1] || capturedFrames[0] || currentImageUrl
                  }
                  multiAngleImages={capturedFrames.filter(Boolean)}
                  dimensions={{
                    diameter: diameter ? parseFloat(diameter) : undefined,
                    height: height ? parseFloat(height) : undefined,
                    unit: unit || "cm",
                    portion: portion || undefined,
                  }}
                  showDimensionsDefault={true}
                  autoRotate={true}
                />
              </div>

              {/* Status pill & Discrete Dimensions Toggle (UX/UI 6) */}
              <div className="bg-muted/30 p-3 rounded-2xl border border-border/70 flex items-center justify-between gap-2 text-xs shrink-0 flex-wrap">
                <div className="space-y-0.5">
                  <span className="font-bold text-foreground block">
                    Configuración Lista
                  </span>
                  <span className="text-muted-foreground text-[11px] block">
                    Modo:{" "}
                    {displayMedia === "both"
                      ? "Foto + 3D"
                      : displayMedia === "model3d"
                        ? "Solo 3D"
                        : "Solo Foto"}{" "}
                    • {diameter}x{height} {unit}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowInlineDimensionsEdit((prev) => !prev)}
                    className="h-7 px-2.5 rounded-xl text-xs font-bold gap-1 cursor-pointer"
                  >
                    <Ruler className="size-3 text-primary" />
                    <span>
                      {showInlineDimensionsEdit
                        ? "Ocultar Medidas"
                        : "Modificar Dimensiones"}
                    </span>
                  </Button>

                  <Badge
                    variant="outline"
                    className="text-emerald-600 border-emerald-500/30"
                  >
                    Listo para Guardar
                  </Badge>
                </div>
              </div>

              {/* Inline Collapsible Dimensions Edit (UX/UI 6) */}
              {showInlineDimensionsEdit && (
                <div className="p-3.5 bg-card rounded-2xl border border-border/80 space-y-3 animate-in fade-in slide-in-from-top-1 shrink-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Ruler className="size-3.5 text-primary" />
                      <span>Ajuste Rápido de Medidas Físicas</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowInlineDimensionsEdit(false)}
                      className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      Cerrar
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <Label className="text-[10px] font-semibold text-muted-foreground block mb-1">
                        Diámetro ({unit})
                      </Label>
                      <Input
                        type="number"
                        step="0.5"
                        value={diameter}
                        onChange={(e) => setDiameter(e.target.value)}
                        className="h-8 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] font-semibold text-muted-foreground block mb-1">
                        Altura ({unit})
                      </Label>
                      <Input
                        type="number"
                        step="0.5"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="h-8 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] font-semibold text-muted-foreground block mb-1">
                        Porción
                      </Label>
                      <Input
                        type="text"
                        value={portion}
                        onChange={(e) => setPortion(e.target.value)}
                        className="h-8 text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3.5 border-t border-border/70 bg-muted/25 shrink-0 flex items-center justify-between z-20">
          <div>
            {currentStepIndex > 0 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setAdjustingImage(null);
                  setCurrentStepIndex(currentStepIndex - 1);
                }}
                className="rounded-xl text-xs font-semibold h-8"
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
                onClick={() => {
                  setAdjustingImage(null);
                  if (currentStepIndex === 2) {
                    advanceAfterStep2();
                  } else {
                    setCurrentStepIndex(currentStepIndex + 1);
                  }
                }}
                className="rounded-xl text-xs font-bold bg-primary text-primary-foreground shadow-xs cursor-pointer h-8"
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
                className="rounded-xl text-xs font-bold bg-primary text-primary-foreground shadow-xs cursor-pointer px-5 h-8"
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
    document.body,
  );
};

export default Product3dScannerModal;
