
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Calculator, Loader2, DollarSign } from 'lucide-react';
import { processAffiliateCommissions } from '@/ai/flows/process-affiliate-commissions';

const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const CommissionSchema = z.object({
  month: z.string().nonempty({ message: "Por favor, selecciona un mes." }),
  year: z.string().nonempty({ message: "Por favor, selecciona un año." }),
});

type CommissionFormValues = z.infer<typeof CommissionSchema>;

export default function AdminAffiliateDashboardPage() {
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { profile, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  const form = useForm<CommissionFormValues>({
    resolver: zodResolver(CommissionSchema),
    defaultValues: {
      month: (new Date().getMonth()).toString(),
      year: currentYear.toString(),
    },
  });

  if (!authLoading && user && profile?.role !== 'admin') {
    if (!authError) {
      setAuthError("Acceso denegado. No tienes permisos para ver esta página.");
      router.push('/');
    }
  }

  const onSubmit = async (data: CommissionFormValues) => {
    setLoading(true);
    try {
      const result = await processAffiliateCommissions({ 
          month: parseInt(data.month, 10) + 1, // Convert to 1-12 month
          year: parseInt(data.year, 10) 
      });

      if (result.success) {
        toast({
          title: "Proceso Completado",
          description: result.message,
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        title: "Error al Procesar Comisiones",
        description: error.message || "Ocurrió un error inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div>Cargando...</div>;
  }

  if (authError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error de Acceso</AlertTitle>
        <AlertDescription>{authError}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
          <DollarSign />
          Dashboard de Afiliados
        </h1>
        <p className="text-muted-foreground mt-2">
          Calcula y procesa las comisiones para tu equipo de afiliados.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Cálculo de Comisiones Mensuales</CardTitle>
          <CardDescription>
            Selecciona el mes y año para calcular las comisiones de los afiliados. Esto actualizará sus perfiles con los nuevos totales.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="month"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Mes</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger><SelectValue placeholder="Selecciona un mes..." /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {monthNames.map((name, index) => (
                                    <SelectItem key={index} value={index.toString()}>{name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Año</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger><SelectValue placeholder="Selecciona un año..." /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {years.map((year) => (
                                    <SelectItem key={year} value={year}>{year}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>
              <Button type="submit" disabled={loading} size="lg" className="w-full">
                {loading ? <Loader2 className="animate-spin" /> : <Calculator />}
                Calcular Comisiones del Periodo
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
