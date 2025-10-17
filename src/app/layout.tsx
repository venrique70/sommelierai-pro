import type { Metadata } from "next";
import "./globals.css";
import { AppSidebar } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "SommelierPro AI",
  description: "Herramientas con IA para aficionados y profesionales del vino.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon-v2.ico" sizes="any" />
        <link rel="manifest" href="/manifest.json" crossOrigin="anonymous" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#D4B26A" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* iOS icons */}
        <link rel="apple-touch-icon" href="/logo/icon-192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo/apple-touch-icon-180.png" />
        <meta name="apple-mobile-web-app-title" content="SommelierPro AI" />
      </head>

      <body className="font-body antialiased" suppressHydrationWarning>
        <AppSidebar />

        {/* Main con margen solo en desktop y sin micro-scroll lateral */}
        <main className="md:ml-64 overflow-x-hidden">
          {children}
        </main>

        {/* Popover guía iOS (compacto, pegado al footer) */}
        <div id="ios-guide-pop" className="install-popover hidden">
          <h3 className="text-lg font-bold mb-2">
            Instalar <span className="text-primary">SommelierPro AI</span> en iPhone
          </h3>
          <ol className="text-sm opacity-80 list-decimal ml-5">
            <li className="mb-1">En Safari toca <strong>Compartir</strong> (▢↑).</li>
            <li className="mb-1">Elige <strong>“Añadir a pantalla de inicio”</strong>.</li>
            <li>Abre desde el <strong>icono</strong> — se verá a pantalla completa.</li>
          </ol>
          <div className="install-actions">
            <button id="ios-guide-close" className="btn-secondary">Cerrar</button>
          </div>
        </div>

        {/* Registro SW PWA (seguro) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(console.error);
  });
}
`,
          }}
        />

        {/* Handlers Android / iOS para los botones del footer */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
  var deferredPrompt = null;

  // ANDROID: Chrome entrega el prompt aquí
  window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    deferredPrompt = e;
    var cta = document.getElementById('install-app-cta'); // botón Android
    if (cta) cta.textContent = '▼ Install App Android (listo)';
  });

  // MISMA FUNCIÓN que usabas antes (no tocamos el flujo)
  window.installApp = function () {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.finally(function(){ deferredPrompt = null; });
    } else {
      // Guía mínima si aún no hay prompt nativo (no intrusiva)
      alert('Android: Menú ⋮ → “Añadir a pantalla principal”.');
    }
  };

  // iOS: guía compacta (popover)
  (function(){
    var iosPop = document.getElementById('ios-guide-pop');
    document.addEventListener('click', function(e){
      var el = e.target;
      if (el && el.id === 'ios-guide-close' && iosPop) {
        iosPop.classList.add('hidden');
      }
    });
    window.showIosGuide = function () {
      if (iosPop) iosPop.classList.remove('hidden');
    };
  })();
`,
          }}
        />
      </body>
    </html>
  );
}
