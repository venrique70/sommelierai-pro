"use client";

import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import {
  Sparkles,
  Wine,
  Star,
  Image as ImageIcon,
  ThumbsUp,
  ThumbsDown,
  Send,
  Loader2,
  Info,
  Edit,
  Building,
  MapPin,
  Leaf,
  Utensils,
  GlassWater,
  Calendar,
  Award,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { WineAnalysisClientSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { WineAnalysis, WineAnalysisError, Correction } from "@/types";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { type Language, type Translation } from "@/lib/translations";
import { useAuth } from "@/hooks/use-auth";
import { PairingList } from "@/components/features/PairingList";
import { getWineAnalysis } from "@/ai/flows/actions";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// --- Helper Components ---

function StarRating({
  rating,
  className,
}: {
  rating: number | undefined;
  className?: string;
}) {
  if (rating === undefined) return null;
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-5",
            i < Math.round(rating)
              ? "text-yellow-400 fill-yellow-400"
              : "text-muted-foreground/30",
          )}
        />
      ))}
    </div>
  );
}

function InteractiveStarRating({
  rating,
  setRating,
}: {
  rating: number;
  setRating: (rating: number) => void;
}) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center gap-1 py-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "size-8 cursor-pointer transition-colors",
            (hoverRating || rating) >= star
              ? "text-yellow-400 fill-yellow-400"
              : "text-muted-foreground/50 hover:text-muted-foreground",
          )}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => setRating(star)}
        />
      ))}
    </div>
  );
}

const Corrections = ({
  corrections,
  notes,
}: {
  corrections?: Correction[];
  notes?: string;
}) => {
  if (!corrections || (corrections.length === 0 && !notes)) return null;
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
                Se corrigió <strong>{c.field}</strong> de "{c.original}" a "
                <strong>{c.corrected}</strong>".
              </li>
            ))}
          </ul>
        )}
      </AlertDescription>
    </Alert>
  );
};

const DetailItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number | undefined | null;
}) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <Icon className="size-5 text-primary flex-shrink-0 mt-1" />
      <div>
        <p className="font-semibold text-muted-foreground">{label}</p>
        <p className="text-foreground whitespace-pre-line">{value}</p>
      </div>
    </div>
  );
};

// --- Main Tab Component ---

