
"use client";

import * as React from 'react';
import { AppSidebar } from '@/components/ui/sidebar';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

// Este componente ahora consume el contexto de forma segura
// porque siempre se renderizará como hijo de AuthProvider.
function MainContent({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-background">
        <div className="flex flex-col items-center gap-4 text-primary">
          <Loader2 className="size-12 animate-spin" />
          <p className="text-lg text-muted-foreground">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[auto_1fr] min-h-screen">
      <AppSidebar />
      <main className="w-full p-4 sm:p-6 flex justify-center">
        <div className="w-full">
          {children}
        </div>
      </main>
    </div>
  );
}

// El layout principal ahora solo se encarga de proveer el contexto.
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <MainContent>{children}</MainContent>
    </AuthProvider>
  );
}
