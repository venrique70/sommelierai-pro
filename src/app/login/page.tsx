"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { signInWithGoogle, signInWithEmail, signUpWithEmail } from "@/lib/auth";

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
      toast({ title: "Error al iniciar sesión", description: err?.message ?? "Intenta de nuevo", variant: "destructive" });
    } finally {
      setLoadingEmail(false);
    }
  }

  async function onSubmitRegister(values: z.infer<typeof registerSchema>) {
    try {
      setLoadingRegister(true);
      await signUpWithEmail(values.email, values.password);
      toast({ title: "Cuenta creada", description: "Ya puedes usar SommelierPro AI" });
      router.push("/");
    } catch (err: any) {
      toast({ title: "Error al registrarte", description: err?.message ?? "Intenta de nuevo", variant: "destructive" });
    } finally {
      setLoadingRegister(false);
    }
  }

  async function onGoogle() {
    try {
      setLoadingGoogle(true);
      await signInWithGoogle();
      toast({ title: "Bienvenido", description: "Sesión iniciada con Google" });
      router.push("/");
    } catch (err: any) {
      toast({ title: "Error con Google", description: err?.message ?? "Intenta de nuevo", variant: "destructive" });
    } finally {
      setLoadingGoogle(false);
    }
  }

  return (
    <main className="login-page flex-1 mx-auto max-w-xl px-6 pt-10 pb-28">
      <div className="mb-6 text-center">
        <div className="text-3xl font-extrabold tracking-tight">SommelierPro AI</div>
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
                          <Input
                            type="email"
                            autoComplete="email"
                            placeholder="tu@correo.com"
                            {...field}
                          />
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
                          <Input
                            type="email"
                            autoComplete="email"
                            placeholder="tu@correo.com"
                            {...field}
                          />
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
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
