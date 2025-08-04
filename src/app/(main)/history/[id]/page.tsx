
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getAnalysisDetail, GetAnalysisDetailOutput } from "@/ai/flows/get-analysis-detail";
import { Award, Building, Calendar, GlassWater, Leaf, Star, ThumbsDown, ThumbsUp, Utensils, Wine, MapPin, Edit } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, FileText, History, Info, ImageIcon } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PairingList } from "@/components/features/PairingList";
import type { WineAnalysis, Correction } from "@/types";

function StarRating({ rating, className }: { rating: number | undefined; className?: string }) {
    if (!rating) return null;
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

const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number | undefined | null }) => {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3">
            <Icon className="size-5 text-primary flex-shrink-0 mt-1" />
            <div>
                <p className="font-semibold text-muted-foreground">{label}</p>
                <p className="text-foreground whitespace-pre-line">{value}</p>
            </div>
        </div>
    )
}

const Corrections = ({ corrections, notes }: { corrections?: Correction[], notes?: string }) => {
    if (!corrections?.length && !notes) return null;
    return (
      <Alert variant="default" className="border-primary/30 bg-primary/10">
        <Edit className="h-4 w-4 text-primary" />
        <AlertTitle className="text-primary">Nota del Sommelier IA</AlertTitle>
        <AlertDescription>
          {notes && <p className="mb-2">{notes}</p>}
          {corrections && corrections.length > 0 && (
            <ul className="list-disc pl-4 text-sm space-y-1">
              {corrections.map((c, i) => (
                <li key={i}>
                  Se corrigió <strong>{c.field}</strong> de "{c.original}" a "<strong>{c.corrected}</strong>".
                </li>
              ))}
            </ul>
          )}
        </AlertDescription>
      </Alert>
    );
};


