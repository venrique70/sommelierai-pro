
"use client";

import * as React from "react";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Sparkles, Wine, Star, UtensilsCrossed, PlusCircle, Trash2, Loader2, Replace, MapPin, Info, Leaf, HelpCircle } from "lucide-react";

import { evaluateDinnerPairings } from "@/ai/flows/evaluate-dinner-pairings";
import { DinnerPairingSchema, type EvaluateDinnerPairingsOutput, type SommelierSuggestionSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { type Language, type Translation } from "@/lib/translations";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


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

const RecommendationCard = ({ wineName, analysis, justification, rating }: z.infer<typeof SommelierSuggestionSchema>) => (
    <Card className="bg-background/50 border-border">
        <CardHeader>
            <div className="flex justify-between items-start">
                <CardTitle className="text-xl text-primary font-headline tracking-tight">{wineName}</CardTitle>
                <StarRating rating={rating} />
            </div>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-base mb-2">Análisis Sensorial</h4>
              <p className="text-muted-foreground text-sm"><strong>Visual:</strong> {analysis.visual}</p>
              <p className="text-muted-foreground text-sm"><strong>Olfativo:</strong> {analysis.olfactory}</p>
              <p className="text-muted-foreground text-sm"><strong>Gustativo:</strong> {analysis.gustatory}</p>
            </div>
             <div>
              <h4 className="font-semibold text-base mb-2">Justificación del Maridaje</h4>
              <p className="text-muted-foreground text-sm">{justification}</p>
            </div>
        </CardContent>
    </Card>
);

// --- Main Tab Component ---

export function DinnerPairingTab({ t, language }: { t: Translation, language: Language }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluateDinnerPairingsOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof DinnerPairingSchema>>({
    resolver: zodResolver(DinnerPairingSchema),
    defaultValues: {
      country: "",
      pairings: [{ dish: "", wine: "", description: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "pairings",
  });

  const onSubmit = async (data: z.infer<typeof DinnerPairingSchema>) => {
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        ...data,
        language,
      };
      
      const response = await evaluateDinnerPairings(payload);
      setResult(response);
    } catch (error) {
      console.error("Failed to evaluate pairings:", error);
      const errorMessage = error instanceof Error ? error.message : t.couldNotEvaluatePairing;
      toast({ title: t.error, description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPairing = () => {
    if (fields.length < 6) {
        append({ dish: "", wine: "", description: "" });
    } else {
        toast({
            title: "Límite alcanzado",
            description: "Puedes analizar un máximo de 6 maridajes a la vez.",
            variant: "destructive"
        })
    }
  };
  
  const handleRemovePairing = (index: number) => {
    if (fields.length > 1) {
        remove(index);
    } else {
        toast({
            title: "Acción no permitida",
            description: "Debe haber al menos un maridaje.",
            variant: "destructive"
        })
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          <CardHeader>
            <CardTitle>{t.dinnerPairing}</CardTitle>
            <CardDescription>{t.evaluateDinnerPairingDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                 <FormField
                    control={form.control}
                    name={`country`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-base"><MapPin className="size-4" />{t.wineCountry}</FormLabel>
                        <FormControl>
                          <Input placeholder={t.wineCountryPlaceholder} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                {fields.map((field, index) => (
                  <Card key={field.id} className="relative p-4 pt-6 bg-card border-border">
                     <Badge variant="secondary" className="absolute -top-2.5 left-2">{index + 1}</Badge>
                     {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 size-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemovePairing(index)}
                      >
                        <Trash2 className="size-4" />
                        <span className="sr-only">{t.removePairing}</span>
                      </Button>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name={`pairings.${index}.dish`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2"><UtensilsCrossed className="size-4" />{t.dish}</FormLabel>
                            <FormControl>
                              <Input placeholder={t.dishPlaceholder} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                         <FormField
                            control={form.control}
                            name={`pairings.${index}.wine`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2"><Wine className="size-4" />Vino/Licor</FormLabel>
                                <FormControl>
                                  <Input placeholder={t.winePlaceholder} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                           <FormField
                            control={form.control}
                            name={`pairings.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2"><Leaf className="size-4" />Cepa / Descripción</FormLabel>
                                <FormControl>
                                  <Input placeholder="ej. Malbec, 12 Años" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                      </div>
                    </div>
                  </Card>
                ))}

                <div className="flex flex-wrap gap-4">
                  <Button type="button" variant="outline" onClick={handleAddPairing} className="justify-self-start">
                    <PlusCircle className="mr-2" />
                    {t.addPairing}
                  </Button>
                  <Button type="submit" disabled={loading || fields.length === 0} size="lg">
                     {loading ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />}
                     {loading ? t.evaluating : t.evaluateMyDinner}
                  </Button>
                </div>
                 {form.formState.errors.root && (
                  <p className="text-sm font-medium text-destructive">{form.formState.errors.root.message}</p>
                )}
                {form.formState.errors.pairings?.root && (
                  <p className="text-sm font-medium text-destructive">{form.formState.errors.pairings.root.message}</p>
                )}
              </form>
            </Form>
          </CardContent>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-primary">{t.sommelierEvaluation}</h2>
          {loading ? (
              [...Array(form.getValues('pairings').length)].map((_, i) => (
                <Card key={i} className="p-4">
                    <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                    <CardContent className="space-y-4">
                    <Skeleton className="h-5 w-1/4" />
                    <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /></div>
                    </CardContent>
                </Card>
              ))
          ) : result ? (
            <div className="space-y-6">
              {result.map((evaluation, evalIndex) => (
                <Card key={evalIndex} className={cn("transition-all border-2", evaluation.rating >= 4 ? "border-green-400/30 bg-green-950/20" : "border-amber-400/30 bg-amber-950/20")}>
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Badge variant="secondary" className="w-fit">{t.yourPairing}</Badge>
                          <h3 className="font-bold text-xl text-foreground mt-2">{evaluation.pairingDescription}</h3>
                        </div>
                        <StarRating rating={evaluation.rating} className="shrink-0" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-background/30 rounded-md">
                          <h4 className="font-semibold mb-2 flex items-center gap-2"><Info className="size-4" /> {t.expertAnalysis}</h4>
                          <p className="text-muted-foreground whitespace-pre-wrap">{evaluation.evaluation}</p>
                        </div>

                         {evaluation.suggestionAvailable && evaluation.sommelierSuggestions && evaluation.sommelierSuggestions.length > 0 && (
                           <Accordion type="single" collapsible className="w-full">
                              <AccordionItem value="item-1">
                                <AccordionTrigger className="hover:no-underline">
                                  <div className="flex items-center gap-2 text-primary font-bold"><Replace /> {t.alternativeSuggestion}</div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-4 space-y-4">
                                  {evaluation.sommelierSuggestions.map((rec, recIndex) => (
                                      <RecommendationCard key={recIndex} {...rec} />
                                  ))}
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          )}
                    </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground min-h-64 border-2 border-dashed rounded-lg p-8">
              <UtensilsCrossed className="size-16 mb-4 text-primary/50" />
              <h3 className="text-lg font-semibold">{t.waitingForPairings}</h3>
              <p className="text-sm">{t.evaluationWillAppearHere}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
