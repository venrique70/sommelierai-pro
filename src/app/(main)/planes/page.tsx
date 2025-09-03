"use client";

import { Check, Star, Loader2, Building } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

// i18n
import { useLang } from "@/lib/use-lang";
import { translations } from "@/lib/translations";

type PlanIdentifier = "descubrete" | "iniciado" | "una_copa" | "copa_premium" | "sibarita";
type BillingCycle = "monthly" | "yearly";

type Plan = {
  id: PlanIdentifier;
  name: string;
  description: string;
  price: { monthly: number; yearly: number };
  features: string[];
  cta: string;
  isCurrent?: boolean;
  isPopular?: boolean;
  lemonSqueezyLink: { monthly: string; yearly: string };
  payPalPlanId: { monthly: string; yearly: string };
};

const plansData: Plan[] = [
  {
    id: "descubrete",
    name: "Descúbrete",
    description:
      "Atrévete a descubrir el placer de los vinos y licores. Explora tus sentidos y abre la puerta a un mundo de aromas y sensaciones inolvidables.",
    price: { monthly: 0, yearly: 0 },
    features: ["5 Análisis Sensoriales al mes", "1 Recomendación de Vino"],
    cta: "Tu Plan Actual",
    lemonSqueezyLink: { monthly: "", yearly: "" },
    payPalPlanId: { monthly: "", yearly: "" },
  },
  {
    id: "iniciado",
    name: "Iniciado",
    description:
      "Empieza tu viaje por el fascinante universo de vinos y licores. Aprende, disfruta y crece con cada copa y cada trago.",
    price: { monthly: 3.99, yearly: 39.9 },
    features: ["8 Análisis Sensoriales al mes", "2 Recomendaciones de Vino", "Historial de Uso"],
    cta: "Subir a Iniciado",
    lemonSqueezyLink: {
      monthly: "https://sommelierproai.lemonsqueezy.com/buy/0e3918a9-92af-4b71-a304-6d52c9782cfe",
      yearly: "https://sommelierproai.lemonsqueezy.com/buy/47fef671-dc74-4693-8ee5-6ecad46a4e2b",
    },
    payPalPlanId: { monthly: "P-03451566SM055894PNCEVTYQ", yearly: "P-6C360058FU8751411NCEVI2A" },
  },
  {
    id: "una_copa",
    name: "Una Copa",
    description:
      "Convierte cada copa en una experiencia única. Recomendaciones y maridajes que elevan el sabor de tus vinos y licores favoritos.",
    price: { monthly: 7.99, yearly: 79.9 },
    isPopular: true,
    features: ["12 Análisis Sensoriales al mes", "5 Recomendaciones de Vino", "2 Cenas Maridaje", "Soporte por Email"],
    cta: "Subir a Una Copa",
    lemonSqueezyLink: {
      monthly: "https://sommelierproai.lemonsqueezy.com/buy/cf1cd8c4-9982-4225-a43f-654cfff501c4",
      yearly: "https://sommelierproai.lemonsqueezy.com/buy/f7e585a7-90fd-4f1a-97ac-568027cfb0f6",
    },
    payPalPlanId: { monthly: "P-6V154660MP480493JNCEVZMQ", yearly: "P-73Y70148Y9205371BNCEVPDY" },
  },
  {
    id: "copa_premium",
    name: "Copa Premium",
    description:
      "Sumérgete en la excelencia del vino y el licor con análisis detallados y cenas exclusivas. Para quienes buscan lo mejor en cada sorbo.",
    price: { monthly: 12.99, yearly: 129.9 },
    features: ["30 Análisis Sensoriales al mes", "15 Recomendaciones de Vino", "10 Cenas Maridaje"],
    cta: "Subir a Premium",
    lemonSqueezyLink: {
      monthly: "https://sommelierproai.lemonsqueezy.com/buy/783d7bd9-ff48-4795-96fe-9448a7d53f7b",
      yearly: "https://sommelierproai.lemonsqueezy.com/buy/81880b86-b61e-4128-9b41-1cfaf29de602",
    },
    payPalPlanId: { monthly: "P-82K13295DW5680202NCEV2WY", yearly: "P-48C0924078583004PNCEVQBY" },
  },
  {
    id: "sibarita",
    name: "Sibarita",
    description:
      "La experiencia definitiva para los amantes de vinos y licores más exigentes. Maridajes exclusivos, cenas selectas y un mundo de sabores para explorar.",
    price: { monthly: 19.99, yearly: 199.9 },
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
    cta: "Subir a Sibarita",
    lemonSqueezyLink: {
      monthly: "https://sommelierproai.lemonsqueezy.com/buy/ac2453f2-88b3-4a8c-8661-09a3ba9d3aab",
      yearly: "https://sommelierproai.lemonsqueezy.com/buy/3c95f384-e3b1-425b-92b3-77ff01666091",
    },
    payPalPlanId: { monthly: "P-0JK36575PD651091NNCEV3RA", yearly: "P-03U55368J9946653MNCEVRLQ" },
  },
];

