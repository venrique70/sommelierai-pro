'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Building2, UserRoundCheck } from "lucide-react";

const item = (href: string, label: string, icon: React.ReactNode, active: boolean) => (
  <Link
    href={href}
    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm
      ${active ? "bg-yellow-500/15 text-yellow-300" : "hover:bg-white/5 text-zinc-300"}`}
  >
    <span className="h-4 w-4">{icon}</span>
    <span>{label}</span>
  </Link>
);

export default function AdminSidebar() {
  const path = usePathname();
  const is = (p: string) => path?.startsWith(p) ?? false;

  return (
    <aside className="hidden md:flex w-56 flex-col gap-2 border-r border-white/10 p-3">
      <div className="px-3 py-2 font-semibold text-zinc-200">Admin</div>
      {item("/admin/vendors", "Vendedores", <Users className="h-4 w-4"/>, is("/admin/vendors"))}
      {item("/admin/corporate", "Corporativo", <Building2 className="h-4 w-4"/>, is("/admin/corporate"))}
      {item("/admin/corporate?tab=affiliates", "Afiliados", <UserRoundCheck className="h-4 w-4"/>, path?.includes("affiliates") ?? false)}
      <div className="mt-auto text-xs text-zinc-500 px-3 py-2">SommelierPro · Panel</div>
    </aside>
  );
}
