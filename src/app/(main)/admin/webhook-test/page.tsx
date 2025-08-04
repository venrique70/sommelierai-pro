
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Beaker, Loader2, Send } from 'lucide-react';
import { handleLemonSqueezyWebhook } from '@/ai/flows/handle-lemon-squeezy-webhook';

// Esquema para el formulario de prueba
const WebhookTestSchema = z.object({
  user_email: z.string().email({ message: "Por favor, introduce un correo electrónico válido." }),
  plan_name: z.enum(["Descubrete", "Iniciado", "Una Copa", "Copa Premium", "Sibarita"], {
    errorMap: () => ({ message: "Por favor, selecciona un plan." }),
  }),
});
type WebhookTestFormValues = z.infer<typeof WebhookTestSchema>;

export default function WebhookTestPage() {
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { profile, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<WebhookTestFormValues>({
    resolver: zodResolver(WebhookTestSchema),
    defaultValues: {
      user_email: profile?.email || '',
    }
  });

  // Efecto para verificar el rol de administrador
  if (!authLoading && user && profile?.role !== 'admin') {
    if (!authError) {
      setAuthError("Acceso denegado. No tienes permisos para ver esta página.");
      router.push('/'); // Redirigir a la página principal si no es admin
    }
  }

  const onSubmit = async (data: WebhookTestFormValues) => {
    setLoading(true);
    try {
      const result = await handleLemonSqueezyWebhook(data);
      if (result.success) {
        toast({
          title: "Webhook Simulado con Éxito",
          description: result.message,
        });
        // No reseteamos el email para poder hacer varias pruebas
        form.setValue('plan_name', '' as any);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        title: "Error al Simular el Webhook",
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
          <Beaker />
          Simulador de Webhook (Lemon Squeezy)
        </h1>
        <p className="text-muted-foreground mt-2">
          Esta herramienta permite simular una llamada del webhook de Lemon Squeezy para probar la actualización de planes de un usuario.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Enviar Datos de Prueba</CardTitle>
          <CardDescription>
            Introduce el email del usuario y el plan que deseas asignarle. Esto actualizará su perfil en la base de datos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="user_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email del Usuario</FormLabel>
                    <FormControl>
                      <Input placeholder="usuario@ejemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="plan_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan de Lemon Squeezy</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un plan..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Descubrete">Descúbrete (Gratis)</SelectItem>
                        <SelectItem value="Iniciado">Iniciado</SelectItem>
                        <SelectItem value="Una Copa">Una Copa</SelectItem>
                        <SelectItem value="Copa Premium">Copa Premium</SelectItem>
                        <SelectItem value="Sibarita">Sibarita</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading || !form.formState.isValid} size="lg" className="w-full">
                {loading ? <Loader2 className="animate-spin" /> : <Send />}
                Simular Llamada de Webhook
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
