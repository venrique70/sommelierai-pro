// src/app/(main)/admin/layout.tsx
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // 👉 No hay fetch ni Admin SDK aquí. Solo estructura y links.
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
          <div className="font-semibold">Panel Admin</div>
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/admin/vendors" className="hover:underline">Vendedores</Link>
            <Link href="/admin/corporate" className="hover:underline">Corporativo</Link>
            <Link href="/admin/corporate?tab=affiliates" className="hover:underline">Afiliados</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-6">
        {children}
      </main>
    </div>
  );
}