export function WineAnalysisTab({
  t,
  language,
}: {
  t: Translation;
  language: Language;
}) {
  const { user, profile, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WineAnalysis | null>(null);
  const { toast } = useToast();
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const form = useForm<z.infer<typeof WineAnalysisClientSchema>>({
    resolver: zodResolver(WineAnalysisClientSchema),
    defaultValues: {
      uid: "",
      wineName: "AMADOR DIEZ",
      grapeVariety: "VERDEJO",
      year: 2018,
      wineryName: "",
      country: "",
      foodToPair: "",
      language: "es",
    },
  });

  React.useEffect(() => {
    if (user) {
      form.setValue("uid", user.uid);
    }
  }, [user, form]);

  const onSubmit = async (data: z.infer<typeof WineAnalysisClientSchema>) => {
    if (!user || !profile) {
      toast({
        title: "Error de autenticación",
        description: "Debes iniciar sesión para analizar un producto.",
        variant: "destructive",
      });
      return;
    }

    // BYPASS de límite para admin / email / flag en Firestore
    const isUnlimited =
      (profile as any)?.unlimited === true ||
      user?.email?.toLowerCase() === "venrique70@gmail.com" ||
      (profile as any)?.role === "admin";

    if (!isUnlimited) {
      const { current, limit } =
        profile?.usage?.analyzeWine ?? ({ current: 0, limit: 0 } as const);

      const reachedLimit =
        limit !== Infinity &&
        limit !== Number.POSITIVE_INFINITY &&
        current >= limit;

      if (reachedLimit) {
        toast({
          title: "Límite de Análisis Alcanzado",
          description:
            "Has agotado tus análisis gratuitos para este mes. ¡Sube de plan para seguir explorando!",
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
    }

    setLoading(true);
    setResult(null);
    setFeedbackRating(0);
    setFeedbackComment("");
    setFeedbackSubmitted(false);

    try {
      const payload = {
        ...data,
        language,
        uid: user.uid,
      };

      const analysisResponse = await getWineAnalysis(payload);

      if (!analysisResponse) {
        toast({
          title: t.unexpectedError,
          description:
            "La IA no ha devuelto ninguna respuesta. Por favor, inténtelo de nuevo.",
          variant: "destructive",
          duration: 8000,
        });
        setResult(null);
      } else if ("error" in analysisResponse) {
        toast({
          title: t.analysisError,
          description: (analysisResponse as WineAnalysisError).error,
          variant: "destructive",
          duration: 8000,
        });
        setResult(null);
      } else {
        setResult(analysisResponse as WineAnalysis);
      }
    } catch (error) {
      console.error("Failed to analyze wine:", error);
      const errorMessage = error instanceof Error ? error.message : t.generic;
      toast({
        title: t.unexpectedError,
        description: `${t.generic}: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = () => {
    console.log("Feedback submitted:", {
      rating: feedbackRating,
      comment: feedbackComment,
    });
    toast({
      title: t.thankYouForFeedback,
      description: t.feedbackHelpsUsImprove,
    });
    setFeedbackSubmitted(true);
  };

  const planName = profile?.subscription?.plan || "...";
  const currentUsage = profile?.usage?.analyzeWine?.current ?? 0;
  const usageLimit = profile?.usage?.analyzeWine?.limit ?? 5;
  const remaining = usageLimit - currentUsage;

  if (authLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="animate-spin mr-2" />
        Cargando perfil de usuario...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CardHeader>
        <CardTitle>Análisis Sensorial</CardTitle>
        {profile && usageLimit !== Infinity && (
          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Plan {planName}</AlertTitle>
            <AlertDescription>
              Te quedan {Math.max(0, remaining)} de {usageLimit} análisis este
              mes.
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="wineName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Producto</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ej. Catena Zapata, Whisky Grants..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="grapeVariety"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cepa / Atributo Principal</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ej. 12 Años, Cabernet Sauvignon"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Año (Cosecha/Embotellado)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder={t.yearPlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="wineryName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bodega / Destilería (Opcional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ej. Bodega Catena Zapata"
                        {...field}
                      />
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
                    <FormLabel>{t.countryOptional}</FormLabel>
                    <FormControl>
                      <Input placeholder={t.countryPlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="foodToPair"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.foodToPairOptional}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t.foodToPairPlaceholder}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col items-center gap-2 pt-4">
              <Button type="submit" variant="destructive" disabled={loading} size="lg">
                {loading ? (
                  <Loader2 className="mr-2 animate-spin" />
                ) : (
                  <Sparkles className="mr-2" />
                )}
                {loading ? t.analyzing : "Analizar Producto"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>

      {loading && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-0">
                  <Skeleton className="w-full aspect-square rounded-t-lg" />
                </CardContent>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      )}

      {result && result.analysis && (
        <div className="space-y-6">
          <Corrections corrections={result.corrections} notes={result.notes} />

          <Card>
            <CardHeader>
              <Badge
                variant="secondary"
                className="w-fit mb-2 bg-green-500/20 text-green-300"
              >
                {result.isAiGenerated ? "Análisis Genérico" : "Análisis Verificado"}
              </Badge>
              <CardTitle className="text-3xl font-bold">
                {result.wineName} {result.year}
              </CardTitle>
              <CardDescription className="text-lg flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
                <span className="flex items-center gap-2">
                  <Building className="size-4" />
                  {result.wineryName}
                </span>
                {result.analysis.wineryLocation && (
                  <span className="flex items-center gap-2">
                    <MapPin className="size-4" />
                    {result.analysis.wineryLocation}, {result.country}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wine className="size-6" /> Fase Visual
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col gap-4">
                {result.analysis.visual?.imageUrl ? (
                  <Image
                    src={result.analysis.visual.imageUrl}
                    alt={t.visualAnalysis}
                    width={512}
                    height={512}
                    className="rounded-lg object-cover aspect-square w-full"
                    data-ai-hint="wine glass"
                  />
                ) : (
                  <div className="bg-muted rounded-lg aspect-square w-full flex items-center justify-center">
                    <ImageIcon className="size-16 text-muted-foreground" />
                  </div>
                )}
                <p className="text-muted-foreground">
                  {result.analysis.visual?.description}
                </p>
              </CardContent>
            </Card>

            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="size-6" /> Fase Olfativa
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col gap-4">
                {result.analysis.olfactory?.imageUrl ? (
                  <Image
                    src={result.analysis.olfactory.imageUrl}
                    alt={t.olfactoryAnalysis}
                    width={512}
                    height={512}
                    className="rounded-lg object-cover aspect-square w-full"
                    data-ai-hint="abstract aroma"
                  />
                ) : (
                  <div className="bg-muted rounded-lg aspect-square w-full flex items-center justify-center">
                    <ImageIcon className="size-16 text-muted-foreground" />
                  </div>
                )}
                <p className="text-muted-foreground">
                  {result.analysis.olfactory?.description}
                </p>
              </CardContent>
            </Card>

            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="size-6" /> Fase Gustativa
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col gap-4">
                {result.analysis.gustatory?.imageUrl ? (
                  <Image
                    src={result.analysis.gustatory.imageUrl}
                    alt={t.gustatoryAnalysis}
                    width={512}
                    height={512}
                    className="rounded-lg object-cover aspect-square w-full"
                    data-ai-hint="abstract flavor"
                  />
                ) : (
                  <div className="bg-muted rounded-lg aspect-square w-full flex items-center justify-center">
                    <ImageIcon className="size-16 text-muted-foreground" />
                  </div>
                )}
                <p className="text-muted-foreground">
                  {result.analysis.gustatory?.description}
                </p>
              </CardContent>
            </Card>
          </div>

          {result.foodToPair && (
            <Card>
              <CardHeader>
                <CardTitle>Maridaje con: {result.foodToPair}</CardTitle>
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-muted-foreground">
                    Calificación del maridaje:
                  </span>
                  <StarRating rating={result.pairingRating} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{result.pairingNotes}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Maridajes Recomendados</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-8 md:grid-cols-2 pt-6">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2 text-green-400">
                  <ThumbsUp /> Combinaciones Ideales
                </h3>
                <div className="mt-2 text-sm">
                  <PairingList text={result.analysis.recommendedPairings} />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2 text-destructive">
                  <ThumbsDown /> Evitar Combinar con
                </h3>
                <p className="text-muted-foreground whitespace-pre-line mt-2">
                  {result.analysis.avoidPairings}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>El Alma del Vino</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 pt-6">
              <DetailItem icon={Wine} label={t.wineType} value={result.analysis.wineType} />
              <DetailItem icon={Award} label={t.appellation} value={result.analysis.appellation} />
              <div>
                <p className="font-semibold text-muted-foreground">{t.qualityLevel}</p>
                <StarRating rating={result.analysis.qualityRating} />
              </div>
              <DetailItem icon={Users} label={t.targetAudience} value={result.analysis.targetAudience} />
              <DetailItem icon={Info} label={t.barrelInfo} value={result.analysis.barrelInfo} />
              <DetailItem icon={Wine} label={t.grapeVarieties} value={result.analysis.grapeVariety} />
              <DetailItem icon={Info} label={t.servingTemperature} value={result.analysis.servingTemperature} />
              <DetailItem icon={GlassWater} label={t.decanterRecommendation} value={result.analysis.decanterRecommendation} />
              <DetailItem icon={Calendar} label={t.agingPotential} value={result.analysis.agingPotential} />
              <DetailItem icon={Leaf} label={t.tanninLevel} value={result.analysis.tanninLevel} />
              <DetailItem icon={Award} label="Premios" value={result.analysis.awards} />
              <div className="space-y-2">
                <p className="font-semibold text-muted-foreground">{t.suggestedGlassType}</p>
                <p className="text-foreground">{result.analysis.suggestedGlassType}</p>
                {result.analysis.suggestedGlassTypeImageUrl && (
                  <div className="relative h-24 w-24">
                    <Image
                      src={result.analysis.suggestedGlassTypeImageUrl}
                      alt={`${t.suggestedGlassType}: ${result.analysis.suggestedGlassType}`}
                      width={96}
                      height={96}
                      className="rounded-lg object-contain bg-white p-1"
                      data-ai-hint="wine glass"
                    />
                  </div>
                )}
              </div>
              <DetailItem
                icon={Award}
                label="Está en los 50 Best & Michelin"
                value={result.analysis.world50BestRestaurants}
              />
            </CardContent>
          </Card>

          <div className="py-6 text-center">
            <p className="font-signature text-4xl text-primary/90">
              Court of Master Sommeliers
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t.rateYourExperience}</CardTitle>
              <CardDescription>{t.rateYourExperienceDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              {feedbackSubmitted ? (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-accent/20 p-8 text-center">
                  <Star className="size-10 text-yellow-400 fill-yellow-400 mb-4" />
                  <p className="text-lg font-semibold text-primary">
                    {t.thankYouForFeedback}
                  </p>
                  <p className="text-muted-foreground">{t.feedbackSentSuccessfully}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold">{t.overallRating}</Label>
                    <InteractiveStarRating
                      rating={feedbackRating}
                      setRating={setFeedbackRating}
                    />
                  </div>
                  <div>
                    <Label htmlFor="feedback-comment" className="text-base font-semibold">
                      {t.commentsAndSuggestions}
                    </Label>
                    <Textarea
                      id="feedback-comment"
                      placeholder={t.commentsAndSuggestionsPlaceholder}
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      rows={3}
                      className="mt-2"
                    />
                  </div>
                  <Button onClick={handleFeedbackSubmit} disabled={feedbackRating === 0}>
                    <Send className="mr-2" />
                    {t.sendFeedback}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {result && !result.analysis && (
        <Card className="text-center p-8">
          <CardTitle>Análisis Incompleto</CardTitle>
          <CardDescription className="mt-2 max-w-prose mx-auto">
            La IA no pudo generar un análisis sensorial detallado en esta ocasión,
            pero aquí está la conclusión del sommelier.
          </CardDescription>
          <CardContent className="mt-4 text-left">
            <Corrections corrections={result.corrections} notes={result.notes} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
