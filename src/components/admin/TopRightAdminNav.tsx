"use client";

import Link from "next/link";
import { useLang } from "@/lib/use-lang";

export default function TopRightAdminNav() {
  const lang = useLang("es");
  return (
    <div className="fixed top-2 right-3 z-[2147483647] pointer-events-auto">
      <nav className="flex items-center gap-4 bg-black/40 backdrop-blur px-3 py-1 rounded-md text-sm">
        <Link href="/admin/vendors" className="hover:underline">
          {lang === "es" ? "Vendedores" : "Vendors"}
        </Link>
        <Link href="/admin/corporate" className="hover:underline">
          {lang === "es" ? "Corporativo" : "Corporate"}
        </Link>
        <Link href="/admin/affiliates" className="hover:underline">
          {lang === "es" ? "Afiliados" : "Affiliates"}
        </Link>
      </nav>
    </div>
  );
}
