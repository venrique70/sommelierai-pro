// src/components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t py-8 text-sm opacity-80">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-6">
        <p>© {new Date().getFullYear()} SommelierPro AI</p>
        <nav className="flex gap-4">
          <Link href="/privacy-policy" className="hover:underline">Política de Privacidad</Link>
        </nav>
      </div>
    </footer>
  );
}
