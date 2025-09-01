export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import AdminSidebar from "@/components/admin/AdminSidebar";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold hover:underline">SommelierPro AI</Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/admin/vendors" className="hover:underline">Vendedores</Link>
            <Link href="/admin/corporate" className="hover:underline">Corporativo</Link>
            <Link href="/admin/corporate?tab=affiliates" className="hover:underline">Afiliados</Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-[14rem_1fr]">
        <AdminSidebar />
        <main className="p-6">{children}</main>
      </div>

      {/* Quick switch flotante en mobile */}
      <div className="md:hidden fixed bottom-4 right-4 flex gap-2">
        <Link href="/admin/vendors" className="rounded-lg bg-white/10 px-3 py-2 text-xs">Vendedores</Link>
        <Link href="/admin/corporate" className="rounded-lg bg-white/10 px-3 py-2 text-xs">Corporativo</Link>
        <Link href="/admin/corporate?tab=affiliates" className="rounded-lg bg-white/10 px-3 py-2 text-xs">Afiliados</Link>
      </div>
    </div>
  );
}
