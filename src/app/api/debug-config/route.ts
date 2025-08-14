// src/app/api/debug-config/route.ts
export const runtime = "edge";          // opcional: edge es suficiente aquí
export const dynamic = "force-dynamic";
export const revalidate = 0;

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
  for (const k of wanted) data[k] = process.env[k] ?? "__UNDEFINED__";

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