export default function PlanesPage() {
  const lang = useLang("es");
  const t = translations[lang];

  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // EN mappings (solo textos)
  const descriptionsEN: Record<PlanIdentifier, string> = {
    descubrete:
      "Dare to discover the pleasure of wine and spirits. Explore your senses and open the door to a world of aromas and unforgettable sensations.",
    iniciado:
      "Begin your journey through the fascinating universe of wine and spirits. Learn, enjoy and grow with every sip.",
    una_copa:
      "Turn every glass into a unique experience. Recommendations and pairings that elevate your favorite wines and spirits.",
    copa_premium:
      "Dive into excellence with detailed analyses and exclusive dinners. For those who seek the very best.",
    sibarita:
      "The ultimate experience for the most demanding wine and spirits lovers. Exclusive pairings, select dinners and a world of flavors to explore.",
  };

  const featuresEN: Record<PlanIdentifier, string[]> = {
    descubrete: ["5 Sensory Analyses / month", "1 Wine Recommendation"],
    iniciado: ["8 Sensory Analyses / month", "2 Wine Recommendations", "Usage History"],
    una_copa: ["12 Sensory Analyses / month", "5 Wine Recommendations", "2 Dinner Pairings", "Email Support"],
    copa_premium: ["30 Sensory Analyses / month", "15 Wine Recommendations", "10 Dinner Pairings"],
    sibarita: [
      "60 Sensory Analyses / month",
      "20 Wine Recommendations",
      "15 Dinner Pairings",
      "Sheet-based Analysis",
      "My Personal Cellar",
      "My Analysis History",
      "My Menu (Restaurant)",
      "Early access to beta features",
      "Carry-over of unused analyses",
      "Recognition as Ambassador",
    ],
  };

  const ctaEN: Record<PlanIdentifier, string> = {
    descubrete: "Current Plan",
    iniciado: "Upgrade to Iniciado",
    una_copa: "Upgrade to Una Copa",
    copa_premium: "Upgrade to Premium",
    sibarita: "Upgrade to Sibarita",
  };

  const handleLemonSqueezyCheckout = (plan: Plan) => {
    if (!user) {
      toast({
        title: lang === "es" ? "Necesitas una cuenta" : "Account required",
        description:
          lang === "es"
            ? "Por favor, inicia sesión para poder suscribirte a un plan."
            : "Please sign in to subscribe to a plan.",
        action: (
          <Button onClick={() => router.push("/login")} size="sm">
            {lang === "es" ? "Iniciar Sesión" : "Sign In"}
          </Button>
        ),
      });
      return;
    }
    const checkoutUrl = plan.lemonSqueezyLink[billingCycle];
    const urlWithEmail = `${checkoutUrl}?checkout[email]=${encodeURIComponent(user.email || "")}`;
    setLoadingPlan(`lemonsqueezy-${plan.id}`);
    router.push(urlWithEmail);
  };

  const currentPlanId = profile?.subscription?.plan
    ? profile.subscription.plan.toLowerCase().replace(/ /g, "_")
    : undefined;

  return (
    <div className="flex flex-col items-center w-full max-w-7xl mx-auto p-4 sm:p-6">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-5xl font-extrabold tracking-tight text-primary">
          {lang === "es" ? "Un Plan Para Cada Paladar" : "A Plan for Every Palate"}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          {lang === "es"
            ? "Desde el aficionado curioso hasta el sommelier profesional, tenemos el plan perfecto para potenciar tu pasión por el vino."
            : "From the curious enthusiast to the professional sommelier, we have the perfect plan to boost your passion for wine."}
        </p>
        <div className="flex items-center justify-center space-x-3 pt-4">
          <Label htmlFor="billing-cycle" className="font-medium text-lg">
            {lang === "es" ? "Pago Mensual" : "Monthly Billing"}
          </Label>
          <Switch
            id="billing-cycle"
            checked={billingCycle === "yearly"}
            onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
            aria-label={lang === "es" ? "Cambiar a facturación anual" : "Switch to yearly billing"}
          />
          <Label htmlFor="billing-cycle" className="font-medium text-lg">
            {lang === "es" ? "Pago Anual" : "Yearly Billing"}
            <span className="ml-2 text-xs font-bold text-green-400 bg-green-400/20 px-2 py-1 rounded-full">
              {lang === "es" ? "AHORRA 2 MESES" : "SAVE 2 MONTHS"}
            </span>
          </Label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 w-full items-stretch">
        {plansData.map((plan) => {
          const isCurrent = plan.id === currentPlanId;
          const isFree = plan.price.monthly === 0;

          const description = lang === "es" ? plan.description : descriptionsEN[plan.id];
          const features = lang === "es" ? plan.features : featuresEN[plan.id];
          const ctaText = isCurrent
            ? lang === "es"
              ? "Tu Plan Actual"
              : "Current Plan"
            : lang === "es"
            ? plan.cta
            : ctaEN[plan.id];

          return (
            <Card
              key={plan.id}
              className={cn(
                "flex flex-col rounded-2xl transition-all",
                plan.isPopular && !isCurrent && "border-primary shadow-primary/20 shadow-2xl scale-105",
                isCurrent && "bg-accent/50 border-primary"
              )}
            >
              {plan.isPopular && (
                <div className="bg-primary text-primary-foreground text-center text-sm font-bold py-1 rounded-t-2xl flex items-center justify-center gap-2">
                  <Star className="size-4" /> {lang === "es" ? "MÁS POPULAR" : "MOST POPULAR"}
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-base min-h-[60px]">{description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-6">
                <div className="text-center">
                  <span className="text-5xl font-extrabold">
                    ${billingCycle === "monthly" ? plan.price.monthly.toFixed(2) : plan.price.yearly.toFixed(2)}
                  </span>
                  <span className="text-muted-foreground">
                    {isFree
                      ? lang === "es"
                        ? "/ Gratis"
                        : "/ Free"
                      : billingCycle === "monthly"
                      ? lang === "es"
                        ? "/mes"
                        : "/mo"
                      : lang === "es"
                      ? "/año"
                      : "/yr"}
                  </span>
                </div>
                <ul className="space-y-3 text-muted-foreground text-left">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="size-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex-col gap-2">
                {isCurrent ? (
                  <Button className="w-full text-lg py-6" disabled>
                    {lang === "es" ? "Tu Plan Actual" : "Current Plan"}
                  </Button>
                ) : isFree ? (
                  <Button className="w-full text-lg py-6" disabled>
                    {ctaText}
                  </Button>
                ) : (
                  <Button
                    className="w-full text-lg py-6"
                    variant="default"
                    onClick={() => handleLemonSqueezyCheckout(plan)}
                    disabled={loadingPlan === `lemonsqueezy-${plan.id}`}
                  >
                    {loadingPlan === `lemonsqueezy-${plan.id}` ? (
                      <Loader2 className="animate-spin" />
                    ) : lang === "es" ? (
                      "Pagar con Tarjeta"
                    ) : (
                      "Pay with Card"
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="w-full max-w-5xl mx-auto mt-20">
        <Card className="bg-gradient-to-r from-card to-secondary border-primary/30">
          <div className="grid md:grid-cols-1 items-center">
            <div className="p-8 text-center">
              <Building className="size-10 text-primary mb-4 mx-auto" />
              <h2 className="text-3xl font-bold text-primary">
                {lang === "es" ? "Plan Corporativo" : "Corporate Plan"}
              </h2>
              <p className="text-muted-foreground mt-2 max-w-3xl mx-auto">
                {lang === "es"
                  ? "Potencia a tu equipo o añade valor a tus clientes con SommelierPro AI. Ideal para bodegas, distribuidoras, restaurantes y hoteles."
                  : "Empower your team or add value to your clients with SommelierPro AI. Ideal for wineries, distributors, restaurants and hotels."}
              </p>
              <ul className="space-y-2 text-muted-foreground mt-4 inline-block text-left">
                <li className="flex items-start">
                  <Check className="size-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{lang === "es" ? "Cuentas para todo tu personal." : "Accounts for your entire staff."}</span>
                </li>
                <li className="flex items-start">
                  <Check className="size-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{lang === "es" ? "Límites de uso personalizados." : "Custom usage limits."}</span>
                </li>
                <li className="flex items-start">
                  <Check className="size-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{lang === "es" ? "Soporte prioritario y formación." : "Priority support and training."}</span>
                </li>
              </ul>
              <div className="mt-6">
                <Button asChild size="lg">
                  <a href="mailto:venrique70@gmail.com">
                    {lang === "es" ? "Contactar para una Cotización" : "Contact for a Quote"}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <p className="text-center text-muted-foreground mt-12 max-w-md">
        {lang === "es" ? (
          <>
            ¿Necesitas algo más? Para bodegas, distribuidores o requerimientos especiales, el Plan Sibarita es
            totalmente personalizable.{" "}
            <Link href="#" className="underline text-primary">
              Contáctanos para más detalles
            </Link>
            .
          </>
        ) : (
          <>
            Need something else? For wineries, distributors or special requirements, the Sibarita Plan is fully
            customizable.{" "}
            <Link href="#" className="underline text-primary">
              Contact us for more details
            </Link>
            .
          </>
        )}
      </p>
    </div>
  );
}
