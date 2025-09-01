"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/ui/sidebar";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import Footer from "@/components/Footer";
import { getAuth, onAuthStateChanged } from "firebase/auth";

function Shell({ children }: { children: React.ReactNode }) {
  const { loading, user, error } = useAuth();
  const [giveUp, setGiveUp] = useState(false);

  // ⏱️ fail-open: a los 8s mostramos la UI aunque loading siga true
  useEffect(() => {
    const id = setTimeout(() => setGiveUp(true), 8000);
    return () => clearTimeout(id);
  }, []);

  // Logs de diagnóstico (no visibles al usuario)
  useEffect(() => {
    console.log("[useAuth] loading:", loading, "uid:", user?.uid, "error:", error);
  }, [loading, user, error]);

  useEffect(() => {
    const unsub = onAuthStateChanged(getAuth(), (u) => {
      console.log("[onAuthStateChanged] user?", !!u, "uid:", u?.uid);
    });
    return unsub;
  }, []);

  return (
    <div className="min-h-screen grid grid-cols-[auto_1fr] bg-background text-foreground">
      {/* Sidebar (como antes) */}
      <aside className="border-r border-white/10">
        <AppSidebar />
      </aside>

      {/* Contenido con overlay no bloqueante */}
      <main className="relative w-full">
        {children}

        {(loading && !giveUp) && (
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center z-[9999]">
            <div className="flex flex-col items-center gap-3 text-primary">
              <Loader2 className="size-10 animate-spin" />
              <p className="text-sm text-muted-foreground">Verificando sesión…</p>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <Toaster />
    </div>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Shell>{children}</Shell>
    </AuthProvider>
  );
}
