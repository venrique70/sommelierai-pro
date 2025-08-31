// src/app/(main)/admin/layout.tsx
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ⚠️ Layout minimalista SIN lecturas a Firestore/Admin ni lógica de auth aquí
  return <div className="min-h-screen bg-black text-white">{children}</div>;
}
