"use client";
import { useState } from "react";
import { ENABLE_MOBILE_MENU_TOGGLE } from "@/lib/featureFlags";

type Props = { children: React.ReactNode };

export default function MobileSidebar({ children }: Props) {
  const [open, setOpen] = useState(false);

  // Botón y overlay solo si el flag está activo
  const showMobileUX = ENABLE_MOBILE_MENU_TOGGLE === true;

  return (
    <>
      {/* Botón abrir/cerrar (solo móvil y con flag) */}
      {showMobileUX && (
        <button
          className="md:hidden fixed left-3 top-3 z-[60] rounded-full bg-black/70 border border-zinc-700/60 px-3 py-2 text-[#D4B26A]"
          onClick={() => setOpen(v => !v)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          ≡
        </button>
      )}

      {/* Overlay para cerrar con tap fuera (solo móvil cuando está abierto) */}
      {showMobileUX && open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: desktop siempre visible; móvil off-canvas si flag activo */}
      <aside
        className={[
          "bg-black",
          // Desktop: fijo como siempre
          "md:static md:translate-x-0",
          // Móvil: capa y animación
          "fixed left-0 top-0 h-full w-64 z-50 transition-transform duration-300",
          showMobileUX ? (open ? "translate-x-0" : "-translate-x-full") : "translate-x-0",
        ].join(" ")}
      >
        {children}
      </aside>
    </>
  );
}
