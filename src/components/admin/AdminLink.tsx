"use client";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

export default function AdminLink() {
  const ctx = (typeof useAuth === "function" ? useAuth() : { user: null, profile: null }) as any;
  const user = ctx?.user;
  const profile = ctx?.profile;

  const isAdmin =
    (profile?.role === "admin") ||
    (Array.isArray(profile?.roles) && profile.roles.includes("admin")) ||
    (user?.email === "venrique70@gmail.com"); // fallback autorizado por ti

  if (!isAdmin) return null;

  return (
    <Link
      href="/admin/vendors"
      data-admin-link="1"
      className="inline-flex items-center rounded-md bg-amber-500 px-3 py-1.5 text-sm font-medium text-black hover:bg-amber-400"
    >
      Admin
    </Link>
  );
}
