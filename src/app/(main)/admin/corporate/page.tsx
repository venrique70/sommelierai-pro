"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building, Check, Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { useToast } from "@/hooks/use-toast";
import { requestCorporateInfo, getCorporateInfo } from "./actions";
import {
  RequestCorporateInfoClientSchema,
  GetCorporateInfoInputSchema,
} from "@/lib/schemas";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// i18n mínimo
import { useLang } from "@/lib/use-lang";

type CorporateInfoRequestValues = z.infer<
  typeof RequestCorporateInfoClientSchema
>;
type UnlockFormValues = z.infer<typeof GetCorporateInfoInputSchema>;

// Data base (ES)
const corporatePlans = {
  copaPremium: {
    name: "Plan Copa Premium",
    features: [
      "30 Análisis Sensoriales al mes",
      "15 Recomendaciones de Vino",
      "10 Cenas Maridaje",
    ],
    pricing: [
      { subscriptions: 10, monthly: 117.9, yearly: 1109.9 },
      { subscriptions: 15, monthly: 176.9, yearly: 1664.9 },
      { subscriptions: 20, monthly: 235.9, yearly: 2219.9 },
      { subscriptions: 25, monthly: 294.9, yearly: 2774.9 },
    ],
  },
  sibarita: {
    name: "Plan Sibarita",
    features: [
      "60 Análisis Sensoriales al mes",
      "20 Recomendaciones de Vino",
      "15 Cenas Maridaje",
      "Análisis por Ficha",
      "Mi Bodega Personal",
      "Mi Historial de Análisis",
      "Mi Carta (Restaurante)",
      "Acceso anticipado a funciones beta",
      "Acumulación de análisis no utilizados",
      "Reconocimiento como Embajador",
    ],
    pricing: [
      { subscriptions: 10, monthly: 179.9, yearly: 1707.9 },
      { subscriptions: 15, monthly: 269.9, yearly: 2651.9 },
      { subscriptions: 20, monthly: 362.9, yearly: 3416.9 },
      { subscriptions: 25, monthly: 453.9, yearly: 4269.9 },
    ],
  },
} as const;

// EN copies para features
const featuresEN: Record<keyof typeof corporatePlans, string[]> = {
  copaPremium: [
    "30 Sensory Analyses per month",
    "15 Wine Recommendations",
    "10 Dinner Pairings",
  ],
  sibarita: [
    "60 Sensory Analyses per month",
    "20 Wine Recommendations",
    "15 Dinner Pairings",
    "Sheet-based Analysis",
    "My Personal Cellar",
    "My Analysis History",
    "My Menu (Restaurant)",
    "Early access to beta features",
    "Carry-over of unused analyses",
    "Ambassador recognition",
  ],
};

