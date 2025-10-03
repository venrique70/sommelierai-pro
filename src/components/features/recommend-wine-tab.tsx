"use client";

import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Sparkles, Star, Loader2, Info, ThumbsUp } from "lucide-react";
import Link from 'next/link';

import { recommendWineByCountry } from "@/ai/flows/recommend-wine-by-country";
import { RecommendWineSchema, type RecommendWineByCountryOutput } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { type Translation, Language } from "@/lib/translations";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { updateUserUsage } from "@/lib/auth";

// --- Helper Components ---

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

const RecommendationCard = ({ wineName, justificacionExperta, rating }: { wineName: string, justificacionExperta: string, rating: number }) => (
    <Card className="bg-card/50">
        <CardHeader>
            <div className="flex justify-between items-start gap-4">
                <CardTitle className="text-2xl text-primary font-headline tracking-tight">{wineName}</CardTitle>
                <StarRating rating={rating} />
            </div>
             <Badge variant="secondary" className={cn("w-fit font-bold tracking-wider", rating === 5 ? "text-primary" : "text-amber-400")}>
                {rating === 5 ? "Recomendación 5 Estrellas" : "Recomendación 4 Estrellas"}
             </Badge>
        </CardHeader>
        <CardContent>
            <h4 className="font-semibold text-lg">Justificación Experta</h4>
            <p className="text-muted-foreground mt-1">{justificacionExperta}</p>
        </CardContent>
    </Card>
);

// --- Main Tab Component ---

export function RecommendWineTab({ t, language }: { t: Translation, language: Language }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecommendWineByCountryOutput | null>(null);
  const { toast } = useToast();
  const { user, profile } = useAuth();

// === BYPASS OWNER/ADMIN ===
const email = user?.email?.toLowerCase?.() || '';
const username = (profile as any)?.username?.toLowerCase?.() || '';
const isAdmin =
  profile?.role === 'admin' ||
  email === 'venrique70@gmail.com' ||
  username === 'venrique70';

  const form = useForm<z.infer<typeof RecommendWineSchema>>({
    resolver: zodResolver(RecommendWineSchema),
    defaultValues: {
      dishDescription: "",
      country: "",
      language: language,
    },
  });

  React.useEffect(() => {
    form.setValue('language', language);
  }, [language, form]);

  const onSubmit = async (data: z.infer<typeof RecommendWineSchema>) => {
    if (!user || !profile) {
        toast({ title: "Error de autenticación", description: "Debes iniciar sesión para recomendar un vino.", variant: "destructive" });
        return;
    }

    const { current = 0, limit = Infinity } =
      profile?.usage?.recommendWine ?? { current: 0, limit: Infinity };

    // ⬇️ No bloquear si eres admin (owner)
    if (!isAdmin && limit !== Infinity && current >= limit) {
      toast({
        title: "Límite de Recomendaciones Alcanzado",
        description: "Has alcanzado tu límite de recomendaciones de vino. ¡Sube de plan para obtener más!",
        variant: "destructive",
        duration: 8000,
        action: (
          <Button asChild size="sm">
            <Link href="/planes">Ver Planes</Link>
          </Button>
        ),
      });
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const response = await recommendWineByCountry(data);
      setResult(response);
      if (!isAdmin) {
        await updateUserUsage(user.uid, 'recommendWine');
      }
    } catch (error) {
      console.error("Failed to get recommendation:", error);
      const errorMessage = error instanceof Error ? error.message : t.couldNotGetRecommendation;
      toast({ title: t.error, description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const planName   = profile?.subscription?.plan || '...';
  const currentUsage = profile?.usage?.recommendWine?.current ?? 0;
  const usageLimit   = profile?.usage?.recommendWine?.limit ?? 1;
  const remaining    = usageLimit - currentUsage;
  const isUnlimited  = isAdmin || usageLimit === Infinity; // ⬅️ NUEVO

    return (
        <div className="space-y-6">
            <CardHeader>
                <CardTitle>{t.recommendWine}</CardTitle>
                {profile && !isUnlimited && (
                    <Alert className="mt-4">
                        <Info className="h-4 w-4" />
                        <AlertTitle>Plan {planName}</AlertTitle>
                        <AlertDescription>
                            Te quedan {Math.max(0, remaining)} de {usageLimit} recomendaciones este mes.
                        </AlertDescription>
                    </Alert>
                )}
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="dishDescription"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t.dishDescription}</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder={t.dishDescriptionPlaceholder} {...field} rows={4} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t.wineCountry}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t.wineCountryPlaceholder} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={loading} size="lg" className="w-full">
                            {loading ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />}
                            {loading ? t.searchingWines : t.recommendWine}
                        </Button>
                    </form>
                </Form>
            </CardContent>

            {(loading || result) && (
                 <CardContent className="space-y-6">
                    {loading ? (
                         [...Array(3)].map((_, i) => (
                             <Card key={i}>
                                 <CardHeader>
                                     <div className="flex justify-between items-start">
                                        <Skeleton className="h-8 w-2/3" />
                                        <Skeleton className="h-6 w-24" />
                                     </div>
                                     <Skeleton className="h-6 w-12 mt-2" />
                                 </CardHeader>
                                 <CardContent className="space-y-4">
                                     <Skeleton className="h-5 w-48" />
                                     <div className="space-y-2">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-5/6" />
                                     </div>
                                 </CardContent>
                             </Card>
                         ))
                    ) : result ? (
                       result.map((rec, index) => <RecommendationCard key={index} {...rec} />)
                    ) : null}
                 </CardContent>
            )}
        </div>
    );
}
