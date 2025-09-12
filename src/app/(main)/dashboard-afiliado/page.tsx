"use client";

import { useEffect, useState, useTransition, useMemo } from "react";
import { Users, DollarSign, TrendingUp, Award, Check, Info, ExternalLink, Building } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

import {
  getVendorMetrics,
  saveAffiliateLink,
  registerCorporateSale,
  type VendorMetrics,
  type VendorLevel,
} from "./actions";
import { RegisterCorporateSaleSchema, type RegisterCorporateSaleInput } from "@/lib/schemas";

// i18n
import { useLang } from "@/lib/use-lang";
import { translations } from "@/lib/translations";

// ⬇️ schema para el formulario de solicitud
import { z } from "zod";
const ApprovalFormSchema = z.object({
  firstName: z.string().min(2, "Nombre muy corto"),
  lastName: z.string().min(2, "Apellido muy corto"),
  idNumber: z.string().min(4, "Documento inválido"),
  phone: z.string().min(6, "Teléfono inválido"),
  country: z.string().min(2, "País inválido"),
  motivation: z.string().min(10, "Cuéntanos un poco más"),
});

type ApprovalForm = z.infer<typeof ApprovalFormSchema>;

/* ───────────────────────── VendorOnboarding (inline) ───────────────────────── */

type VendorStatus = "none" | "pending" | "approved";

