// src/app/(main)/admin/layout.tsx
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* header elevado, sin llamadas a Admin/Firestore */}
      <header className="border-b border-white/10 relative z-[9999]">
        <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold hover:underline">SommelierPro AI</Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/admin/vendors" className="hover:underline">Vendedores</Link>
            <Link href="/admin/corporate" className="hover:underline">Corporativo</Link>
            <Link href="/admin/corporate?tab=affiliates" className="hover:underline">Afiliados</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">{children}</main>
    </div>
  );
}
