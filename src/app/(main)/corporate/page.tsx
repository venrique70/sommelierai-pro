
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building, Check, KeySquare, Loader2, Send, Sparkles, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { requestCorporateInfo, getCorporateInfo } from './actions';
import { RequestCorporateInfoClientSchema, GetCorporateInfoInputSchema } from '@/lib/schemas';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type CorporateInfoRequestValues = z.infer<typeof RequestCorporateInfoClientSchema>;
type UnlockFormValues = z.infer<typeof GetCorporateInfoInputSchema>;

// Data based on the provided image
const corporatePlans = {
  copaPremium: {
    name: 'Plan Copa Premium',
    features: ['30 Análisis Sensoriales al mes', '15 Recomendaciones de Vino', '10 Cenas Maridaje'],
    pricing: [
      { subscriptions: 10, monthly: 117.9, yearly: 1109.9 },
      { subscriptions: 15, monthly: 176.9, yearly: 1664.9 },
      { subscriptions: 20, monthly: 235.9, yearly: 2219.9 },
      { subscriptions: 25, monthly: 294.9, yearly: 2774.9 },
    ],
  },
  sibarita: {
    name: 'Plan Sibarita',
    features: [
      '60 Análisis Sensoriales al mes',
      '20 Recomendaciones de Vino',
      '15 Cenas Maridaje',
      'Análisis por Ficha',
      'Mi Bodega Personal',
      'Mi Historial de Análisis',
      'Mi Carta (Restaurante)',
      'Acceso anticipado a funciones beta',
      'Acumulación de análisis no utilizados',
      'Reconocimiento como Embajador',
    ],
    pricing: [
      { subscriptions: 10, monthly: 179.9, yearly: 1707.9 },
      { subscriptions: 15, monthly: 269.9, yearly: 2651.9 },
      { subscriptions: 20, monthly: 362.9, yearly: 3416.9 },
      { subscriptions: 25, monthly: 453.9, yearly: 4269.9 },
    ],
  },
};

