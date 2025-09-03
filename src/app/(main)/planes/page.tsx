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
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// i18n
import { useLang } from "@/lib/use-lang";
import { translations } from "@/lib/translations";

function UsageBar({
  label,
  icon,
  current,
  limit,
}: {
  label: string;
  icon: React.ReactNode;
  current: number;
  limit: number;
}) {
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
          {isUnlimited ? "Ilimitado" : `${current} / ${limit}`}
        </span>
      </div>
      <Progress value={isUnlimited ? 100 : percentage} />
    </div>
  );
}

export default function AccountPage() {
  const lang = useLang("es");
  const t = translations[lang];

  const { profile, loading, user } = useAuth();
  const [isRequestingVendor, setIsRequestingVendor] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const renewalDateString = profile?.subscription?.renewalDate
    ? new Date(profile.subscription.renewalDate.seconds * 1000).toLocaleDateString(lang === "es" ? "es-ES" : "en-US")
    : "N/A";

  const handleManageSubscription = () => {
    router.push("/planes");
  };

  const handlePasswordChange = async () => {
    if (!profile?.email) return;
    try {
      await sendPasswordReset(profile.email);
      toast({
        title: lang === "es" ? "Correo de recuperación enviado" : "Password reset email sent",
        description:
          lang === "es"
            ? "Hemos enviado un enlace a tu correo para que puedas cambiar tu contraseña de forma segura."
            : "We've sent a secure link to your email so you can reset your password.",
      });
    } catch (error) {
      toast({
        title: lang === "es" ? "Error al enviar correo" : "Error sending email",
        description:
          lang === "es"
            ? "No se pudo enviar el correo de recuperación. Inténtalo de nuevo."
            : "Could not send the reset email. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout(router);
    } catch (error) {
      toast({
        title: lang === "es" ? "Error al cerrar sesión" : "Sign out error",
        description:
          lang === "es"
            ? "No se pudo cerrar la sesión. Inténtalo de nuevo."
            : "Could not sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVendorRequest = async () => {
    if (!user || !profile) return;
    setIsRequestingVendor(true);
    try {
      const result = await requestVendorRole();
      if (result.success) {
        toast({
          title: lang === "es" ? "Solicitud Enviada" : "Request Sent",
          description:
            lang === "es"
              ? "Tu solicitud para ser vendedor ha sido enviada. Recibirás una notificación cuando sea revisada."
              : "Your vendor request has been sent. We'll notify you once it's reviewed.",
        });
      } else {
        throw new Error(result.error || (lang === "es" ? "No se pudo enviar la solicitud." : "Could not send the request."));
      }
    } catch (error: any) {
      toast({
        title: lang === "es" ? "Error en la Solicitud" : "Request Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsRequestingVendor(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-5 w-2/3 mt-2" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1">
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-3">
                <Skeleton className="size-6 rounded-full" />
                <Skeleton className="h-6 w-full" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="size-6 rounded-full" />
                <Skeleton className="h-6 w-full" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="size-6 rounded-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-8 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-5 w-1/6" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-5 w-1/6" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-5 w-1/6" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                </div>
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
        <h1 className="text-4xl font-bold tracking-tight text-primary">
          {lang === "es" ? "Error de Cuenta" : "Account Error"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {lang === "es"
            ? "No se pudo cargar tu perfil. Por favor, intenta cerrar sesión y volver a entrar."
            : "We couldn't load your profile. Please sign out and sign in again."}
        </p>
        <Button onClick={handleLogout} variant="destructive" className="mt-4">
          <LogOut className="mr-2" />
          {lang === "es" ? "Cerrar Sesión" : "Sign Out"}
        </Button>
      </div>
    );
  }

  const { displayName, email, subscription, usage, role, vendorRequestStatus } = profile;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-primary">
          {lang === "es" ? "Mi Cuenta" : "My Account"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {lang === "es"
            ? "Gestiona tu perfil, suscripción y consulta tu uso mensual."
            : "Manage your profile, subscription and check your monthly usage."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-2xl">{lang === "es" ? "Perfil de Usuario" : "User Profile"}</CardTitle>
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
                <p className="font-semibold">
                  {lang === "es" ? "Plan" : "Plan"} {subscription?.plan || "N/A"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {lang === "es" ? "Estado" : "Status"}:{" "}
                  <span className="text-green-400 font-medium">{subscription?.status || "N/A"}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="text-primary" />
              <div>
                <p className="font-semibold">{lang === "es" ? "Próxima Renovación" : "Next Renewal"}</p>
                <p className="text-sm text-muted-foreground">{renewalDateString}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl">
              {lang === "es" ? "Consumo del Ciclo Actual" : "Current Cycle Usage"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-6">
              <UsageBar
                label={lang === "es" ? "Análisis de Vino" : "Wine Analyses"}
                icon={<Wine />}
                current={usage?.analyzeWine?.current || 0}
                limit={usage?.analyzeWine?.limit || 0}
              />
              <UsageBar
                label={lang === "es" ? "Recomendaciones" : "Recommendations"}
                icon={<Award />}
                current={usage?.recommendWine?.current || 0}
                limit={usage?.recommendWine?.limit || 0}
              />
              <UsageBar
                label={lang === "es" ? "Cenas Maridaje" : "Dinner Pairings"}
                icon={<Utensils />}
                current={usage?.pairDinner?.current || 0}
                limit={usage?.pairDinner?.limit || 0}
              />
            </div>

            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-semibold">
                {lang === "es" ? "Acciones de la Cuenta" : "Account Actions"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                <Button onClick={handleManageSubscription} className="w-full">
                  {lang === "es" ? "Gestionar Suscripción" : "Manage Subscription"}
                </Button>
                <Button onClick={handlePasswordChange} variant="secondary" className="w-full">
                  {lang === "es" ? "Cambiar Contraseña" : "Change Password"}
                </Button>

                <Button onClick={handleLogout} variant="destructive" className="w-full sm:col-span-2 lg:col-span-2">
                  <LogOut className="mr-2" />
                  {lang === "es" ? "Cerrar Sesión" : "Sign Out"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {role === "user" && (
        <Card>
          <CardHeader>
            <CardTitle>{lang === "es" ? "Conviértete en Afiliado" : "Become an Affiliate"}</CardTitle>
            <CardDescription>
              {lang === "es"
                ? "¿Te gustaría ganar comisiones recomendando SommelierPro AI? Completa nuestro formulario de solicitud."
                : "Want to earn commissions by recommending SommelierPro AI? Complete our application form."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {vendorRequestStatus === "pending" ? (
              <Alert variant="default" className="border-primary/30 bg-primary/10">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <AlertTitle className="text-primary">
                  {lang === "es" ? "Solicitud Pendiente" : "Request Pending"}
                </AlertTitle>
                <AlertDescription>
                  {lang === "es"
                    ? "Hemos recibido tu solicitud para ser vendedor. La revisaremos y te notificaremos pronto. ¡Gracias por tu interés!"
                    : "We have received your vendor request. We'll review it and notify you soon. Thank you for your interest!"}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center rounded-lg border p-4">
                  <div className="flex-grow">
                    <p className="font-semibold">
                      {lang === "es"
                        ? "Paso 1: Completa el formulario de solicitud"
                        : "Step 1: Complete the application form"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {lang === "es"
                        ? "Para evaluar tu perfil, por favor completa nuestro formulario de inscripción de referidos. Esto nos ayuda a conocerte mejor."
                        : "To evaluate your profile, please fill out our referral application form. This helps us know you better."}
                    </p>
                  </div>
                  <Button asChild>
                    <Link href="https://forms.gle/wbXsjwVfc1QZ3bmF9" target="_blank">
                      {lang === "es" ? "Ir al Formulario" : "Go to Form"} <ExternalLink className="ml-2" />
                    </Link>
                  </Button>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 items-center rounded-lg border p-4 mt-4">
                  <div className="flex-grow">
                    <p className="font-semibold">
                      {lang === "es" ? "Paso 2: Solicita tu rol en la app" : "Step 2: Request your role in the app"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {lang === "es"
                        ? "Una vez que hayas enviado el formulario, haz clic aquí. Verificaremos tu envío y activaremos tu rol de vendedor."
                        : "Once you have submitted the form, click here. We will verify your submission and activate your vendor role."}
                    </p>
                  </div>
                  <Button
                    onClick={handleVendorRequest}
                    disabled={
                      isRequestingVendor ||
                      ((vendorRequestStatus as any) === "pending" || vendorRequestStatus === "approved")
                    }
                    variant="secondary"
                  >
                    {isRequestingVendor ? <Loader2 className="animate-spin mr-2" /> : <Briefcase className="mr-2" />}
                    {lang === "es" ? "Solicitar Rol de Vendedor" : "Request Vendor Role"}
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
