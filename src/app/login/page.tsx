"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { signInWithGoogle, signInWithEmail, signUpWithEmail } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, LogIn, Mail, UserPlus } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email({ message: "Por favor, introduce un correo válido." }),
  password: z.string().min(1, { message: "La contraseña no puede estar vacía." }),
});

const registerSchema = z.object({
  displayName: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, introduce un correo válido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  acceptPrivacy: z.boolean().refine((v) => v === true, {
    message: "Debes aceptar la Política de Privacidad.",
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { displayName: "", email: "", password: "", acceptPrivacy: false },
  });

  const handleAuthAction = async (action: Promise<any>, successMessage: string) => {
    setLoading(true);
    try {
      await action;
      toast({ title: "¡Éxito!", description: successMessage });
      router.push("/");
    } catch (error: any) {
      let description = "Ocurrió un error inesperado. Por favor, inténtalo de nuevo.";
      if (error?.code) {
        switch (error.code) {
          case "auth/user-not-found":
          case "auth/wrong-password":
            description = "Correo o contraseña incorrectos.";
            break;
          case "auth/email-already-in-use":
            description = "Este correo electrónico ya está registrado. Por favor, inicia sesión.";
            break;
          default:
            description = `Error: ${error.message}`;
        }
      }
      toast({ title: "Error de autenticación", description, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const onLoginSubmit = (data: LoginFormValues) =>
    handleAuthAction(signInWithEmail(data.email, data.password), "Has iniciado sesión correctamente.");

  const onRegisterSubmit = (data: RegisterFormValues) =>
    handleAuthAction(signUpWithEmail(data.email, data.password, data.displayName), "¡Tu cuenta ha sido creada con éxito!");

  const handleGoogleSignIn = () =>
    handleAuthAction(signInWithGoogle(), "Has iniciado sesión correctamente con Google.");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <div className="flex items-center gap-4 mb-6">
        <img src="/logo/sommelierpro-beige.svg" alt="SommelierPro Logo" width="40" height="40" />
        <h1 className="text-4xl font-bold text-primary">SommelierPro AI</h1>
      </div>

      <Tabs defaultValue="login" className="w-full max-w-md">
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
            <CardContent className="space-y-4">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo Electrónico</FormLabel>
                        <FormControl>
                          <Input placeholder="tu@correo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-muted-foreground"
                            >
                              {showPassword ? "🙈" : "👁️"}
                            </button>
                          </div>
                        </FormControl>
                        <div className="flex justify-end mt-1">
                          <a href="/forgot-password" className="text-xs text-primary hover:underline">
                            ¿Olvidaste tu contraseña?
                          </a>
                        </div>
                        <p className="mt-2 text-xs opacity-80">
                          Al continuar aceptas nuestra{" "}
                          <button type="button" onClick={() => setShowPrivacy(true)} className="underline">
                            Política de Privacidad
                          </button>.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : <LogIn className="mr-2" />}
                    Iniciar Sesión
                  </Button>
                </form>
              </Form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">O continúa con</span>
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : <Mail className="mr-2" />}
                Google
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* REGISTRO */}
        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle>Crear una Cuenta</CardTitle>
              <CardDescription>Es rápido y fácil. Empieza a explorar el mundo del vino.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Tu Nombre" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo Electrónico</FormLabel>
                        <FormControl>
                          <Input placeholder="tu@correo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Mínimo 6 caracteres" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="acceptPrivacy"
                    render={({ field }) => (
                      <FormItem className="flex items-start gap-2 mt-2">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            className="mt-1"
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal leading-6">
                          Acepto la{" "}
                          <button type="button" onClick={() => setShowPrivacy(true)} className="underline">
                            Política de Privacidad
                          </button>.
                        </FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : <UserPlus className="mr-2" />}
                    Crear Cuenta
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Política de Privacidad */}
      <Dialog open={showPrivacy} onOpenChange={setShowPrivacy}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Política de Privacidad</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[50vh] pr-4">
            <div className="space-y-4 text-sm">
              <p><strong>Última actualización:</strong> 8 de agosto de 2025</p>
              <p>En <strong>SommelierPro AI</strong> valoramos y respetamos tu privacidad...</p>
              <p>
                Lee la versión completa en{" "}
                <a href="/privacy-policy" className="underline" target="_blank" rel="noreferrer">
                  /privacy-policy
                </a>.
              </p>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button onClick={() => setShowPrivacy(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