const PlanDetailCard = ({ plan, billingCycle }: { plan: (typeof corporatePlans)['copaPremium'], billingCycle: 'monthly' | 'yearly' }) => (
    <Card className="flex flex-col">
        <CardHeader>
            <CardTitle className="text-2xl text-primary">{plan.name}</CardTitle>
            <CardDescription>Detalles y precios por volumen.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 flex-grow">
            <ul className="space-y-2 text-muted-foreground">
                {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                        <Check className="size-5 text-green-500 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Suscripciones</TableHead>
                        <TableHead className="text-right">Precio {billingCycle === 'monthly' ? 'Mensual' : 'Anual'} (USD)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {plan.pricing.map((tier) => (
                        <TableRow key={tier.subscriptions}>
                            <TableCell>{tier.subscriptions}</TableCell>
                            <TableCell className="text-right font-semibold">${(billingCycle === 'monthly' ? tier.monthly : tier.yearly).toFixed(2)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
);

const CorporateInfoView = () => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    return (
        <div className="space-y-8">
            <div className="text-center">
                 <h2 className="text-3xl font-bold tracking-tight text-primary">Planes Corporativos Exclusivos</h2>
                 <p className="text-muted-foreground mt-2">Soluciones diseñadas para potenciar tu negocio.</p>
            </div>
             <div className="flex items-center justify-center space-x-2">
                <Button variant={billingCycle === 'monthly' ? 'default' : 'ghost'} onClick={() => setBillingCycle('monthly')}>Facturación Mensual</Button>
                <Button variant={billingCycle === 'yearly' ? 'default' : 'ghost'} onClick={() => setBillingCycle('yearly')}>Facturación Anual (Ahorra 15%)</Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <PlanDetailCard plan={corporatePlans.copaPremium} billingCycle={billingCycle} />
                <PlanDetailCard plan={corporatePlans.sibarita} billingCycle={billingCycle} />
            </div>
        </div>
    );
}

export default function CorporatePage() {
    const [view, setView] = useState<'form' | 'success' | 'unlocked'>('form');
    const [isLoading, setIsLoading] = useState(false);
    const [unlockError, setUnlockError] = useState('');
    const { toast } = useToast();

    const requestForm = useForm<CorporateInfoRequestValues>({
        resolver: zodResolver(RequestCorporateInfoClientSchema),
        defaultValues: { companyName: '', contactName: '', contactEmail: '' },
    });

    const unlockForm = useForm<UnlockFormValues>({
        resolver: zodResolver(GetCorporateInfoInputSchema),
        defaultValues: { accessCode: '' },
    });

    const handleRequestSubmit = async (data: CorporateInfoRequestValues) => {
        setIsLoading(true);
        try {
            const result = await requestCorporateInfo(data);
            if (result.success) {
                setView('success');
            } else {
                throw new Error(result.error || 'Ocurrió un error inesperado.');
            }
        } catch (error: any) {
            toast({ title: "Error en la Solicitud", description: error.message, variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnlockSubmit = async (data: UnlockFormValues) => {
        setIsLoading(true);
        setUnlockError('');
        try {
            const result = await getCorporateInfo(data);
            if (result.success) {
                setView('unlocked');
            } else {
                 setUnlockError(result.error || 'Código inválido o expirado.');
            }
        } catch (error: any) {
            setUnlockError(error.message || 'Ocurrió un error al verificar el código.');
        } finally {
            setIsLoading(false);
        }
    }


    if (view === 'unlocked') {
        return <CorporateInfoView />;
    }

    if (view === 'success') {
         return (
            <div className="flex flex-col items-center justify-center text-center space-y-6 max-w-2xl mx-auto py-12">
                 <div className="p-4 bg-green-500/20 rounded-full">
                    <Check className="size-16 text-green-500" />
                 </div>
                <h1 className="text-3xl font-bold text-primary">¡Solicitud Recibida!</h1>
                <p className="text-xl text-muted-foreground">
                    Hemos enviado un correo electrónico con tu código de acceso único.
                    Por favor, revísalo para ver nuestros planes corporativos.
                </p>
                 <Card className="w-full">
                     <CardHeader>
                         <CardTitle>¿No recibiste el correo?</CardTitle>
                         <CardDescription>Introduce el código que te hemos enviado para desbloquear la información.</CardDescription>
                     </CardHeader>
                    <CardContent>
                       <Form {...unlockForm}>
                            <form onSubmit={unlockForm.handleSubmit(handleUnlockSubmit)} className="flex items-start gap-4">
                                <FormField
                                    control={unlockForm.control}
                                    name="accessCode"
                                    render={({ field }) => (
                                        <FormItem className="flex-grow">
                                            <FormControl><Input placeholder="Tu código de acceso..." {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin" /> : 'Desbloquear'}</Button>
                            </form>
                            {unlockError && <p className="text-sm text-destructive mt-2">{unlockError}</p>}
                        </Form>
                    </CardContent>
                </Card>
            </div>
         )
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-4xl font-bold tracking-tight text-primary flex items-center gap-3">
                    <Building />
                    Planes Corporativos
                </h1>
                <p className="text-muted-foreground mt-2">
                    Potencia a tu equipo o añade valor a tus clientes con SommelierPro AI. Ideal para bodegas, distribuidoras, restaurantes y hoteles.
                </p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Solicita Información Exclusiva</CardTitle>
                    <CardDescription>
                        Completa el formulario para recibir un código de acceso por correo y ver nuestros planes diseñados para empresas.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                   <Form {...requestForm}>
                        <form onSubmit={requestForm.handleSubmit(handleRequestSubmit)} className="space-y-6">
                            <FormField
                                control={requestForm.control}
                                name="companyName"
                                render={({ field }) => (
                                    <FormItem><FormLabel>Nombre de la Empresa</FormLabel><FormControl><Input placeholder="Ej. Restaurante La Cava" {...field} /></FormControl><FormMessage /></FormItem>
                                )}
                            />
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                    control={requestForm.control}
                                    name="contactName"
                                    render={({ field }) => (
                                        <FormItem><FormLabel>Nombre del Contacto</FormLabel><FormControl><Input placeholder="Ej. Juan Pérez" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}
                                />
                                <FormField
                                    control={requestForm.control}
                                    name="contactEmail"
                                    render={({ field }) => (
                                        <FormItem><FormLabel>Email del Contacto</FormLabel><FormControl><Input type="email" placeholder="juan.perez@ejemplo.com" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}
                                />
                            </div>
                             <div className="text-center pt-4">
                                <Button size="lg" type="submit" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Send className="mr-2" />}
                                    {isLoading ? 'Enviando...' : 'Enviar Solicitud'}
                                </Button>
                            </div>
                        </form>
                   </Form>
                </CardContent>
            </Card>
        </div>
    );
}
