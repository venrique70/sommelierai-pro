// app/layout.tsx
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* ✅ Fonts que daban el estilo original */}
        <link
          href="https://fonts.googleapis.com/css2?family=Carlito:ital,wght@0,400;0,700;1,400;1,700&family=Great+Vibes&display=swap"
          rel="stylesheet"
        />

        {/* (opcional) script de afiliados */}
        <Script id="lemon-aff-config" strategy="afterInteractive">
          {`window.lemonSqueezyAffiliateConfig = { store: "sommelierproai" };`}
        </Script>
        <Script src="https://lmsqueezy.com/affiliate.js" strategy="afterInteractive" />
      </head>
      {/* Usa tus utilidades de fuente, p.ej. font-body en globals.css */}
      <body className="font-body antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
