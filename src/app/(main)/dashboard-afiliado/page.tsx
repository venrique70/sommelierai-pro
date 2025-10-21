```tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import { Users, DollarSign, TrendingUp, Award, Info, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

import {
  getVendorMetrics,
  saveAffiliateLink,
  submitAffiliateRequest,
  type VendorMetrics,
  type VendorLevel,
  type VendorStatus,
} from "./actions";

// i18n
import { useLang } from "@/lib/use-lang";

// esquema del form de solicitud
import { z } from "zod";
const ApprovalFormSchema = z.object({
  firstName: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  lastName: z.string().min(2, { message: "El apellido debe tener al menos 2 caracteres." }),
  idNumber: z.string().min(3, { message: "El documento debe tener al menos 3 caracteres." }),
  phone: z.string().min(6, { message: "El teléfono debe tener al menos 6 caracteres." }),
  country: z.string().min(2, { message: "El país debe tener al menos 2 caracteres." }),
  motivation: z.string().min(10, { message: "La motivación debe tener al menos 10 caracteres." }),
  uid: z.string().min(1, { message: "El UID es requerido." }),
  email: z.string().email({ message: "Debe ser un email válido." }),
});
export type ApprovalForm = z.infer<typeof ApprovalFormSchema>;

/* ───────────────────────── VendorOnboarding (inline) ───────────────────────── */
function VendorOnboardingInline({
  email,
  uid,
  vendorStatus = "none",
  affiliateLink,
  onAffiliateLinkChange,
  onSaveAffiliateLink,
  onRequestApproval,
  savingLink,
}: {
  email?: string;
  uid?: string;
  vendorStatus?: VendorStatus;
  affiliateLink: string;
  onAffiliateLinkChange: (v: string) => void;
  onSaveAffiliateLink: () => void | Promise<void>;
  onRequestApproval: (data: ApprovalForm) => void | Promise<void>;
  savingLink?: boolean;
}) {
  const lang = useLang("es");

  const form = useForm<ApprovalForm>({
    resolver: zodResolver(ApprovalFormSchema),
    mode: "onSubmit",
    defaultValues: {
      firstName: "",
      lastName: "",
      idNumber: "",
      phone: "",
      country: "",
      motivation: "",
      uid: uid || "",
      email: email || "",
    },
  });

  // Sincronizar uid y email cuando cambien las props
  useEffect(() => {
    if (uid) form.setValue("uid", uid);
    if (email) form.setValue("email", email);
  }, [uid, email, form]);

  const { isSubmitting } = form.formState;
  const disabled = isSubmitting;

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
          <div className="font-semibold mb-3">{lang === "es" ? "1) Solicitar Aprobación" : "1) Request Approval"}</div>
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

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onRequestApproval)} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Campos ocultos para uid y email */}
              <FormField
                control={form.control}
                name="uid"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input type="hidden" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input type="hidden" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
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
                        {lang === "es" ? "¿Por qué quieres ser referente de SommelierPro AI?" : "Why do you want to be a SommelierPro AI advocate?"}
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
                <Button type="submit" disabled={disabled}>
                  {isSubmitting
                    ? lang === "es"
                      ? "Enviando…"
                      : "Sending…"
                    : vendorStatus === "approved"
                    ? lang === "es"
                      ? "Aprobado ✔"
                      : "Approved ✔"
                    : vendorStatus === "pending"
                    ? lang === "es"
                      ? "Reenviar notificación"
                      : "Resend notification"
                    : lang === "es"
                    ? "Enviar solicitud"
                    : "Send request"}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* 2) Crear cuenta en Lemon (controlado por estado) */}
        <div className="rounded-md border p-4">
          <div className="font-semibold mb-1">
            {vendorStatus === "approved"
              ? lang === "es"
                ? "2) Crear tu cuenta de afiliado"
                : "2) Create your affiliate account"
              : lang === "es"
              ? "2) Recibirás un correo con instrucciones"
              : "2) You will receive an email with instructions"}
          </div>

          {vendorStatus === "approved" ? (
            <>
              <p className="text-sm text-muted-foreground">
                {lang === "es"
                  ? "Abre el portal seguro y crea tu cuenta. Ahí configurarás tus datos de pago."
                  : "Open the secure portal and create your account. Configure your payout details there."}
              </p>
              <div className="mt-3">
                <Button asChild variant="secondary">
                  <a href="https://sommelierproai.lemonsqueezy.com/affiliates" target="_blank" rel="noopener noreferrer">
                    {lang === "es" ? "Ir al portal de afiliados" : "Go to affiliate portal"}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {lang === "es"
                ? "Cuando un admin apruebe tu solicitud, te enviaremos un correo con el enlace privado para completar tu registro en Lemon Squeezy."
                : "Once an admin approves your request, we will email you a private link to complete your Lemon Squeezy registration."}
            </p>
          )}
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
              {savingLink ? (lang === "es" ? "Guardando…" : "Saving…") : lang === "es" ? "Guardar enlace" : "Save link"}
            </Button>
          </div>
        </div>

        {/* 4) Qué sigue */}
        <div className="rounded-md border p-4">
          <div className="font-semibold mb-1">{lang === "es" ? "¿Qué sigue?" : "What’s next?"}</div>
          <p className="text-sm text-muted-foreground">
            {lang === "es"
              ? "Cuando un admin te apruebe, verás tu panel completo con métricas."
              : "Once an admin approves you, you’ll see your full dashboard with metrics."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─────────────────────── CommissionsSection (inline) ─────────────────────── */
const PLAN_COMMISSIONS: { plan: string; month: string; year: string }[] = [
  { plan: "Descúbrete", month: "0%", year: "0%" },
  { plan: "Iniciado", month: "5%", year: "6%" },
  { plan: "Una Copa", month: "10%", year: "12%" },
  { plan: "Copa Premium", month: "15%", year: "17%" },
  { plan: "Sibarita", month: "20%", year: "22%" },
];

function CommissionsSectionInline() {
  const lang = useLang("es");
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="text-primary" />
          {lang === "es" ? "Comisiones por plan" : "Commissions by plan"}
        </CardTitle>
        <CardDescription>
          {lang === "es"
            ? "Comisión estándar por cada plan de suscripción. Los planes anuales tienen mejor comisión."
            : "Standard commission per subscription plan. Annual plans pay higher commissions."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{lang === "es" ? "Plan" : "Plan"}</TableHead>
              <TableHead>{lang === "es" ? "Mes" : "Month"}</TableHead>
              <TableHead>{lang === "es" ? "Año" : "Year"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PLAN_COMMISSIONS.map((row) => (
              <TableRow key={row.plan}>
                <TableCell className="font-medium">{row.plan}</TableCell>
                <TableCell>{row.month}</TableCell>
                <TableCell>{row.year}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
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

  const vendorStatus: VendorStatus = (metrics?.affiliateStatus as VendorStatus) ?? "none";

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
        description: lang === "es" ? "Debes iniciar sesión para guardar tu enlace de afiliado." : "You must sign in to save your affiliate link.",
        variant: "destructive",
      });
      return;
    }
    const link = affiliateLink.trim();
    if (!link) {
      toast({
        title: lang === "es" ? "Falta el enlace" : "Missing link",
        description: lang === "es" ? "Pega tu enlace de afiliado de Lemon Squeezy." : "Paste your Lemon Squeezy affiliate link.",
        variant: "destructive",
      });
      return;
    }
    startSavingLink(async () => {
      const res = await saveAffiliateLink(user.uid!, link);
      toast({
        title: res.success ? (lang === "es" ? "Enlace guardado" : "Link saved") : (lang === "es" ? "No se pudo guardar" : "Could not save"),
        description: res.message,
        variant: res.success ? "default" : "destructive",
      });
    });
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
        key={user?.uid ?? "nouser"}
        email={user?.email ?? ""}
        uid={user?.uid ?? ""}
        vendorStatus={vendorStatus}
        affiliateLink={affiliateLink}
        onAffiliateLinkChange={setAffiliateLink}
        onSaveAffiliateLink={handleSaveAffiliateLink}
        onRequestApproval={async (data) => {
          if (!user?.uid || !user.email) {
            toast({
              title: lang === "es" ? "Inicia sesión" : "Sign in",
              description: lang === "es" ? "Debes iniciar sesión para solicitar aprobación." : "You must sign in to request approval.",
              variant: "destructive",
            });
            return;
          }

          startLoadingMetrics(async () => {
            try {
              // Registrar la solicitud en la base de datos
              await submitAffiliateRequest(user.uid, { email: user.email, ...data });

              // Enviar datos a la API
              const res = await fetch("/api/affiliate/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  uid: data.uid,
                  email: data.email,
                  firstName: data.firstName,
                  lastName: data.lastName,
                  idNumber: data.idNumber,
                  phone: data.phone,
                  country: data.country,
                  motivation: data.motivation,
                }),
              });

              const j = await res.json().catch(() => ({}));
              toast({
                title: j.success ? (lang === "es" ? "Solicitud enviada" : "Request sent") : (lang === "es" ? "Error" : "Error"),
                description: j.success
                  ? lang === "es"
                    ? "Tu solicitud ha sido enviada. Revisa el estado en el panel."
                    : "Your request has been sent. Check the status in the panel."
                  : j.message || (lang === "es" ? `Error: ${res.status}` : `Error: ${res.status}`),
                variant: j.success ? "default" : "destructive",
              });

              // Actualizar métricas
              const m = await getVendorMetrics(user.uid!);
              setMetrics(m);
            } catch (error) {
              toast({
                title: lang === "es" ? "Error" : "Error",
                description: lang === "es" ? "No se pudo enviar la solicitud. Intenta de nuevo." : "Could not send request. Try again.",
                variant: "destructive",
              });
            }
          });
        }}
        savingLink={!!savingLink}
      />

      {/* Tabla de comisiones */}
      <div className="mt-8">
        <CommissionsSectionInline />
      </div>

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
```
