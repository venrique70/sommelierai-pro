import Link from "next/link";

export default function Footer() {
  return (
    <footer className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 py-4 text-sm text-foreground shadow-lg">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <p data-foot="footer-v1" className="text-center md:text-left">
            © {new Date().getFullYear()} SommelierPro AI
          </p>

          <nav className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-1">
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
      </div>
    </footer>
  );
}
