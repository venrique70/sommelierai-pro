
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { listAnalyses, type ListAnalysesOutput } from '@/ai/flows/list-analyses';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, History, Info, ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type AnalysisSummary = NonNullable<ListAnalysesOutput['analyses']>[0];

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchAnalyses = async () => {
      try {
        const result = await listAnalyses({ uid: user.uid });
        if (result.error) {
          setError(result.error);
        } else {
          setAnalyses(result.analyses || []);
        }
      } catch (e: any) {
        setError(e.message || "Un error inesperado ocurrió.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyses();
  }, [user, authLoading, router]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-primary flex items-center gap-3">
            <History /> Mi Historial de Análisis
          </h1>
          <p className="text-muted-foreground mt-2">Cargando tus análisis guardados...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                  <Skeleton className="rounded-lg object-cover aspect-square w-full" />
                  <Skeleton className="h-6 w-3/4 mt-4" />
                  <Skeleton className="h-5 w-1/2" />
              </CardHeader>
              <CardContent>
                  <Skeleton className="h-6 w-1/3" />
              </CardContent>
              <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error al Cargar el Historial</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-primary flex items-center gap-3">
          <History /> Mi Historial de Análisis
        </h1>
        <p className="text-muted-foreground mt-2">
          Aquí puedes encontrar todos los análisis de productos que has realizado.
        </p>
      </div>

      {analyses.length === 0 ? (
        <Card className="text-center p-12">
            <CardTitle>Tu historial está vacío</CardTitle>
            <CardDescription className="mt-2">Aún no has realizado ningún análisis. ¡Prueba SommelierPro AI!</CardDescription>
             <Button asChild className="mt-4">
                <Link href="/">Realizar mi primer análisis</Link>
            </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {analyses.map((analysis) => (
            <Card key={analysis.id} className="flex flex-col">
              <CardHeader>
                {analysis.imageUrl ? (
                     <Image 
                        src={analysis.imageUrl} 
                        alt={`Imagen de ${analysis.wineName}`} 
                        width={400} height={400} 
                        className="rounded-lg object-cover aspect-square w-full" 
                        data-ai-hint="wine bottle"
                     />
                ) : (
                    <div className="bg-muted rounded-lg aspect-square w-full flex items-center justify-center">
                        <ImageIcon className="size-16 text-muted-foreground" />
                    </div>
                )}
                <CardTitle className="mt-4 pt-2">{analysis.wineName}</CardTitle>
                <CardDescription>{analysis.grapeVariety || 'N/A'} - {analysis.year}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                 <Badge variant="outline">
                    Analizado: {new Date(analysis.createdAt).toLocaleDateString()}
                 </Badge>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/history/${analysis.id}`}>Ver Detalle</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
