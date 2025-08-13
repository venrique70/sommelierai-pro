"use client";

import { useEffect, useState, useTransition, useMemo } from "react";
import { Users, DollarSign, TrendingUp, Award, Check, Info, ExternalLink, Building } from "lucide-react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

import {
  getVendorMetrics,
  requestVendorApproval,
  saveAffiliateLink,
  registerCorporateSale,
  type VendorMetrics,
  type VendorLevel,
} from "./actions";
import {
  RegisterCorporateSaleSchema,
  type RegisterCorporateSaleInput,
} from "@/lib/schemas";

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
  onRequestApproval: () => void | Promise<void>;
  savingLink?: boolean;
}) {
  // ✅ Solo permite solicitar si está en "none" y hay email (sesión)
  const canRequest = useMemo(() => vendorStatus === "none" && !!email, [vendorStatus, email]);

  return (
    <Card className="border-primary/20 bg-card">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" />
          Tu Onboarding
        </CardTitle>
        <CardDescription>Te tomará un minuto.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 1) Solicitar aprobación */}
        <div className="rounded-md border p-4">
          <div className="font-semibold mb-1">1) Solicitar Aprobación</div>
          <p className="text-sm text-muted-foreground">
            Al enviar tu solicitud, un admin revisará tu cuenta ({email ?? "tu email"}).
            Recibirás el estado en este mismo panel.
          </p>
          <div className="mt-3">
            <Button onClick={onRequestApproval} disabled={!canRequest} aria-disabled={!canRequest}>
              {canRequest ? "Solicitar aprobación" : vendorStatus === "pending" ? "En revisión…" : "Aprobado ✔"}
            </Button>
          </div>
        </div>

        {/* 2) Crear cuenta en Lemon */}
        <div className="rounded-md border p-4">
          <div className="font-semibold mb-1">2) Crear tu cuenta de afiliado</div>
          <p className="text-sm text-muted-foreground">
            Abre el portal público y créate una cuenta. Ahí configurarás tus datos de pago.
          </p>
          <div className="mt-3">
            <Button asChild variant="secondary">
              <a
                href="https://sommelierproai.lemonsqueezy.com/affiliates"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ir al portal de afiliados <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        {/* 3) Guardar enlace */}
        <div className="rounded-md border p-4">
          <div className="font-semibold mb-1">3) Guarda tu enlace de afiliado</div>
          <p className="text-sm text-muted-foreground">
            Pega aquí tu enlace único de Lemon. Lo usaremos para cruzar ventas.
          </p>

          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
            <Input
              value={affiliateLink}
              onChange={(e) => onAffiliateLinkChange(e.target.value)}
              placeholder="https://tu-subdominio.lemonsqueezy.com/checkout/XXXX"
            />
            <Button onClick={onSaveAffiliateLink} disabled={!!savingLink}>
              {savingLink ? "Guardando…" : "Guardar enlace"}
            </Button>
          </div>
        </div>

        {/* 4) Qué sigue */}
        <div className="rounded-md border p-4">
          <div className="font-semibold mb-1">¿Qué sigue?</div>
          <p className="text-sm text-muted-foreground">
            Cuando un admin te apruebe, verás tu panel completo con métricas,
            registro de ventas corporativas y más.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─────────────────────── CommissionsSection (inline) ─────────────────────── */

