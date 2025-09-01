// src/components/admin/AdminTabs.tsx
'use client';

import { useRouter } from "next/navigation";

type Tab = "vendors" | "corporate" | "affiliates";

export default function AdminTabs({ active }: { active: Tab }) {
  const router = useRouter();

  const base =
    "inline-flex items-center rounded-md border border-white/10 px-3 py-2 text-sm " +
    "hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500";

  const on = "bg-yellow-500/20 text-yellow-200";
  const off = "";

  return (
    <div
      className="mb-4 flex flex-wrap gap-2 sticky top-[56px] z-[9999] isolate pointer-events-auto bg-black/50 backdrop-blur rounded-md p-1"
      style={{ pointerEvents: "auto" }}
    >
      <button
        type="button"
        className={`${base} ${active === "vendors" ? on : off}`}
        onClick={() => router.push("/admin/vendors")}
      >
        Vendedores
      </button>
      <button
        type="button"
        className={`${base} ${active === "corporate" ? on : off}`}
        onClick={() => router.push("/admin/corporate")}
      >
        Corporativo
      </button>
      <button
        type="button"
        className={`${base} ${active === "affiliates" ? on : off}`}
        onClick={() => router.push("/admin/affiliates")}
      >
        Afiliados
      </button>
    </div>
  );
}
