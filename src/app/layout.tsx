import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'SommelierPro AI',
  description: 'Herramientas con IA para aficionados y profesionales del vino.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <head><link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Carlito:ital,wght@0,400;0,700;1,400;1,700&family=Great+Vibes&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.lemonSqueezyAffiliateConfig = { store: "sommelierproai" };`,
          }}
        />
        <script src="https://lmsqueezy.com/affiliate.js" defer></script>
      </head>
      <body className="font-body antialiased" suppressHydrationWarning={true}>

        {children}
        <Toaster />
      </body>
    </html>
  );
}
