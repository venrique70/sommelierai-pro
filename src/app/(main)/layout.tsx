"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/ui/sidebar";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import Footer from "@/components/Footer";
// (opcional) diagnóstico directo del SDK
import { getAuth, onAuthStateChanged } from "firebase/auth";

function MainContent({ children }: { children: React.ReactNode }) {
  const { loading, user, error } = useAuth();
  const [giveUp, setGiveUp] = useState(false);

  // ⏱️ fail-open: tras 8s dejamos pasar la UI aunque loading siga true
  useEffect(() => {
    const id = setTimeout(() => setGiveUp(true), 8000);
    return () => clearTimeout(id);
  }, []);

  // 🧪 logs de diagnóstico para entender qué pasa con Auth
  useEffect(() => {
    console.log("[useAuth] loading:", loading, "uid:", user?.uid, "error:", error);
  }, [loading, user, error]);

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      console.log("[onAuthStateChanged] user?", !!u, "uid:", u?.uid);
    });
    return unsub;
  }, []);

  return (
    <div className="grid grid-cols-[auto_1fr] min-h-screen">
      <AppSidebar />
      <main className="w-full p-4 sm:p-6 flex justify-center">
        <div className="w-full relative">
          {/* Renderizamos SIEMPRE los children (fail-open) */}
          {children}

          {/* Overlay mientras carga (no bloquea el render) */}
          {(loading && !giveUp) && (
            <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="flex flex-col items-center gap-3 text-primary">
                <Loader2 className="size-10 animate-spin" />
                <p className="text-sm text-muted-foreground">Verificando sesión…</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <Toaster />
    </div>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <MainContent>{children}</MainContent>
    </AuthProvider>
  );
}