function PlanDetailCard({
  plan,
  billingCycle,
  lang,
}: {
  plan: (typeof corporatePlans)["copaPremium"];
  billingCycle: "monthly" | "yearly";
  lang: "es" | "en";
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">{plan.name}</CardTitle>
        <CardDescription>
          {lang === "es" ? "Detalles y precios por volumen." : "Details and volume pricing."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 flex-grow">
        <ul className="space-y-2 text-muted-foreground">
          {(lang === "es" ? plan.features : featuresEN[plan.name.includes("Sibarita") ? "sibarita" : "copaPremium"]).map(
            (feature, i) => (
              <li key={i} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{feature}</span>
              </li>
            ),
          )}
        </ul>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                {lang === "es" ? "Suscripciones" : "Subscriptions"}
              </TableHead>
              <TableHead className="text-right">
                {lang === "es" ? "Precio" : "Price"}{" "}
                {billingCycle === "monthly"
                  ? lang === "es"
                    ? "Mensual"
                    : "Monthly"
                  : lang === "es"
                  ? "Anual"
                  : "Yearly"}{" "}
                (USD)
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plan.pricing.map((tier) => (
              <TableRow key={tier.subscriptions}>
                <TableCell>{tier.subscriptions}</TableCell>
                <TableCell className="text-right font-semibold">
                  $
                  {(
                    billingCycle === "monthly" ? tier.monthly : tier.yearly
                  ).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

const CorporateInfoView = () => {
  const lang = useLang("es");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
  );

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-primary">
          {lang === "es"
            ? "Planes Corporativos Exclusivos"
            : "Exclusive Corporate Plans"}
        </h2>
        <p className="text-muted-foreground mt-2">
          {lang === "es"
            ? "Soluciones diseñadas para potenciar tu negocio."
            : "Solutions designed to power your business."}
        </p>
      </div>
      <div className="flex items-center justify-center space-x-2">
        <Button
          variant={billingCycle === "monthly" ? "default" : "ghost"}
          onClick={() => setBillingCycle("monthly")}
        >
          {lang === "es" ? "Facturación Mensual" : "Monthly Billing"}
        </Button>
        <Button
          variant={billingCycle === "yearly" ? "default" : "ghost"}
          onClick={() => setBillingCycle("yearly")}
        >
          {lang === "es"
            ? "Facturación Anual (Ahorra 15%)"
            : "Yearly Billing (Save 15%)"}
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <PlanDetailCard
          plan={corporatePlans.copaPremium}
          billingCycle={billingCycle}
          lang={lang}
        />
        <PlanDetailCard
          plan={corporatePlans.sibarita}
          billingCycle={billingCycle}
          lang={lang}
        />
      </div>
    </div>
  );
};

export default function CorporatePage() {
  const lang = useLang("es");
  const [view, setView] = useState<"form" | "success" | "unlocked">("form");
  const [isLoading, setIsLoading] = useState(false);
  const [unlockError, setUnlockError] = useState("");
  const { toast } = useToast();

  const requestForm = useForm<CorporateInfoRequestValues>({
    resolver: zodResolver(RequestCorporateInfoClientSchema),
    defaultValues: { companyName: "", contactName: "", contactEmail: "" },
  });

  const unlockForm = useForm<UnlockFormValues>({
    resolver: zodResolver(GetCorporateInfoInputSchema),
    defaultValues: { accessCode: "" },
  });

  const handleRequestSubmit = async (data: CorporateInfoRequestValues) => {
    setIsLoading(true);
    try {
      const result = await requestCorporateInfo(data);
      if (result.success) {
        setView("success");
      } else {
        throw new Error(result.error || "Ocurrió un error inesperado.");
      }
    } catch (error: any) {
      toast({
        title: lang === "es" ? "Error en la Solicitud" : "Request Error",
        description:
          error.message ||
          (lang === "es"
            ? "No se pudo completar la solicitud."
            : "The request could not be completed."),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlockSubmit = async (data: UnlockFormValues) => {
    setIsLoading(true);
    setUnlockError("");
    try {
      const result = await getCorporateInfo(data);
      if (result.success) {
        setView("unlocked");
      } else {
        setUnlockError(
          result.error ||
            (lang === "es" ? "Código inválido o expirado." : "Invalid or expired code."),
        );
      }
    } catch (error: any) {
      setUnlockError(
        error.message ||
          (lang === "es"
            ? "Ocurrió un error al verificar el código."
            : "An error occurred verifying the code."),
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (view === "unlocked") {
    return <CorporateInfoView />;
  }

  if (view === "success") {
    return (
      <div className="flex flex-col items-center justify-center text-center space-y-6 max-w-2xl mx-auto py-12">
        <div className="p-4 bg-green-500/20 rounded-full">
          <Check className="size-16 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-primary">
          {lang === "es" ? "¡Solicitud Recibida!" : "Request Received!"}
        </h1>
        <p className="text-xl text-muted-foreground">
          {lang === "es"
            ? "Hemos enviado un correo electrónico con tu código de acceso único. Por favor, revísalo para ver nuestros planes corporativos."
            : "We’ve sent you an email with your unique access code. Please check it to view our corporate plans."}
        </p>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>
              {lang === "es" ? "¿No recibiste el correo?" : "Didn’t receive the email?"}
            </CardTitle>
            <CardDescription>
              {lang === "es"
                ? "Introduce el código que te hemos enviado para desbloquear la información."
                : "Enter the code we sent you to unlock the information."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...unlockForm}>
              <form
                onSubmit={unlockForm.handleSubmit(handleUnlockSubmit)}
                className="flex items-start gap-4"
              >
                <FormField
                  control={unlockForm.control}
                  name="accessCode"
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                      <FormControl>
                        <Input
                          placeholder={
                            lang === "es" ? "Tu código de acceso..." : "Your access code..."
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : null}
                  {isLoading ? (lang === "es" ? "Desbloqueando…" : "Unlocking…") : (lang === "es" ? "Desbloquear" : "Unlock")}
                </Button>
              </form>
              {unlockError && (
                <p className="text-sm text-destructive mt-2">{unlockError}</p>
              )}
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-primary flex items-center gap-3">
          <Building />
          {lang === "es" ? "Planes Corporativos" : "Corporate Plans"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {lang === "es"
            ? "Potencia a tu equipo o añade valor a tus clientes con SommelierPro AI. Ideal para bodegas, distribuidoras, restaurantes y hoteles."
            : "Empower your team or add value to your clients with SommelierPro AI. Ideal for wineries, distributors, restaurants and hotels."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {lang === "es" ? "Solicita Información Exclusiva" : "Request Exclusive Information"}
          </CardTitle>
          <CardDescription>
            {lang === "es"
              ? "Completa el formulario para recibir un código de acceso por correo y ver nuestros planes diseñados para empresas."
              : "Fill out the form to receive an access code by email and view our plans designed for companies."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...requestForm}>
            <form onSubmit={requestForm.handleSubmit(handleRequestSubmit)} className="space-y-6">
              <FormField
                control={requestForm.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {lang === "es" ? "Nombre de la Empresa" : "Company Name"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          lang === "es" ? "Ej. Restaurante La Cava" : "e.g., La Cava Restaurant"
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={requestForm.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {lang === "es" ? "Nombre del Contacto" : "Contact Name"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={lang === "es" ? "Ej. Juan Pérez" : "e.g., John Smith"}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={requestForm.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {lang === "es" ? "Email del Contacto" : "Contact Email"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder={
                            lang === "es" ? "juan.perez@ejemplo.com" : "john.smith@example.com"
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="text-center pt-4">
                <Button size="lg" type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Send className="mr-2" />}
                  {isLoading ? (lang === "es" ? "Enviando..." : "Sending...") : (lang === "es" ? "Enviar Solicitud" : "Send Request")}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
