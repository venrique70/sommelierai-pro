export const dynamic = "force-dynamic"; // 🚀 obliga a regenerar en cada request (sin caché en build)
export const revalidate = 0;            // 🚀 desactiva la revalidación en caché

export async function GET() {
  const allowedKeys = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
    "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID",
    "NEXT_PUBLIC_GEMINI_API_KEY",
  ];

  const data: Record<string, string | undefined> = {};
  for (const k of allowedKeys) data[k] = process.env[k];

  // Bandera para verificar que el deploy nuevo está activo
  data["TEST_VARIABLE"] = "✅ Deploy actualizado";

  return new Response(JSON.stringify(data), {
    headers: {
      "content-type": "application/json",
      // Forzar no-cache en navegador y CDN
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "CDN-Cache-Control": "no-store",
      "Vercel-CDN-Cache-Control": "no-store",
    },
  });
}
