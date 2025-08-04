
"use client";

import { useState } from "react";
import { BarChart, Users, DollarSign, TrendingUp, Award, ExternalLink, Info, Check, Loader2, Building, LandPlot } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { registerCorporateSale, type RegisterSaleOutput } from './actions';
import { RegisterCorporateSaleSchema, type RegisterCorporateSaleInput } from "@/lib/schemas";


// Datos de ejemplo para el dashboard. En el futuro, estos vendrían de la base de datos.
const affiliateData = {
  name: "Enrique V.",
  level: "Bachelor", // Nivel actualizado para el ejemplo
  activeReferrals: 15,
  pendingCommission: 250.75,
  nextPayoutDate: "2024-08-15", // Fecha de pago de Lemon Squeezy
  lemonSqueezyLink: "https://sommelierproai.lemonsqueezy.com/affiliates"
};

const commissionTiers = [
  { level: "Nuevo", requirement: "0-4 Referidos", iniciado: "0%", una_copa: "0%", copa_premium: "0%", sibarita: "0%" },
  { level: "Pregrado", requirement: "5-9 Referidos", iniciado: "5%", una_copa: "8%", copa_premium: "10%", sibarita: "15%" },
  { level: "Bachelor", requirement: "10-19 Referidos", iniciado: "7%", una_copa: "10%", copa_premium: "12%", sibarita: "17%" },
  { level: "Pro", requirement: "20-29 Referidos", iniciado: "9%", una_copa: "12%", copa_premium: "15%", sibarita: "18%" },
  { level: "Master", requirement: "30+ Referidos", iniciado: "11%", una_copa: "15%", copa_premium: "17%", sibarita: "20%" },
];

const corporateCommissionTiers = [
    { subscriptions: "10-15", copa_premium: "10%", sibarita: "15%" },
    { subscriptions: "16-20", copa_premium: "12%", sibarita: "17%" },
    { subscriptions: "21-25", copa_premium: "15%", sibarita: "20%" },
];


