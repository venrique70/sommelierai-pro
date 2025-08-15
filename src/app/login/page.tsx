"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { signInWithEmail, signUpWithEmail } from "@/lib/auth";
import { auth } from "@/lib/firebase-client";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

import { Loader2, LogIn, Mail, UserPlus, Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email({ message: "Introduce un correo válido" }),
  password: z.string().min(1, { message: "La contraseña es requerida" }),
});

const registerSchema = z.object({
  email: z.string().email({ message: "Introduce un correo válido" }),
  password: z.string().min(6, { message: "Mínimo 6 caracteres" }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const [showPasswordRegister, setShowPasswordRegister] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingRegister, setLoadingRegister] = useState(false);

  const formLogin = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const formRegister = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmitLogin(values: z.infer<typeof loginSchema>) {
    try {
      setLoadingEmail(true);
      await signInWithEmail(values.email, values.password);
      toast({ title: "Bienvenido", description: "Inicio de sesión exitoso" });
      router.push("/");
    } catch (err: any) {
      toast({
        title: "Error al iniciar sesión",
        description: err?.message ?? "Intenta de nuevo",
        variant: "destructive",
      });
    } finally {
      setLoadingEmail(false);
    }
  }

  async function onSubmitRegister(values: z.infer<typeof registerSchema>) {
    try {
      setLoadingRegister(true);
      await signUpWithEmail(
        values.email,
        values.password,
        values.email.split("@")[0] || "Usuario"
      );
      toast({ title: "Cuenta creada", description: "Ya puedes usar SommelierPro AI" });
      router.push("/");
    } catch (err: any) {
      toast({
        title: "Error al registrarte",
        description: err?.message ?? "Intenta de nuevo",
        variant: "destructive",
      });
    } finally {
      setLoadingRegister(false);
    }
  }

  // ---- Google con POPUP (sin fallback a redirect) ----
  async function onGoogle() {
    setLoadingGoogle(true);

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      await signInWithPopup(auth, provider);
      toast({ title: "Bienvenido", description: "Sesión iniciada con Google" });
      router.push("/");
    } catch (err: any) {
      // Si el popup está bloqueado, avisamos para habilitarlo
      if (err?.code === "auth/popup-blocked") {
        toast({
          title: "Permite ventanas emergentes",
          description:
            "Habilita los pop-ups para http://localhost:3000 (icono de candado → Permisos del sitio → Ventanas emergentes y redirecciones → Permitir) y vuelve a intentar.",
          variant: "destructive",
        });
        return;
      }
      console.error("Google sign-in error:", err);
      toast({
        title: "Error con Google",
        description: err?.message ?? "Intenta de nuevo",
        variant: "destructive",
      });
    } finally {
      setLoadingGoogle(false);
    }
  }

  return (
    <main className="login-page flex-1 mx-auto max-w-xl px-6 pt-10 pb-28">
      <div className="mb-6 w-full flex justify-center">
        <div className="flex items-center space-x-6">
          <svg className="h-16 w-auto" viewBox="0 0 35.84 32" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <style>{`.cls-1 { fill: #e0bf32; stroke-width: 0px; }`}</style>
            </defs>
            <path
              className="cls-1"
              d="m11,26.15v-6.64c3.51-.98,6-4,6-7.66s-1.07-6.51-1.97-8.42c-.16-.35-.52-.58-.91-.58H2.87c-.39,0-.74.22-.91.58-.59,1.26-1.97,4.61-1.97,8.42s2.49,6.68,6,7.66v6.64c-2.81,1.12-5,3.14-5,4.7,0,.55.45,1,1,1h13c.55,0,1-.45,1-1,0-1.56-2.19-3.58-5-4.7Zm-2,3.7H3.76c.72-.68,1.94-1.51,3.56-2.05.41-.14.68-.52.68-.95v-9.02c-3.4-.23-6-2.77-6-5.98,0-2.18.56-4.75,1.52-7h9.96c.75,1.73,1.52,4.2,1.52,7,0,3.21-2.6,5.75-6,5.98v9.02c0,.43.28.81.68.95,1.63.54,2.85,1.37,3.57,2.05h-4.25ZM3,11.85c0-1.9.56-3.71,1-5h6v5c0,.55.45,1,1,1s1-.45,1-1v-5h1c.49,1.4,1,3.12,1,5,0,6.41-11,6.94-11,0Z"
            />
            <path
              className="cls-1"
              d="m28.84,13v11l-3-3-3,3,3,3,3-3v4c0,.55-.45,1-1,1h-6c-.55,0-1-.45-1-1v-10l3,3,3-3-3-3-3,3v-7c0-.55.45-1,1-1h2c.55,0,1,.45,1,1s-.45,1-1,1h-1v1h6Zm6.78-7.38c-.34.43-.98.5-1.41.16l-3.97-3.18-1.89,4.4h2.47c.42,0,.78.25.93.62.05.12.08.25.08.39v21.99c0,1.1-.9,2-2,2h-10c-1.1,0-2-.9-2-2V8.01c0-.14.03-.27.08-.39.15-.36.51-.62.93-.62h7.33l2.74-6.39c.12-.29.37-.5.68-.58.3-.08.62,0,.87.19l5,4c.43.35.5.97.16,1.41Zm-5.78,3.38h-10v21h10V9Z"
            />
          </svg>
          <div className="text-5xl md:text-6xl font-headline tracking-tighter font-bold">
            SommelierPro AI
          </div>
        </div>
      </div>

      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
          <TabsTrigger value="register">Registrarse</TabsTrigger>
        </TabsList>

        {/* LOGIN */}
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Bienvenido de Nuevo</CardTitle>
              <CardDescription>Introduce tus credenciales para acceder a tu cuenta.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...formLogin}>
                <form onSubmit={formLogin.handleSubmit(onSubmitLogin)} className="space-y-4">
                  <FormField
                    control={formLogin.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo Electrónico</FormLabel>
                        <FormControl>
                          <Input type="email" autoComplete="email" placeholder="tu@correo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={formLogin.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type={showPasswordLogin ? "text" : "password"}
                              autoComplete="current-password"
                              placeholder="••••••••"
                              {...field}
                            />
                          </FormControl>
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"
                            onClick={() => setShowPasswordLogin((v) => !v)}
                            aria-label={showPasswordLogin ? "Ocultar contraseña" : "Mostrar contraseña"}
                          >
                            {showPasswordLogin ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        <div className="mt-1 text-right">
                          <Link href="/forgot-password" className="text-xs underline">
                            ¿Olvidaste tu contraseña?
                          </Link>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={loadingEmail}>
                    {loadingEmail ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                    Iniciar Sesión
                  </Button>

                  <p className="mt-2 text-xs opacity-70 text-center">
                    Al continuar, aceptas nuestros <Link href="/legal" className="underline">Legal</Link>.
                  </p>

                  <div className="relative my-2 h-px bg-border">
                    <span className="absolute left-1/2 -translate-x-1/2 -top-2 bg-background px-2 text-xs opacity-70">
                      O CONTINÚA CON
                    </span>
                  </div>

                  <Button type="button" variant="outline" className="w-full" onClick={onGoogle} disabled={loadingGoogle}>
                    {loadingGoogle ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                    Google
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* REGISTRO */}
        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle>Crea tu cuenta</CardTitle>
              <CardDescription>Regístrate para comenzar a usar SommelierPro AI.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...formRegister}>
                <form onSubmit={formRegister.handleSubmit(onSubmitRegister)} className="space-y-4">
                  <FormField
                    control={formRegister.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo Electrónico</FormLabel>
                        <FormControl>
                          <Input type="email" autoComplete="email" placeholder="tu@correo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={formRegister.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type={showPasswordRegister ? "text" : "password"}
                              autoComplete="new-password"
                              placeholder="Mínimo 6 caracteres"
                              {...field}
                            />
                          </FormControl>
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"
                            onClick={() => setShowPasswordRegister((v) => !v)}
                            aria-label={showPasswordRegister ? "Ocultar contraseña" : "Mostrar contraseña"}
                          >
                            {showPasswordRegister ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={loadingRegister}>
                    {loadingRegister ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                    Crear Cuenta
                  </Button>

                  <p className="mt-2 text-xs opacity-70 text-center">
                    Al continuar, aceptas nuestros <Link href="/legal" className="underline">Legal</Link>.
                  </p>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
