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

  // 👇 Mueve esto ANTES del return
  data["TEST_VARIABLE"] = "✅ Deploy actualizado";

  return new Response(JSON.stringify(data), {
    headers: { "content-type": "application/json" },
  });
}
