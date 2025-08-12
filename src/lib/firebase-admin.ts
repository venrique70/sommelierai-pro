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
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Faltan variables de entorno para Firebase Admin: " +
        "[FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY]"
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
