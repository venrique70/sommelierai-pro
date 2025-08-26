"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

export default function AdminFab() {
  // Evita fallas si el hook cambia
  const { user, profile } = (typeof useAuth === "function" ? useAuth() : { user: null, profile: null }) as any;

  const isAdmin =
    (profile?.role === "admin") ||
    (Array.isArray(profile?.roles) && profile.roles.includes("admin")) ||
    (user?.email === "venrique70@gmail.com");

  // SSR: render oculto; en cliente se muestra si es admin
  return (
    <Link
      href="/admin/vendors"
      data-admin-fab="1"
      aria-label="Panel de Administración"
      title="Administración"
      className={
        "fixed bottom-6 right-6 z-50 rounded-full px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black shadow-lg focus:outline-none focus:ring " +
        (isAdmin ? "" : "hidden")
      }
    >
      Admin
    </Link>
  );
}
