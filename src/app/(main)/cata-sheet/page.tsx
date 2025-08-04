
"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, FileText, Image as ImageIcon, Loader2, Sparkles, Star, Zap } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { analyzeWineDescription, AnalyzeWineDescriptionOutput } from "@/ai/flows/analyze-wine-description";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


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
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalyzeWineDescriptionOutput | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        console.error("Camera API not supported in this browser.");
        setHasCameraPermission(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCameraPermission(true);
      } catch (error) {
        console.error("Error accessing camera:", error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Acceso a la cámara denegado',
          description: 'Por favor, activa los permisos de la cámara en tu navegador para usar esta función.',
        });
      }
    };

    getCameraPermission();

    return () => {
      // Cleanup: stop video streams when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImage(dataUrl);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!image) {
      toast({ title: "Error", description: "No hay imagen para analizar.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setAnalysis(null);
    try {
      const result = await analyzeWineDescription({ photoDataUri: image });
      setAnalysis(result);
    } catch (error) {
      console.error("Failed to generate analysis:", error);
      toast({ title: "Error de Análisis", description: "No se pudo analizar la imagen.", variant: "destructive" });
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
        <h1 className="text-3xl font-bold tracking-tight text-primary">Análisis de Ficha de Cata por Foto</h1>
        <p className="text-muted-foreground mt-2">
          Toma una foto de la descripción o ficha de cata de un vino (desde una etiqueta, revista o pantalla) y deja que la IA la analice por ti.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Capturar Ficha de Cata</CardTitle>
            <CardDescription>Apunta con tu cámara a la descripción del vino.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <canvas ref={canvasRef} style={{ display: 'none' }} />
            {image ? (
                <div className="relative aspect-video">
                    <Image src={image} alt="Captured wine label" layout="fill" objectFit="contain" className="rounded-lg"/>
                </div>
            ) : (
                <>
                    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                       <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                       {hasCameraPermission === false && (
                         <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-black/50 p-4">
                            <Camera className="size-12 text-destructive mb-4" />
                            <p className="text-destructive-foreground font-semibold">Cámara no disponible</p>
                            <p className="text-destructive-foreground/80 text-sm">Revisa los permisos de tu navegador.</p>
                         </div>
                       )}
                    </div>
                     {hasCameraPermission === false && (
                        <Alert variant="destructive">
                            <AlertTitle>Se requiere acceso a la cámara</AlertTitle>
                            <AlertDescription>
                                Por favor, permite el acceso a la cámara para usar esta función.
                            </AlertDescription>
                        </Alert>
                    )}
                </>
            )}

            <div className="flex justify-center gap-4">
                {image ? (
                    <>
                        <Button onClick={handleRetake} variant="outline" size="lg"> <Camera className="mr-2"/> Volver a Tomar</Button>
                        <Button onClick={handleAnalyze} disabled={loading} size="lg">
                            {loading ? <Loader2 className="mr-2 animate-spin"/> : <Sparkles className="mr-2"/>}
                            {loading ? "Analizando..." : "Analizar Foto"}
                        </Button>
                    </>
                ) : (
                    <Button onClick={captureImage} disabled={!hasCameraPermission} size="lg">
                        <Zap className="mr-2"/> Capturar Imagen
                    </Button>
                )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Análisis del Sommelier IA</CardTitle>
            <CardDescription>El análisis experto basado en el texto extraído de la imagen.</CardDescription>
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
                     <span className="text-sm text-muted-foreground">({analysis.calificacion} de 5)</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Análisis Experto</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">{analysis.analisisExperto}</p>
                </div>
              </div>
            )}
            {!loading && !analysis && (
              <div className="flex flex-col items-center justify-center text-center text-muted-foreground aspect-video border-2 border-dashed rounded-lg p-6">
                <FileText className="size-12 mb-2" />
                <p>El análisis de la ficha aparecerá aquí.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
