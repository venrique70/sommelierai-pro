import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t py-8 text-sm text-foreground/90">
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-6">
        <p data-foot="footer-v1">© {new Date().getFullYear()} SommelierPro AI</p>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link
            href="/terms"
            className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            Términos y Condiciones
          </Link>
          <span className="opacity-40" aria-hidden="true">•</span>
          <Link
            href="/privacy-policy"
            className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            Política de Privacidad
          </Link>
        </nav>
      </div>
    </footer>
  );
}
