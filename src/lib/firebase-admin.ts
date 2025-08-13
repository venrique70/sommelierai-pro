// src/lib/firebaseAdmin.ts
import * as admin from "firebase-admin";

/**
 * Importante:
 * - Asegúrate de que FIREBASE_CLIENT_EMAIL coincida EXACTAMENTE con tu JSON:
 *   firebase-adminsdk-XXXX@sommelierpro-gemini.iam.gserviceaccount.com
 * - En Vercel, FIREBASE_PRIVATE_KEY debe ir en una sola línea con \n.
 *   En local puede ser multilínea. Este archivo ya hace el replace.
 */

declare global {
  // eslint-disable-next-line no-var
  var __firebaseAdminApp: admin.app.App | undefined;
}

function initFirebaseAdmin() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  // Saneamos la clave para que funcione tanto en local (multilínea)
  // como en Vercel (una sola línea con '\n'), y quitamos comillas/CR.
  const rawKey = process.env.FIREBASE_PRIVATE_KEY || "";
  const privateKey = rawKey
    .replace(/\\n/g, "\n")   // convierte '\n' literales en saltos reales
    .replace(/\r/g, "")      // limpia CR en Windows
    .replace(/^"|"$/g, "")   // quita comillas alrededor si las hubiera
    .trim();                 // quita espacios en blanco al inicio/fin

  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Faltan variables de entorno para Firebase Admin: " +
        "[FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY]"
    );
  }

  // Validación rápida de formato PEM para dar un mensaje claro si algo falla
  if (!privateKey.startsWith("-----BEGIN PRIVATE KEY-----")) {
    throw new Error(
      "FIREBASE_PRIVATE_KEY no tiene el formato PEM esperado. " +
      "Revisa que en local sea MULTILÍNEA real y en Vercel sea una sola línea con \\n, sin comillas."
    );
  }

  return admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    // opcional: solo si usas Storage desde Admin
    storageBucket,
  });
}

export function getFirebaseAdminApp() {
  if (!global.__firebaseAdminApp) {
    global.__firebaseAdminApp = initFirebaseAdmin();
  }
  return global.__firebaseAdminApp;
}

const app = getFirebaseAdminApp();

export const adminAuth = admin.auth(app);
export const adminDb = admin.firestore(app);
export const adminBucket = admin.storage(app).bucket();