export default function AffiliateDashboardPage() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<RegisterCorporateSaleInput>({
    resolver: zodResolver(RegisterCorporateSaleSchema.omit({ vendedorUid: true })),
    defaultValues: {
      accessCode: "",
      plan: 'Copa Premium',
      subscriptions: 10,
      billingCycle: 'monthly',
    }
  });

  const onSaleSubmit = async (data: Omit<RegisterCorporateSaleInput, 'vendedorUid'>) => {
    if (!user) {
        toast({ title: "Error", description: "Debes iniciar sesión para registrar una venta.", variant: "destructive"});
        return;
    }
    setLoading(true);
    
    const result: RegisterSaleOutput = await registerCorporateSale({ vendedorUid: user.uid, ...data });

    if (result.success) {
      toast({
        title: "Venta Registrada",
        description: result.message,
      });
      form.reset();
    } else {
      toast({
        title: "Error al Registrar Venta",
        description: result.message,
        variant: "destructive",
      });
    }

    setLoading(false);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-primary">
          Portal de Afiliados
        </h1>
        <p className="text-muted-foreground mt-2">
          Bienvenido, {affiliateData.name}. Aquí tienes un resumen de tu actividad.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tu Nivel Actual</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{affiliateData.level}</div>
            <p className="text-xs text-muted-foreground">
              ¡Sigue así para alcanzar el siguiente nivel!
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referidos Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{affiliateData.activeReferrals}</div>
            <p className="text-xs text-muted-foreground">
              Usuarios que mantienen una suscripción activa.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comisión Estimada</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${affiliateData.pendingCommission.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Esta es tu comisión calculada para el último periodo.
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximo Pago (Estimado)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
                {affiliateData.nextPayoutDate}
            </div>
             <p className="text-xs text-muted-foreground">
              Fecha de pago gestionada por Lemon Squeezy.
            </p>
          </CardContent>
        </Card>
      </div>

       <Alert className="border-primary/20 bg-card">
        <Info className="h-4 w-4 text-primary" />
        <AlertTitle className="text-primary font-bold text-lg">Tu Camino para Empezar a Ganar</AlertTitle>
        <AlertDescription className="space-y-4 mt-2">
          <p>
            Para recibir tus comisiones, todo se gestiona a través de **Lemon Squeezy**. Es un proceso único, seguro y automático. No necesitas que te demos de alta, ¡puedes hacerlo tú mismo!
          </p>
          <div className="space-y-2">
             <h4 className="font-semibold">Pasos a seguir:</h4>
             <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>**Regístrate como afiliado:** Haz clic en el botón de abajo para ir a nuestro portal público de afiliados en Lemon Squeezy y crea tu cuenta.</li>
                <li>**Obtén tu enlace de referido:** Una vez registrado, Lemon Squeezy te dará tu enlace único. ¡Ese es el que debes compartir!</li>
                <li>**Configura tus datos de pago:** Dentro de tu panel de Lemon Squeezy, añade tu cuenta de PayPal o bancaria para recibir los pagos.</li>
             </ol>
             <p className="text-xs text-muted-foreground pt-2">
              ¡Y listo! Lemon Squeezy se encarga de rastrear tus ventas y pagarte automáticamente en sus fechas de pago. No necesitas hacer nada más.
             </p>
          </div>
          <Button asChild size="sm" className="mt-3">
            <a href={affiliateData.lemonSqueezyLink} target="_blank" rel="noopener noreferrer">
              Ir al Portal de Afiliados de Lemon Squeezy <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </AlertDescription>
      </Alert>

        <div className="grid grid-cols-1 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users className="text-primary"/>Comisiones por Planes de Usuario</CardTitle>
                    <CardDescription>Tu comisión por referidos individuales se basa en tu nivel y el plan del referido.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nivel</TableHead>
                                <TableHead>Requisito</TableHead>
                                <TableHead>Iniciado</TableHead>
                                <TableHead>Una Copa</TableHead>
                                <TableHead>Copa Premium</TableHead>
                                <TableHead>Sibarita</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {commissionTiers.map((tier) => (
                                <TableRow key={tier.level} className={tier.level === affiliateData.level ? "bg-accent" : ""}>
                                    <TableCell className="font-medium">{tier.level}{tier.level === affiliateData.level && <Badge variant="outline" className="ml-2">Tu Nivel</Badge>}</TableCell>
                                    <TableCell>{tier.requirement}</TableCell>
                                    <TableCell>{tier.iniciado}</TableCell>
                                    <TableCell>{tier.una_copa}</TableCell>
                                    <TableCell>{tier.copa_premium}</TableCell>
                                    <TableCell>{tier.sibarita}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Building className="text-primary"/>Comisiones por Planes Corporativos</CardTitle>
                <CardDescription>Comisiones especiales por la venta de planes corporativos por volumen.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Volumen (Suscripciones)</TableHead>
                            <TableHead>Copa Premium</TableHead>
                            <TableHead>Sibarita</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {corporateCommissionTiers.map((tier) => (
                        <TableRow key={tier.subscriptions}>
                            <TableCell className="font-medium">{tier.subscriptions}</TableCell>
                            <TableCell>{tier.copa_premium}</TableCell>
                            <TableCell>{tier.sibarita}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registrar Venta Corporativa</CardTitle>
            <CardDescription>
              Introduce los datos de la venta para registrarla y calcular tu comisión.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSaleSubmit)} className="space-y-4">
                <FormField control={form.control} name="accessCode" render={({ field }) => (
                  <FormItem><FormLabel>Código de Acceso de la Empresa</FormLabel><FormControl><Input placeholder="CORP-XXXXXX" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="plan" render={({ field }) => (
                  <FormItem><FormLabel>Plan Vendido</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Copa Premium">Copa Premium</SelectItem><SelectItem value="Sibarita">Sibarita</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="subscriptions" render={({ field }) => (
                  <FormItem><FormLabel>Número de Suscripciones</FormLabel><FormControl><Input type="number" min="1" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="billingCycle" render={({ field }) => (
                  <FormItem><FormLabel>Ciclo de Facturación</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="monthly">Mensual</SelectItem><SelectItem value="yearly">Anual</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )} />
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? <Loader2 className="animate-spin mr-2" /> : <Check className="mr-2" />}
                  Registrar Venta
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
