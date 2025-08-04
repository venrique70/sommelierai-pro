
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Sparkles } from "lucide-react";

import {
  suggestSixCoursePairing,
  SuggestSixCoursePairingOutput,
} from "@/ai/flows/suggest-six-course-pairing";
import { CoursePairingSchema } from "@/lib/schemas";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type CoursePairingFormValues = z.infer<typeof CoursePairingSchema>;

const courseLabels: Record<keyof CoursePairingFormValues, string> = {
    entrada: "Entrada",
    primerPlato: "Primer Plato",
    segundoPlato: "Segundo Plato",
    tercerPlato: "Tercer Plato",
    cuartoPlato: "Cuarto Plato",
    postre: "Postre",
};

export default function CoursePairingPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SuggestSixCoursePairingOutput | null>(
    null
  );

  const form = useForm<CoursePairingFormValues>({
    resolver: zodResolver(CoursePairingSchema),
    defaultValues: {
      entrada: "",
      primerPlato: "",
      segundoPlato: "",
      tercerPlato: "",
      cuartoPlato: "",
      postre: "",
    },
  });

  const onSubmit = async (data: CoursePairingFormValues) => {
    setLoading(true);
    setResult(null);
    try {
      const response = await suggestSixCoursePairing(data);
      setResult(response);
    } catch (error) {
      console.error("Failed to get pairing suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Maridaje de Menú Completo
        </h1>
        <p className="text-muted-foreground">
          Diseña tu menú de 6 tiempos y deja que nuestro sommelier de IA maride cada plato a la perfección.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="md:col-span-1">
            <CardHeader>
                <CardTitle>Tu Menú</CardTitle>
                <CardDescription>Describe cada tiempo de tu comida.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {(Object.keys(courseLabels) as (keyof CoursePairingFormValues)[]).map((fieldName) => (
                        <FormField
                            key={fieldName}
                            control={form.control}
                            name={fieldName}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{courseLabels[fieldName]}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                        placeholder={`ej., Vieiras selladas con mantequilla de limón...`}
                                        rows={2}
                                        {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ))}
                    <Button type="submit" disabled={loading} className="w-full">
                        <Sparkles className="mr-2" />
                        {loading ? "Sugiriendo Maridajes..." : "Sugerir Maridajes"}
                    </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Sugerencias de Maridaje de IA</CardTitle>
            <CardDescription>
              Recomendaciones de vino para tu menú.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : result ? (
              <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                {Object.entries(result).map(([key, value], index) => {
                  const fieldName = Object.keys(courseLabels)[index] as keyof CoursePairingFormValues;
                  return (
                    <AccordionItem key={key} value={`item-${index}`}>
                      <AccordionTrigger>{courseLabels[fieldName]}</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-sm text-muted-foreground">{value}</p>
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            ) : (
                <div className="flex items-center justify-center text-center text-muted-foreground h-full min-h-64 border-2 border-dashed rounded-lg">
                    <p>Las sugerencias de maridaje aparecerán aquí.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
