// src/app/(main)/admin/layout.tsx
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // ⚠️ sin imports, sin auth, sin Firestore aquí
  return <div className="min-h-screen bg-black text-white">{children}</div>;
}
