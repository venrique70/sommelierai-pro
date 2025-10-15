import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/logo/icon-192.png" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        {children}
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
        {/* Script para instalación de PWA */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
let deferredPrompt = null;

// Android: cuando el sitio cumple los requisitos, Chrome dispara este evento
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Muestra el botón si el navegador lo permite
  document.getElementById('install-app-cta')?.classList.remove('hidden');
});

function installApp() {
  const ua = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  if (deferredPrompt) {            // ANDROID: prompt nativo
    deferredPrompt.prompt();
    deferredPrompt.userChoice.finally(() => { deferredPrompt = null; });
  } else if (isIOS && isSafari) {  // iOS: Apple obliga a guía manual
    alert('Para instalar en iPhone: 1) toca Compartir  2) “Añadir a pantalla de inicio”.');
  } else {
    // Fallback si el evento aún no disparó (o navegador no soporta)
    alert('Si no ves “Instalar app”, usa Chrome (Android) o Safari (iOS) y elige “Añadir a pantalla de inicio”.');
  }
}
// Exponer para el botón
window.installApp = installApp;
            `,
          }}
        />
      </body>
    </html>
  );
}