function VendorOnboardingInline({
  email,
  vendorStatus = "none",
  affiliateLink,
  onAffiliateLinkChange,
  onSaveAffiliateLink,
  onRequestApproval,
  savingLink,
}: {
  email?: string;
  vendorStatus?: VendorStatus;
  affiliateLink: string;
  onAffiliateLinkChange: (v: string) => void;
  onSaveAffiliateLink: () => void | Promise<void>;
  onRequestApproval: (data: ApprovalForm) => void | Promise<void>;
  savingLink?: boolean;
}) {
  const lang = useLang("es");
  const canRequest = useMemo(() => vendorStatus === "none" && !!email, [vendorStatus, email]);

  // ⬇️ form react-hook-form
  const form = useForm<ApprovalForm>({
    resolver: zodResolver(ApprovalFormSchema),
    defaultValues: { firstName: "", lastName: "", idNumber: "", phone: "", country: "", motivation: "" },
  });

  return (
    <Card className="border-primary/20 bg-card">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" />
          {lang === "es" ? "Tu Onboarding" : "Your Onboarding"}
        </CardTitle>
        <CardDescription>{lang === "es" ? "Te tomará un minuto." : "It takes one minute."}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 1) Solicitar aprobación */}
        <div className="rounded-md border p-4">
          <div className="font-semibold mb-3">
            {lang === "es" ? "1) Solicitar Aprobación" : "1) Request Approval"}
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            {lang === "es" ? (
              <>
                Al enviar tu solicitud, un admin revisará tu cuenta ({email ?? "tu email"}). Recibirás el estado en este mismo panel.
              </>
            ) : (
              <>
                After you send your request, an admin will review your account ({email ?? "your email"}). You’ll see the status here.
              </>
            )}
          </p>

          {/* ⬇️ Formulario de solicitud */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onRequestApproval)}
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{lang === "es" ? "Nombre" : "First Name"}</FormLabel>
                    <FormControl>
                      <Input placeholder={lang === "es" ? "Juan" : "John"} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{lang === "es" ? "Apellido" : "Last Name"}</FormLabel>
                    <FormControl>
                      <Input placeholder={lang === "es" ? "Pérez" : "Doe"} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="idNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{lang === "es" ? "Documento de Identidad" : "ID Number"}</FormLabel>
                    <FormControl>
                      <Input placeholder={lang === "es" ? "DNI/CE/Pasaporte" : "ID/Passport"} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{lang === "es" ? "Teléfono" : "Phone"}</FormLabel>
                    <FormControl>
                      <Input placeholder="+51 999 999 999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{lang === "es" ? "País" : "Country"}</FormLabel>
                    <FormControl>
                      <Input placeholder={lang === "es" ? "Perú" : "Peru"} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="motivation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {lang === "es"
                          ? "¿Por qué quieres ser referente de SommelierPro AI?"
                          : "Why do you want to be a SommelierPro AI advocate?"}
                      </FormLabel>
                      <FormControl>
                        <Input placeholder={lang === "es" ? "Cuéntanos brevemente..." : "Tell us briefly..."} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="md:col-span-2 mt-2">
                <Button type="submit" disabled={!canRequest}>
                  {lang === "es" ? "Enviar solicitud" : "Send request"}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* 2) Crear cuenta en Lemon */}
        <div className="rounded-md border p-4">
          <div className="font-semibold mb-1">{lang === "es" ? "2) Crear tu cuenta de afiliado" : "2) Create your affiliate account"}</div>
          <p className="text-sm text-muted-foreground">
            {lang === "es"
              ? "Abre el portal público y créate una cuenta. Ahí configurarás tus datos de pago."
              : "Open the public portal and create an account. Configure your payout details there."}
          </p>
          <div className="mt-3">
            <Button asChild variant="secondary">
              <a href="https://sommelierproai.lemonsqueezy.com/affiliates" target="_blank" rel="noopener noreferrer">
                {lang === "es" ? "Ir al portal de afiliados" : "Go to affiliate portal"} <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        {/* 3) Guardar enlace */}
        <div className="rounded-md border p-4">
          <div className="font-semibold mb-1">{lang === "es" ? "3) Guarda tu enlace de afiliado" : "3) Save your affiliate link"}</div>
          <p className="text-sm text-muted-foreground">
            {lang === "es"
              ? "Pega aquí tu enlace único de Lemon. Lo usaremos para cruzar ventas."
              : "Paste your unique Lemon link here. We’ll use it to match sales."}
          </p>

          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
            <Input
              value={affiliateLink}
              onChange={(e) => onAffiliateLinkChange(e.target.value)}
              placeholder={lang === "es" ? "https://tu-subdominio.lemonsqueezy.com/checkout/XXXX" : "https://your-subdomain.lemonsqueezy.com/checkout/XXXX"}
            />
            <Button onClick={onSaveAffiliateLink} disabled={!!savingLink}>
              {savingLink ? (lang === "es" ? "Guardando…" : "Saving…") : (lang === "es" ? "Guardar enlace" : "Save link")}
            </Button>
          </div>
        </div>

        {/* 4) Qué sigue */}
        <div className="rounded-md border p-4">
          <div className="font-semibold mb-1">{lang === "es" ? "¿Qué sigue?" : "What’s next?"}</div>
          <p className="text-sm text-muted-foreground">
            {lang === "es"
              ? "Cuando un admin te apruebe, verás tu panel completo con métricas, registro de ventas corporativas y más."
              : "Once an admin approves you, you’ll see your full dashboard with metrics, corporate sales logging and more."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─────────────────────── CommissionsSection (inline) ─────────────────────── */

function CommissionsSectionInline({ currentLevel }: { currentLevel?: VendorLevel }) {
  const lang = useLang("es");

  const COMMISSIONS_BY_USER = [
    { level: lang === "es" ? "Nuevo" : "New",    requirement: lang === "es" ? "0-4 Referidos" : "0-4 Referrals",   iniciado: "0%",  unaCopa: "0%",  copaPremium: "0%",  sibarita: "0%"  },
    { level: "Pregrado", requirement: lang === "es" ? "5-9 Referidos" : "5-9 Referrals",   iniciado: "5%",  unaCopa: "8%",  copaPremium: "10%", sibarita: "15%" },
    { level: "Bachelor", requirement: lang === "es" ? "10-19 Referidos" : "10-19 Referrals", iniciado: "7%",  unaCopa: "10%", copaPremium: "12%", sibarita: "17%" },
    { level: "Pro",      requirement: lang === "es" ? "20-29 Referidos" : "20-29 Referrals", iniciado: "9%",  unaCopa: "12%", copaPremium: "15%", sibarita: "18%" },
    { level: "Master",   requirement: lang === "es" ? "30+ Referidos" : "30+ Referrals",   iniciado: "11%", unaCopa: "15%", copaPremium: "17%", sibarita: "20%" },
  ] as const;

  const highlight = currentLevel ?? (lang === "es" ? "Bachelor" : "Bachelor");

  return (
    <div className="grid grid-cols-1 gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="text-primary" />
            {lang === "es" ? "Comisiones por Planes de Usuario" : "Commissions by User Plans"}
          </CardTitle>
          <CardDescription>
            {lang === "es"
              ? "Tu comisión por referidos individuales se basa en tu nivel y el plan del referido."
              : "Your commission for individual referrals depends on your level and the referred user’s plan."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{lang === "es" ? "Nivel" : "Level"}</TableHead>
                <TableHead>{lang === "es" ? "Requisito" : "Requirement"}</TableHead>
                <TableHead>Iniciado</TableHead>
                <TableHead>Una Copa</TableHead>
                <TableHead>Copa Premium</TableHead>
                <TableHead>Sibarita</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {COMMISSIONS_BY_USER.map((row) => {
                const isMe = row.level === highlight;
                return (
                  <TableRow key={row.level} className={isMe ? "bg-accent" : ""}>
                    <TableCell className="font-medium">
                      {row.level}
                      {isMe && (
                        <span className="ml-2 rounded border px-2 py-0.5 text-xs">
                          {lang === "es" ? "Tu Nivel" : "Your Level"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{row.requirement}</TableCell>
                    <TableCell>{row.iniciado}</TableCell>
                    <TableCell>{row.unaCopa}</TableCell>
                    <TableCell>{row.copaPremium}</TableCell>
                    <TableCell>{row.sibarita}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="text-primary" />
            {lang === "es" ? "Comisiones por Planes Corporativos" : "Commissions for Corporate Plans"}
          </CardTitle>
          <CardDescription>
            {lang === "es"
              ? "Comisiones especiales por la venta de planes corporativos por volumen."
              : "Special commissions for selling corporate plans in volume."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{lang === "es" ? "Volumen (Suscripciones)" : "Volume (Subscriptions)"}</TableHead>
                <TableHead>Copa Premium</TableHead>
                <TableHead>Sibarita</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { subscriptions: "10-15", copaPremium: "10%", sibarita: "15%" },
                { subscriptions: "16-20", copaPremium: "12%", sibarita: "17%" },
                { subscriptions: "21-25", copaPremium: "15%", sibarita: "20%" },
              ].map((row) => (
                <TableRow key={row.subscriptions}>
                  <TableCell className="font-medium">{row.subscriptions}</TableCell>
                  <TableCell>{row.copaPremium}</TableCell>
                  <TableCell>{row.sibarita}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

/* ───────────────────────────── Page ───────────────────────────── */

export default function AffiliateDashboardPage() {
  const lang = useLang("es");
  const { user } = useAuth();
  const { toast } = useToast();

  const [metrics, setMetrics] = useState<VendorMetrics | null>(null);
  const [loadingMetrics, startLoadingMetrics] = useTransition();

  const [affiliateLink, setAffiliateLink] = useState("");
  const [savingLink, startSavingLink] = useTransition();

  // mock mientras no lo traemos de BD
  const vendorStatus: VendorStatus = "none";

  useEffect(() => {
    if (!user?.uid) return;
    startLoadingMetrics(async () => {
      const m = await getVendorMetrics(user.uid!);
      setMetrics(m);
      setAffiliateLink(m.lemonAffiliateLink ?? "");
    });
  }, [user?.uid]);

  const handleSaveAffiliateLink = async () => {
    if (!user?.uid) {
      toast({
        title: lang === "es" ? "Inicia sesión" : "Sign in",
        description:
          lang === "es"
            ? "Debes iniciar sesión para guardar tu enlace de afiliado."
            : "You must sign in to save your affiliate link.",
        variant: "destructive",
      });
      return;
    }
    const link = affiliateLink.trim();
    if (!link) {
      toast({
        title: lang === "es" ? "Falta el enlace" : "Missing link",
        description:
          lang === "es" ? "Pega tu enlace de afiliado de Lemon Squeezy." : "Paste your Lemon Squeezy affiliate link.",
        variant: "destructive",
      });
      return;
    }
    startSavingLink(async () => {
      // mantiene tu flujo actual
      const res = await saveAffiliateLink(user.uid!, link);
      toast({
        title: res.success ? (lang === "es" ? "Enlace guardado" : "Link saved") : (lang === "es" ? "No se pudo guardar" : "Could not save"),
        description: res.message,
        variant: res.success ? "default" : "destructive",
      });
    });
  };

  // ⬇️ NUEVO: recibe el payload del form y llama a la API para enviar el correo
  const handleRequestApproval = async (data: ApprovalForm) => {
    if (!user?.uid || !user.email) {
      toast({
        title: lang === "es" ? "Inicia sesión" : "Sign in",
        description:
          lang === "es" ? "Debes iniciar sesión para solicitar aprobación." : "You must sign in to request approval.",
        variant: "destructive",
      });
      return;
    }
    try {
      const res = await fetch("/api/affiliate/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          ...data,
        }),
      });
      const j = await res.json();
      if (!res.ok || !j?.success) throw new Error(j?.message || `HTTP ${res.status}`);
      toast({
        title: lang === "es" ? "Solicitud enviada" : "Request sent",
        description: lang === "es" ? "Te avisaremos por este panel cuando se revise." : "We’ll notify you here once reviewed.",
      });
    } catch (e: any) {
      toast({
        title: lang === "es" ? "No se pudo enviar" : "Could not send",
        description: e?.message || "Unexpected error",
        variant: "destructive",
      });
    }
  };

  const form = useForm<RegisterCorporateSaleInput>({
    resolver: zodResolver(RegisterCorporateSaleSchema.omit({ vendedorUid: true })),
    defaultValues: { accessCode: "", plan: "Copa Premium", subscriptions: 10, billingCycle: "monthly" },
  });

  const onSaleSubmit = async (data: Omit<RegisterCorporateSaleInput, "vendedorUid">) => {
    if (!user) {
      toast({
        title: lang === "es" ? "Error" : "Error",
        description: lang === "es" ? "Debes iniciar sesión para registrar una venta." : "You must sign in to register a sale.",
        variant: "destructive",
      });
      return;
    }
    const result = await registerCorporateSale({ vendedorUid: user.uid, ...data });
    toast({
      title: result.success ? (lang === "es" ? "Venta registrada" : "Sale registered") : (lang === "es" ? "Error al registrar" : "Registration error"),
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });
    if (result.success) form.reset();
  };

  const level: VendorLevel = metrics?.level ?? (lang === "es" ? "Nuevo" : "New");
  const activeReferrals = metrics?.activeReferrals ?? 0;
  const pendingCommission = metrics?.pendingCommission ?? 0;
  const nextPayoutDate = metrics?.nextPayoutDate ?? "—";

  return (
    <div className="space-y-8">
      {/* Título */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-primary">
          {lang === "es" ? "Portal de Afiliados" : "Affiliate Portal"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {user?.email
            ? (lang === "es" ? `Bienvenido, ${user.email}.` : `Welcome, ${user.email}.`)
            : (lang === "es" ? "Bienvenido." : "Welcome.")}{" "}
          {lang === "es" ? "Aquí tienes un resumen de tu actividad." : "Here’s a summary of your activity."}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{lang === "es" ? "Tu Nivel Actual" : "Your Current Level"}</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{level}</div>
            <p className="text-xs text-muted-foreground">
              {lang === "es" ? "¡Sigue así para alcanzar el siguiente nivel!" : "Keep it up to reach the next level!"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{lang === "es" ? "Referidos Activos" : "Active Referrals"}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeReferrals}</div>
            <p className="text-xs text-muted-foreground">
              {lang === "es" ? "Usuarios con suscripción activa." : "Users with an active subscription."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{lang === "es" ? "Comisión Estimada" : "Estimated Commission"}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pendingCommission.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {lang === "es" ? "Calculada para el último periodo." : "Calculated for the last period."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{lang === "es" ? "Próximo Pago (Estimado)" : "Next Payout (Estimated)"}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nextPayoutDate}</div>
            <p className="text-xs text-muted-foreground">
              {lang === "es" ? "Fecha gestionada por Lemon Squeezy." : "Date managed by Lemon Squeezy."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Onboarding */}
      <VendorOnboardingInline
        email={user?.email ?? ""}
        vendorStatus={vendorStatus}
        affiliateLink={affiliateLink}
        onAffiliateLinkChange={setAffiliateLink}
        onSaveAffiliateLink={handleSaveAffiliateLink}
        onRequestApproval={handleRequestApproval}
        savingLink={!!savingLink}
      />

      {/* Tablas de comisiones */}
      <div className="mt-8">
        <CommissionsSectionInline currentLevel={level} />
      </div>

      {/* Registrar venta corporativa */}
      <Card>
        <CardHeader>
          <CardTitle>{lang === "es" ? "Registrar Venta Corporativa" : "Register Corporate Sale"}</CardTitle>
          <CardDescription>
            {lang === "es" ? "Introduce los datos para registrar y calcular tu comisión." : "Enter the data to register and calculate your commission."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSaleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="accessCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{lang === "es" ? "Código de Acceso de la Empresa" : "Company Access Code"}</FormLabel>
                    <FormControl><Input placeholder="CORP-XXXXXX" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="plan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{lang === "es" ? "Plan Vendido" : "Plan Sold"}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Copa Premium">Copa Premium</SelectItem>
                        <SelectItem value="Sibarita">Sibarita</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subscriptions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{lang === "es" ? "Número de Suscripciones" : "Number of Subscriptions"}</FormLabel>
                    <FormControl><Input type="number" min={1} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="billingCycle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{lang === "es" ? "Ciclo de Facturación" : "Billing Cycle"}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="monthly">{lang === "es" ? "Mensual" : "Monthly"}</SelectItem>
                        <SelectItem value="yearly">{lang === "es" ? "Anual" : "Yearly"}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                <Check className="mr-2" />
                {lang === "es" ? "Registrar Venta" : "Register Sale"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Ventas recientes */}
      <Card>
        <CardHeader>
          <CardTitle>{lang === "es" ? "Ventas Recientes" : "Recent Sales"}</CardTitle>
          <CardDescription>{lang === "es" ? "Resumen de operaciones registradas." : "Summary of recorded operations."}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{lang === "es" ? "Fecha" : "Date"}</TableHead>
                <TableHead>{lang === "es" ? "Plan" : "Plan"}</TableHead>
                <TableHead>Seats</TableHead>
                <TableHead>{lang === "es" ? "Estado" : "Status"}</TableHead>
                <TableHead>{lang === "es" ? "Comisión Estimada" : "Estimated Commission"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics?.recentSales?.length ? (
                metrics.recentSales.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{new Date(s.createdAt).toLocaleDateString(lang === "es" ? "es-PE" : "en-US")}</TableCell>
                    <TableCell>{s.plan}</TableCell>
                    <TableCell>{s.seats}</TableCell>
                    <TableCell>{s.status}</TableCell>
                    <TableCell>${s.estimatedCommission.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    {lang === "es" ? "Aún no hay ventas registradas." : "No sales recorded yet."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
