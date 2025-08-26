// src/lib/firebase-admin.ts
import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { getFirestore, FieldValue, Timestamp, Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";

function parseServiceAccountFromEnv(): { projectId: string; clientEmail: string; privateKey: string } {
  // Aceptamos dos nombres de variable por compatibilidad
  const raw =
    process.env.FIREBASE_SERVICE_ACCOUNT ||
    process.env.FIREBASE_ADMIN_CREDENTIALS ||
    "";

  if (!raw) {
    // En producción exigimos credenciales vía env
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT / FIREBASE_ADMIN_CREDENTIALS no está definida en producción"
      );
    }
    // En dev, permitimos variables sueltas (legacy)
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PROJECT_ID) {
      return {
        projectId: process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
      };
    }
    throw new Error(
      "Credenciales Firebase Admin no configuradas. Define FIREBASE_SERVICE_ACCOUNT (JSON/base64) o las vars sueltas."
    );
  }

  // Puede venir como JSON o como base64
  const jsonStr = raw.trim().startsWith("{")
    ? raw.trim()
    : Buffer.from(raw.trim(), "base64").toString("utf8");

  let parsed: any;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (e: any) {
    throw new Error(`FIREBASE_SERVICE_ACCOUNT inválido: ${e?.message || e}`);
  }

  const projectId = parsed.project_id || parsed.projectId;
  const clientEmail = parsed.client_email || parsed.clientEmail;
  const privateKey = (parsed.private_key || parsed.privateKey || "").replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Credenciales Admin incompletas (projectId/clientEmail/privateKey)");
  }

  return { projectId, clientEmail, privateKey };
}

let _app: App;
if (!getApps().length) {
  const { projectId, clientEmail, privateKey } = parseServiceAccountFromEnv();
  _app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
} else {
  _app = getApps()[0]!;
}

export const getFirebaseAdminApp = () => _app;

export const adminDb = (): Firestore => getFirestore(_app);

// ✅ Export para arreglar “Attempted import error: 'adminAuth' is not exported…”
export function adminAuth(): Auth {
  return getAuth(getFirebaseAdminApp());
}

export { FieldValue, Timestamp };
