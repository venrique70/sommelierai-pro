"use client";
import Link from "next/link";
import { useLang } from "@/lib/use-lang";

type Current = "vendors" | "corporate" | "affiliates";

export default function AdminNav({ current }: { current: Current }) {
  const lang = useLang("es");
  const t = {
    vendors:    lang === "es" ? "Vendedores" : "Vendors",
    corporate:  lang === "es" ? "Corporativo" : "Corporate",
    affiliates: lang === "es" ? "Afiliados"  : "Affiliates",
  };
  const Tab = (href: string, label: string, active: boolean) => (
    <Link
      href={href}
      className={[
        "inline-flex items-center rounded-md border border-white/10 px-3 py-2 text-sm",
        active ? "bg-yellow-500/20 text-yellow-200" : "hover:bg-white/5",
      ].join(" ")}
    >
      {label}
    </Link>
  );
  return (
    <div className="fixed top-[56px] left-1/2 -translate-x-1/2 w-fit z-[2147483647] pointer-events-auto bg-black/50 backdrop-blur rounded-md p-1 mb-4 flex flex-wrap gap-2">
      {Tab("/admin/vendors",    t.vendors,    current === "vendors")}
      {Tab("/admin/corporate",  t.corporate,  current === "corporate")}
      {Tab("/admin/affiliates", t.affiliates, current === "affiliates")}
    </div>
  );
}
