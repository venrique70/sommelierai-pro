
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Wine, Award, Utensils, User, Calendar, HandCoins, LogOut, Briefcase, Loader2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { sendPasswordReset, logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { requestVendorRole } from "./actions";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


function UsageBar({ label, icon, current, limit }: { label: string, icon: React.ReactNode, current: number, limit: number }) {
  const percentage = limit > 0 ? (current / limit) * 100 : 0;
  const isUnlimited = limit >= 9999;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            {icon}
            <span className="font-medium text-sm">{label}</span>
        </div>
        <span className="text-sm text-muted-foreground">
            {isUnlimited ? 'Ilimitado' : `${current} / ${limit}`}
        </span>
      </div>
      <Progress value={isUnlimited ? 100 : percentage} />
    </div>
  );
}

export default function AccountPage() {
  const { profile, loading, user } = useAuth();
  const [isRequestingVendor, setIsRequestingVendor] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);


  const renewalDateString = profile?.subscription?.renewalDate
    ? new Date(profile.subscription.renewalDate.seconds * 1000).toLocaleDateString()
    : 'N/A';

  const handleManageSubscription = () => {
     router.push('/planes');
  };

   const handlePasswordChange = async () => {
     if (!profile?.email) return;
     try {
        await sendPasswordReset(profile.email);
        toast({
            title: "Correo de recuperación enviado",
            description: "Hemos enviado un enlace a tu correo para que puedas cambiar tu contraseña de forma segura.",
        });
     } catch (error) {
        toast({
            title: "Error al enviar correo",
            description: "No se pudo enviar el correo de recuperación. Inténtalo de nuevo.",
            variant: "destructive",
        });
     }
  };

  const handleLogout = async () => {
    try {
        await logout(router);
    } catch(error) {
         toast({
            title: "Error al cerrar sesión",
            description: "No se pudo cerrar la sesión. Inténtalo de nuevo.",
            variant: "destructive",
        });
    }
  }

  const handleVendorRequest = async () => {
    if (!user || !profile) return;
    setIsRequestingVendor(true);
    try {
        const result = await requestVendorRole();
        if(result.success) {
            toast({
                title: "Solicitud Enviada",
                description: "Tu solicitud para ser vendedor ha sido enviada. Recibirás una notificación cuando sea revisada.",
            });
        } else {
            throw new Error(result.error || "No se pudo enviar la solicitud.");
        }
    } catch (error: any) {
        toast({
            title: "Error en la Solicitud",
            description: error.message,
            variant: "destructive",
        });
    } finally {
        setIsRequestingVendor(false);
    }
  }


  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-5 w-2/3 mt-2" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1">
                <CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-3"><Skeleton className="size-6 rounded-full" /><Skeleton className="h-6 w-full" /></div>
                    <div className="flex items-center gap-3"><Skeleton className="size-6 rounded-full" /><Skeleton className="h-6 w-full" /></div>
                    <div className="flex items-center gap-3"><Skeleton className="size-6 rounded-full" /><Skeleton className="h-6 w-full" /></div>
                </CardContent>
            </Card>
             <Card className="lg:col-span-2">
                <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
                <CardContent className="space-y-8">
                    <div className="space-y-6">
                        <div className="space-y-2"><div className="flex justify-between"><Skeleton className="h-5 w-1/4" /><Skeleton className="h-5 w-1/6" /></div><Skeleton className="h-4 w-full" /></div>
                        <div className="space-y-2"><div className="flex justify-between"><Skeleton className="h-5 w-1/4" /><Skeleton className="h-5 w-1/6" /></div><Skeleton className="h-4 w-full" /></div>
                        <div className="space-y-2"><div className="flex justify-between"><Skeleton className="h-5 w-1/4" /><Skeleton className="h-5 w-1/6" /></div><Skeleton className="h-4 w-full" /></div>
                    </div>
                     <div className="border-t pt-6 flex flex-col sm:flex-row gap-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    );
  }
  
  if (!profile) {
      return (
        <div>
            <h1 className="text-4xl font-bold tracking-tight text-primary">Error de Cuenta</h1>
            <p className="text-muted-foreground mt-2">No se pudo cargar tu perfil. Por favor, intenta cerrar sesión y volver a entrar.</p>
            <Button onClick={handleLogout} variant="destructive" className="mt-4">
                <LogOut className="mr-2" />
                Cerrar Sesión
            </Button>
        </div>
      )
  }

  const { displayName, email, subscription, usage, role, vendorRequestStatus } = profile;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-primary">Mi Cuenta</h1>
        <p className="text-muted-foreground mt-2">Gestiona tu perfil, suscripción y consulta tu uso mensual.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-2xl">Perfil de Usuario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="text-primary" />
              <div>
                <p className="font-semibold">{displayName}</p>
                <p className="text-sm text-muted-foreground">{email}</p>
              </div>
            </div>
             <div className="flex items-center gap-3">
              <HandCoins className="text-primary" />
              <div>
                <p className="font-semibold">Plan {subscription?.plan || 'N/A'}</p>
                <p className="text-sm text-muted-foreground">Estado: <span className="text-green-400 font-medium">{subscription?.status || 'N/A'}</span></p>
              </div>
            </div>
             <div className="flex items-center gap-3">
              <Calendar className="text-primary" />
              <div>
                <p className="font-semibold">Próxima Renovación</p>
                <p className="text-sm text-muted-foreground">{renewalDateString}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
           <CardHeader>
            <CardTitle className="text-2xl">Consumo del Ciclo Actual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
             <div className="space-y-6">
                <UsageBar label="Análisis de Vino" icon={<Wine />} current={usage?.analyzeWine?.current || 0} limit={usage?.analyzeWine?.limit || 0} />
                <UsageBar label="Recomendaciones" icon={<Award />} current={usage?.recommendWine?.current || 0} limit={usage?.recommendWine?.limit || 0} />
                <UsageBar label="Cenas Maridaje" icon={<Utensils />} current={usage?.pairDinner?.current || 0} limit={usage?.pairDinner?.limit || 0} />
             </div>
             
             <div className="border-t pt-6 space-y-4">
                <h3 className="text-lg font-semibold">Acciones de la Cuenta</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                    <Button onClick={handleManageSubscription} className="w-full">Gestionar Suscripción</Button>
                    <Button onClick={handlePasswordChange} variant="secondary" className="w-full">Cambiar Contraseña</Button>
                    
                    <Button onClick={handleLogout} variant="destructive" className="w-full sm:col-span-2 lg:col-span-2">
                        <LogOut className="mr-2" />
                        Cerrar Sesión
                    </Button>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>

       {role === 'user' && (
         <Card>
            <CardHeader>
                <CardTitle>Conviértete en Afiliado</CardTitle>
                <CardDescription>¿Te gustaría ganar comisiones recomendando SommelierPro AI? Completa nuestro formulario de solicitud.</CardDescription>
            </CardHeader>
            <CardContent>
                 {vendorRequestStatus === 'pending' ? (
                    <Alert variant="default" className="border-primary/30 bg-primary/10">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <AlertTitle className="text-primary">Solicitud Pendiente</AlertTitle>
                        <AlertDescription>
                            Hemos recibido tu solicitud para ser vendedor. La revisaremos y te notificaremos pronto. ¡Gracias por tu interés!
                        </AlertDescription>
                    </Alert>
                ) : (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4 items-center rounded-lg border p-4">
                            <div className="flex-grow">
                                <p className="font-semibold">Paso 1: Completa el formulario de solicitud</p>
                                <p className="text-sm text-muted-foreground">Para evaluar tu perfil, por favor completa nuestro formulario de inscripción de referidos. Esto nos ayuda a conocerte mejor.</p>
                            </div>
                            <Button asChild>
                               <Link href="https://forms.gle/wbXsjwVfc1QZ3bmF9" target="_blank">
                                    Ir al Formulario <ExternalLink className="ml-2"/>
                               </Link>
                            </Button>
                        </div>
                         <div className="flex flex-col sm:flex-row gap-4 items-center rounded-lg border p-4 mt-4">
                            <div className="flex-grow">
                                <p className="font-semibold">Paso 2: Solicita tu rol en la app</p>
                                <p className="text-sm text-muted-foreground">Una vez que hayas enviado el formulario, haz clic aquí. Verificaremos tu envío y activaremos tu rol de vendedor.</p>
                            </div>
                             <Button onClick={handleVendorRequest} disabled={isRequestingVendor || ((vendorRequestStatus as any) === 'pending' || vendorRequestStatus === 'approved')} variant="secondary">
                                {isRequestingVendor ? <Loader2 className="animate-spin mr-2"/> : <Briefcase className="mr-2"/>}
                                Solicitar Rol de Vendedor
                             </Button>
                        </div>
                    </div>
                )}
            </CardContent>
         </Card>
      )}

    </div>
  );
}

    