function CommissionsSectionInline({ currentLevel }: { currentLevel?: VendorLevel }) {
  const COMMISSIONS_BY_USER = [
    { level: "Nuevo",    requirement: "0-4 Referidos",   iniciado: "0%",  unaCopa: "0%",  copaPremium: "0%",  sibarita: "0%"  },
    { level: "Pregrado", requirement: "5-9 Referidos",   iniciado: "5%",  unaCopa: "8%",  copaPremium: "10%", sibarita: "15%" },
    { level: "Bachelor", requirement: "10-19 Referidos", iniciado: "7%",  unaCopa: "10%", copaPremium: "12%", sibarita: "17%" },
    { level: "Pro",      requirement: "20-29 Referidos", iniciado: "9%",  unaCopa: "12%", copaPremium: "15%", sibarita: "18%" },
    { level: "Master",   requirement: "30+ Referidos",   iniciado: "11%", unaCopa: "15%", copaPremium: "17%", sibarita: "20%" },
  ] as const;

  const highlight = currentLevel ?? "Bachelor";

  return (
    <div className="grid grid-cols-1 gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="text-primary" />
            Comisiones por Planes de Usuario
          </CardTitle>
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
              {COMMISSIONS_BY_USER.map((row) => {
                const isMe = row.level === highlight;
                return (
                  <TableRow key={row.level} className={isMe ? "bg-accent" : ""}>
                    <TableCell className="font-medium">
                      {row.level}
                      {isMe && <span className="ml-2 rounded border px-2 py-0.5 text-xs">Tu Nivel</span>}
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
            Comisiones por Planes Corporativos
          </CardTitle>
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
        title: "Inicia sesión",
        description: "Debes iniciar sesión para guardar tu enlace de afiliado.",
        variant: "destructive",
      });
      return;
    }
    const link = affiliateLink.trim();
    if (!link) {
      toast({ title: "Falta el enlace", description: "Pega tu enlace de afiliado de Lemon Squeezy.", variant: "destructive" });
      return;
    }
    startSavingLink(async () => {
      const res = await saveAffiliateLink(user.uid!, link);
      toast({
        title: res.success ? "Enlace guardado" : "No se pudo guardar",
        description: res.message,
        variant: res.success ? "default" : "destructive",
      });
    });
  };

  const handleRequestApproval = async () => {
    if (!user?.uid) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para solicitar aprobación.",
        variant: "destructive",
      });
      return;
    }
    const res = await requestVendorApproval(user.uid);
    toast({
      title: res.success ? "Solicitud enviada" : "No se pudo enviar",
      description: res.message,
      variant: res.success ? "default" : "destructive",
    });
  };

  const form = useForm<RegisterCorporateSaleInput>({
    resolver: zodResolver(RegisterCorporateSaleSchema.omit({ vendedorUid: true })),
    defaultValues: { accessCode: "", plan: "Copa Premium", subscriptions: 10, billingCycle: "monthly" },
  });

  const onSaleSubmit = async (data: Omit<RegisterCorporateSaleInput, "vendedorUid">) => {
    if (!user) {
      toast({ title: "Error", description: "Debes iniciar sesión para registrar una venta.", variant: "destructive" });
      return;
    }
    const result = await registerCorporateSale({ vendedorUid: user.uid, ...data });
    toast({
      title: result.success ? "Venta registrada" : "Error al registrar",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });
    if (result.success) form.reset();
  };

  const level: VendorLevel = metrics?.level ?? "Nuevo";
  const activeReferrals = metrics?.activeReferrals ?? 0;
  const pendingCommission = metrics?.pendingCommission ?? 0;
  const nextPayoutDate = metrics?.nextPayoutDate ?? "—";

  return (
    <div className="space-y-8">
      {/* Título */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-primary">Portal de Afiliados</h1>
        <p className="text-muted-foreground mt-2">
          {user?.email ? `Bienvenido, ${user.email}.` : "Bienvenido."} Aquí tienes un resumen de tu actividad.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tu Nivel Actual</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{level}</div>
            <p className="text-xs text-muted-foreground">¡Sigue así para alcanzar el siguiente nivel!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referidos Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeReferrals}</div>
            <p className="text-xs text-muted-foreground">Usuarios con suscripción activa.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comisión Estimada</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pendingCommission.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Calculada para el último periodo.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximo Pago (Estimado)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nextPayoutDate}</div>
            <p className="text-xs text-muted-foreground">Fecha gestionada por Lemon Squeezy.</p>
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
          <CardTitle>Registrar Venta Corporativa</CardTitle>
          <CardDescription>Introduce los datos para registrar y calcular tu comisión.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSaleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="accessCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código de Acceso de la Empresa</FormLabel>
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
                    <FormLabel>Plan Vendido</FormLabel>
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
                    <FormLabel>Número de Suscripciones</FormLabel>
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
                    <FormLabel>Ciclo de Facturación</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="monthly">Mensual</SelectItem>
                        <SelectItem value="yearly">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                <Check className="mr-2" />
                Registrar Venta
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Ventas recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Ventas Recientes</CardTitle>
          <CardDescription>Resumen de operaciones registradas.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Seats</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Comisión Estimada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics?.recentSales?.length ? (
                metrics.recentSales.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{new Date(s.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{s.plan}</TableCell>
                    <TableCell>{s.seats}</TableCell>
                    <TableCell>{s.status}</TableCell>
                    <TableCell>${s.estimatedCommission.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Aún no hay ventas registradas.
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
