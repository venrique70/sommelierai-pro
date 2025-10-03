"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, FileText, Image as ImageIcon, Loader2, Sparkles, Star, Zap } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { analyzeWineDescription, AnalyzeWineDescriptionOutput } from "@/ai/flows/analyze-wine-description";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// ⬇️ i18n mínimo
import { useLang } from "@/lib/use-lang";
import { translations } from "@/lib/translations";

function StarRating({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-5",
            i < Math.round(rating)
              ? "text-yellow-400 fill-yellow-400"
              : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
}

export default function CataSheetPage() {
  const lang = useLang("es");
  const t = translations[lang];

  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalyzeWineDescriptionOutput | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  
  // NUEVO: manejo de cámaras
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [usingRear, setUsingRear] = useState(true); // trasera por defecto

  async function openCamera(opts?: { deviceId?: string; rearPreferred?: boolean }) {
    const constraints: MediaStreamConstraints = opts?.deviceId
      ? { video: { deviceId: { exact: opts.deviceId } } }
      : {
          video: {
            facingMode: { ideal: opts?.rearPreferred === false ? "user" : "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    if (videoRef.current) (videoRef.current as any).srcObject = stream;
    return stream;
  }

  async function listCameras() {
    const all = await navigator.mediaDevices.enumerateDevices();
    const cams = all.filter((d) => d.kind === "videoinput");
    setDevices(cams);
    const rear = cams.find((d) => /back|rear|environment/i.test(d.label));
    setSelectedId((prev) => prev ?? rear?.deviceId ?? cams[0]?.deviceId ?? null);
  }

  useEffect(() => {
    const init = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        console.error("Camera API not supported in this browser.");
        setHasCameraPermission(false);
        return;
      }
      try {
        await openCamera({ rearPreferred: true }); // abre trasera por defecto
        await listCameras();                       // lista opciones
        setHasCameraPermission(true);
      } catch (error) {
        console.error("Error accessing camera:", error);
        setHasCameraPermission(false);
        toast({
          variant: "destructive",
          title: lang === "es" ? "Acceso a la cámara denegado" : "Camera access denied",
          description:
            lang === "es"
              ? "Activa los permisos de la cámara en tu navegador para usar esta función."
              : "Please enable camera permissions in your browser to use this feature.",
        });
      }
    };

    init();

    // Cleanup
    return () => {
      const stream = (videoRef.current as any)?.srcObject as MediaStream | undefined;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [toast, lang]);

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Downscale: máx 1280px de ancho
    const maxW = 1280;
    const scale = Math.min(1, maxW / (video.videoWidth || maxW));
    const w = Math.round((video.videoWidth || maxW) * scale);
    const h = Math.round((video.videoHeight || Math.round(maxW * 4/3)) * scale);

    canvas.width = w;
    canvas.height = h;

    // Mejora de lectura (OCR)
    ctx.filter = 'contrast(135%) brightness(112%) saturate(110%)';
    ctx.drawImage(video, 0, 0, w, h);

    // ROI más generoso (centrado): 76% del ancho × 84% del alto
    const roi = {
      sx: Math.round(w * 0.12),
      sy: Math.round(h * 0.08),
      sw: Math.round(w * 0.76),
      sh: Math.round(h * 0.84),
    };

    const tmp = document.createElement('canvas');
    tmp.width = roi.sw;
    tmp.height = roi.sh;
    const tctx = tmp.getContext('2d')!;
    tctx.filter = 'contrast(135%) brightness(112%) saturate(110%)';
    tctx.drawImage(canvas, roi.sx, roi.sy, roi.sw, roi.sh, 0, 0, roi.sw, roi.sh);

    const dataUrl = tmp.toDataURL("image/jpeg", 0.85);

    // Control de tamaño
    const comma = dataUrl.indexOf(",");
    const approxBytes = comma > -1 ? Math.ceil((dataUrl.length - (comma + 1)) * 0.75) : dataUrl.length;
    if (approxBytes > 2_500_000) {
      toast({ title: "Imagen muy grande", description: "Acércate y vuelve a capturar.", variant: "destructive" });
      return;
    }

    setImage(dataUrl);
  };

  const switchCamera = async () => {
    try {
      const current = (videoRef.current as any)?.srcObject as MediaStream | undefined;
      current?.getTracks().forEach(t => t.stop());

      const target = usingRear
        ? devices.find(d => /front|user/i.test(d.label)) || devices.find(d => d.deviceId !== selectedId!)
        : devices.find(d => /back|rear|environment/i.test(d.label)) || devices.find(d => d.deviceId !== selectedId!);

      if (target?.deviceId) {
        await openCamera({ deviceId: target.deviceId });
        setSelectedId(target.deviceId);
      } else {
        await openCamera({ rearPreferred: !usingRear });
      }

      setUsingRear(prev => !prev);
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: lang === "es" ? "No se pudo cambiar de cámara" : "Could not switch camera",
        description: lang === "es" ? "Revisa permisos o conecta otra cámara." : "Check permissions or connect another camera.",
      });
    }
  };

  const handleAnalyze = async () => {
    if (!image) {
      toast({
        title: lang === "es" ? "Error" : "Error",
        description: lang === "es" ? "No hay imagen para analizar." : "No image to analyze.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    setAnalysis(null);
    try {
      const result = await analyzeWineDescription({ photoDataUri: image });
      setAnalysis(result);
    } catch (error) {
      console.error("Failed to generate analysis:", error);
      toast({
        title: lang === "es" ? "Error de Análisis" : "Analysis Error",
        description: lang === "es" ? "No se pudo analizar la imagen." : "Could not analyze the image.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetake = () => {
    setImage(null);
    setAnalysis(null);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          {lang === "es" ? "Análisis de Ficha de Cata por Foto" : "Photo Tasting-Sheet Analysis"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {lang === "es"
            ? "Toma una foto de la descripción o ficha de cata de un vino (etiqueta, revista o pantalla) y deja que la IA la analice por ti."
            : "Take a photo of a wine’s description or tasting sheet (label, magazine or screen) and let AI analyze it for you."}
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              {lang === "es" ? "Capturar Ficha de Cata" : "Capture Tasting Sheet"}
            </CardTitle>
            <CardDescription>
              {lang === "es"
                ? "Apunta con tu cámara a la descripción del vino."
                : "Aim your camera at the wine description."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <canvas ref={canvasRef} style={{ display: "none" }} />
            {image ? (
              <div className="relative rounded-lg" style={{ aspectRatio: '3 / 4' }}>
                {/* Nota: layout/objectFit son legacy; mantenemos para no tocar lógica */}
                <Image
                  src={image}
                  alt={lang === "es" ? "Imagen capturada" : "Captured image"}
                  layout="fill"
                  objectFit="contain"
                  className="rounded-lg"
                />
              </div>
            ) : (
              <>
                <div className="relative bg-muted rounded-lg overflow-hidden" style={{ aspectRatio: '3 / 4' }}>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    style={usingRear ? undefined : { transform: "scaleX(-1)" }}  // espejo solo en frontal
                    autoPlay
                    muted
                    playsInline
                    />
                  {/* Guía visual de encuadre */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="border-2 border-white/70 rounded-md w-[60%] h-[85%]" />
                  </div>
                  {hasCameraPermission === false && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-black/50 p-4">
                      <Camera className="size-12 text-destructive mb-4" />
                      <p className="text-destructive-foreground font-semibold">
                        {lang === "es" ? "Cámara no disponible" : "Camera not available"}
                      </p>
                      <p className="text-destructive-foreground/80 text-sm">
                        {lang === "es" ? "Revisa los permisos de tu navegador." : "Check your browser permissions."}
                      </p>
                    </div>
                  )}
                </div>
                {hasCameraPermission === false && (
                  <Alert variant="destructive">
                    <AlertTitle>
                      {lang === "es" ? "Se requiere acceso a la cámara" : "Camera access required"}
                    </AlertTitle>
                    <AlertDescription>
                      {lang === "es"
                        ? "Por favor, permite el acceso a la cámara para usar esta función."
                        : "Please allow camera access to use this feature."}
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}

            <div className="flex justify-center gap-4">
              {image ? (
                <>
                  <Button onClick={handleRetake} variant="outline" size="lg">
                    <Camera className="mr-2" /> {lang === "es" ? "Volver a Tomar" : "Retake"}
                  </Button>
                  <Button onClick={handleAnalyze} disabled={loading} size="lg">
                    {loading ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />}
                    {loading ? (lang === "es" ? "Analizando..." : "Analyzing...") : (lang === "es" ? "Analizar Foto" : "Analyze Photo")}
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={captureImage} disabled={!hasCameraPermission} size="lg">
                    <Zap className="mr-2" /> {lang === "es" ? "Capturar Imagen" : "Capture Image"}
                  </Button>
                  <Button
                    onClick={switchCamera}
                    variant="secondary"
                    disabled={!hasCameraPermission || devices.length < 2}
                    size="lg"
                  >
                    {lang === "es" ? "Cambiar cámara" : "Switch camera"}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{lang === "es" ? "Análisis del Sommelier IA" : "AI Sommelier Analysis"}</CardTitle>
            <CardDescription>
              {lang === "es"
                ? "Análisis experto basado en el texto extraído de la imagen."
                : "Expert analysis based on the text extracted from the image."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading && (
              <div className="space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-24 w-full" />
              </div>
            )}

            {analysis && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-primary">{analysis.nombreVino}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={analysis.calificacion} />
                    <span className="text-sm text-muted-foreground">
                      {lang === "es"
                        ? `(${analysis.calificacion} de 5)`
                        : `(${analysis.calificacion} / 5)`}
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">
                    {lang === "es" ? "Análisis Experto" : "Expert Analysis"}
                  </h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">{analysis.analisisExperto}</p>
                </div>
              </div>
            )}

            {!loading && !analysis && (
              <div className="flex flex-col items-center justify-center text-center text-muted-foreground border-2 rounded-lg p-6" style={{ aspectRatio: '3 / 4' }}>
                <FileText className="size-12 mb-2" />
                <p>{lang === "es" ? "El análisis de la ficha aparecerá aquí." : "The tasting-sheet analysis will appear here."}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
