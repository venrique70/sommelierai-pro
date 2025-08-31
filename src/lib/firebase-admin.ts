// src/lib/firebase-admin.ts
import { getApps, initializeApp, cert, App, applicationDefault } from "firebase-admin/app";
import { getFirestore, FieldValue, Timestamp, Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";

/** Lee credencial desde cualquiera de estas vars (JSON o base64) */
function readRawServiceAccount(): string {
  return (
    process.env.FIREBASE_SERVICE_ACCOUNT ||
    process.env.FIREBASE_ADMIN_CREDENTIALS ||
    process.env.FIREBASE_ADMIN_JSON ||
    ""
  );
}

function parseServiceAccount() {
  const raw = readRawServiceAccount();
  if (!raw) return null;
  const jsonStr = raw.trim().startsWith("{") ? raw.trim() : Buffer.from(raw.trim(), "base64").toString("utf8");
  const p: any = JSON.parse(jsonStr);
  const projectId   = p.project_id   || p.projectId;
  const clientEmail = p.client_email || p.clientEmail;
  const privateKey  = String(p.private_key || p.privateKey || "").replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) throw new Error("Credenciales Admin incompletas (projectId/clientEmail/privateKey)");
  return { projectId, clientEmail, privateKey };
}

let _app: App | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;

export function getFirebaseAdminApp(): App {
  if (_app) return _app;
  const parsed = parseServiceAccount();
  _app = getApps().length
    ? getApps()[0]!
    : initializeApp(parsed ? { credential: cert(parsed) } : { credential: applicationDefault() });
  return _app!;
}

export function adminDb(): Firestore {
  if (_db) return _db;
  _db = getFirestore(getFirebaseAdminApp());
  return _db!;
}

export function adminAuth(): Auth {
  if (_auth) return _auth;
  _auth = getAuth(getFirebaseAdminApp());
  return _auth!;
}

export { FieldValue, Timestamp };
