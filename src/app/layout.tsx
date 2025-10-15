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
        <link
          href="https://fonts.googleapis.com/css2?family=Carlito:ital,wght@0,400;0,700;1,400;1,700&family=Great+Vibes&display=swap"
          rel="stylesheet"
        />
        <Script id="lemon-aff-config" strategy="afterInteractive">
          {`window.lemonSqueezyAffiliateConfig = { store: "sommelierproai" };`}
        </Script>
        <Script src="https://lmsqueezy.com/affiliate.js" strategy="afterInteractive" />
        <link rel="manifest" href="/manifest.json" crossOrigin="anonymous" />
        <meta name="theme-color" content="#D4B26A" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/logo/icon.png" />
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
      </body>
    </html>
  );
}
