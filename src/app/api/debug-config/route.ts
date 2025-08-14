// src/app/api/debug-config/route.ts
export const dynamic = "force-dynamic";   // no cache en build
export const revalidate = 0;              // no revalidación

export async function GET() {
  const wanted = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
    "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID",
    "NEXT_PUBLIC_GEMINI_API_KEY",
  ] as const;

  const data: Record<string, string> = {};
  for (const k of wanted) {
    const v = process.env[k];
    // si no existe en el entorno, lo marcamos para detectar el problema
    data[k] = v ?? "__UNDEFINED__";
  }

  // bandera para confirmar deploy nuevo
  data["TEST_VARIABLE"] = "✅ Deploy actualizado";

  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "content-type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "CDN-Cache-Control": "no-store",
      "Vercel-CDN-Cache-Control": "no-store",
    },
  });
}