export default function AnalysisDetailPage({ params }: { params: { id: string } }) {
    const [analysis, setAnalysis] = useState<WineAnalysis | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user, loading: authLoading } = useAuth();

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            setError("Debes iniciar sesión para ver el historial.");
            setLoading(false);
            return;
        }

        const fetchAnalysis = async () => {
            try {
                const result = await getAnalysisDetail({ analysisId: params.id, uid: user.uid });
                if ('error' in result) {
                    setError(result.error);
                } else {
                    setAnalysis(result as WineAnalysis);
                }
            } catch (e: any) {
                setError(e.message || "Ocurrió un error inesperado al cargar el análisis.");
            } finally {
                setLoading(false);
            }
        };

        fetchAnalysis();
    }, [params.id, user, authLoading]);

    if (loading) {
        return <div className="space-y-6">
            <Skeleton className="h-12 w-2/3" />
            <Skeleton className="h-8 w-1/3" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
            <Skeleton className="h-48 w-full" />
        </div>;
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }
    
    if (!analysis) {
        return <p>No se encontró el análisis.</p>;
    }

    if (!analysis.analysis) {
        return (
            <div className="space-y-8 max-w-4xl mx-auto">
                 <Card className="text-center p-8">
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold">{analysis.wineName} {analysis.year}</CardTitle>
                        <CardDescription className="mt-2 text-lg">
                            Análisis Incompleto
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="mt-4 text-left space-y-4">
                       <p className="text-center text-muted-foreground">La IA no pudo generar un análisis sensorial detallado en esta ocasión, pero aquí está la conclusión del sommelier.</p>
                       <Corrections corrections={analysis.corrections} notes={analysis.notes} />
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div>
                 <Badge variant="secondary" className="w-fit mb-2 bg-green-500/20 text-green-300">{analysis.isAiGenerated ? "Análisis Genérico" : "Análisis Verificado"}</Badge>
                <h1 className="text-4xl font-bold tracking-tight text-primary">{analysis.wineName}</h1>
                <p className="text-xl text-muted-foreground mt-1">{analysis.analysis?.grapeVariety} - {analysis.year}</p>
                 <div className="text-lg flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 text-muted-foreground">
                    <span className="flex items-center gap-2"><Building className="size-4" />{analysis.wineryName}</span>
                    <span className="flex items-center gap-2"><MapPin className="size-4" />{analysis.analysis.wineryLocation}, {analysis.country}</span>
                </div>
            </div>
            
             <Corrections corrections={analysis.corrections} notes={analysis.notes} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="flex flex-col"><CardHeader><CardTitle className="flex items-center gap-2"><Wine className="size-6" /> Fase Visual</CardTitle></CardHeader><CardContent className="flex-grow flex flex-col gap-4">{analysis.analysis.visual?.imageUrl ? (<Image src={analysis.analysis.visual.imageUrl} alt="Análisis Visual" width={512} height={512} className="rounded-lg object-cover aspect-square w-full" data-ai-hint="wine glass" />) : <div className="bg-muted rounded-lg aspect-square w-full flex items-center justify-center"><ImageIcon className="size-16 text-muted-foreground" /></div>}<p className="text-muted-foreground">{analysis.analysis.visual?.description}</p></CardContent></Card>
                <Card className="flex flex-col"><CardHeader><CardTitle className="flex items-center gap-2"><Leaf className="size-6" /> Fase Olfativa</CardTitle></CardHeader><CardContent className="flex-grow flex flex-col gap-4">{analysis.analysis.olfactory?.imageUrl ? (<Image src={analysis.analysis.olfactory.imageUrl} alt="Análisis Olfativo" width={512} height={512} className="rounded-lg object-cover aspect-square w-full" data-ai-hint="abstract aroma" />) : <div className="bg-muted rounded-lg aspect-square w-full flex items-center justify-center"><ImageIcon className="size-16 text-muted-foreground" /></div>}<p className="text-muted-foreground">{analysis.analysis.olfactory?.description}</p></CardContent></Card>
                <Card className="flex flex-col"><CardHeader><CardTitle className="flex items-center gap-2"><Utensils className="size-6" /> Fase Gustativa</CardTitle></CardHeader><CardContent className="flex-grow flex flex-col gap-4">{analysis.analysis.gustatory?.imageUrl ? (<Image src={analysis.analysis.gustatory.imageUrl} alt="Análisis Gustativo" width={512} height={512} className="rounded-lg object-cover aspect-square w-full" data-ai-hint="abstract flavor" />) : <div className="bg-muted rounded-lg aspect-square w-full flex items-center justify-center"><ImageIcon className="size-16 text-muted-foreground" /></div>}<p className="text-muted-foreground">{analysis.analysis.gustatory?.description}</p></CardContent></Card>
            </div>

            {analysis.foodToPair && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Maridaje con: {analysis.foodToPair}</CardTitle>
                        <div className="flex items-center gap-2 pt-2">
                            <span className="text-muted-foreground">Calificación del maridaje:</span>
                            <StarRating rating={analysis.pairingRating} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{analysis.pairingNotes}</p>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Maridajes Recomendados</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8 pt-6">
                    <div>
                        <h3 className="font-semibold text-lg flex items-center gap-2 text-green-400"><ThumbsUp /> Combinaciones Ideales</h3>
                        <div className="mt-2 text-sm">
                          <PairingList text={analysis.analysis.recommendedPairings || ""} />
                        </div>
                    </div>
                     <div>
                        <h3 className="font-semibold text-lg flex items-center gap-2 text-destructive"><ThumbsDown /> Evitar Combinar con</h3>
                        <p className="text-muted-foreground whitespace-pre-line mt-2">{analysis.analysis.avoidPairings}</p>
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>En su Esencia</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 pt-6">
                    <DetailItem icon={Wine} label="Tipo de Vino" value={analysis.analysis.wineType} />
                    <DetailItem icon={Star} label="Nivel de Calidad" value={analysis.analysis.qualityLevel} />
                    <DetailItem icon={Award} label="Denominación de Origen" value={analysis.analysis.appellation} />
                    <DetailItem icon={Calendar} label="Potencial de Guarda" value={analysis.analysis.decanterRecommendation} />
                    <DetailItem icon={GlassWater} label="Copa Sugerida" value={analysis.analysis.suggestedGlassType} />
                </CardContent>
            </Card>

        </div>
    );
}
