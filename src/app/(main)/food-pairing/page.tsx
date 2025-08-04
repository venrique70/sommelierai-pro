
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Sparkles } from "lucide-react";

import {
  recommendWinePairing,
  RecommendWinePairingOutput,
} from "@/ai/flows/recommend-wine-pairing";
import { FoodPairingSchema } from "@/lib/schemas";
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
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

type FoodPairingFormValues = z.infer<typeof FoodPairingSchema>;

export default function FoodPairingPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecommendWinePairingOutput | null>(null);

  const form = useForm<FoodPairingFormValues>({
    resolver: zodResolver(FoodPairingSchema),
    defaultValues: { dishDescription: "" },
  });

  const onSubmit = async (data: FoodPairingFormValues) => {
    setLoading(true);
    setResult(null);
    try {
      const response = await recommendWinePairing(data);
      setResult(response);
    } catch (error) {
      console.error("Failed to get recommendation:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Encuentra el Vino Perfecto
        </h1>
        <p className="text-muted-foreground">
          Describe lo que estás comiendo y nuestro sommelier de IA encontrará el maridaje perfecto.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tu Comida</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="dishDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción del Plato</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="ej., Salmón a la parrilla con salsa de limón y eneldo y espárragos asados..."
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading}>
                <Sparkles className="mr-2" />
                {loading ? "Recomendando..." : "Recomendar Vino"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {(loading || result) && (
        <Card>
          <CardHeader>
            <CardTitle>Recomendación de IA</CardTitle>
            <CardDescription>
              La elección de nuestro sommelier para tu comida.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                <div>
                    <Skeleton className="h-5 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-full" />
                </div>
                <div>
                    <Skeleton className="h-5 w-1/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ) : (
              result && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg text-primary">
                      {result.wineRecommendation}
                    </h3>
                  </div>
                  <div>
                    <h4 className="font-semibold">Justificación</h4>
                    <p className="text-muted-foreground">{result.reasoning}</p>
                  </div>
                </div>
              )
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
