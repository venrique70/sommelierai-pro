"use server";

import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

type SA = { project_id: string; client_email: string; private_key: string };

function normalizeKey(key: string) {
  if (key.startsWith('"') && key.endsWith('"')) key = key.slice(1, -1);
  return key.replace(/\\n/g, "\n").trim();
}

function getServiceAccount(): SA {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 || process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;
  if (b64) {
    const json = Buffer.from(b64, "base64").toString("utf8");
    const sa = JSON.parse(json) as SA;
    sa.private_key = normalizeKey(sa.private_key);
    return sa;
  }
  const jsonStr = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.GOOGLE_SERVICE_ACCOUNT;
  if (jsonStr) {
    const sa = JSON.parse(jsonStr) as SA;
    sa.private_key = normalizeKey(sa.private_key);
    return sa;
  }
  const project_id = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const client_email = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey =
    process.env.FIREBASE_PRIVATE_KEY ||
    process.env.GOOGLE_PRIVATE_KEY ||
    (process.env.FIREBASE_PRIVATE_KEY_BASE64 && Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, "base64").toString("utf8")) ||
    (process.env.GOOGLE_PRIVATE_KEY_BASE64 && Buffer.from(process.env.GOOGLE_PRIVATE_KEY_BASE64, "base64").toString("utf8"));
  if (!project_id || !client_email || !rawKey) {
    throw new Error("Faltan credenciales admin");
  }
  return { project_id, client_email, private_key: normalizeKey(rawKey) };
}

export function getFirebaseAdminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;
  const sa = getServiceAccount();
  return initializeApp({
    credential: cert({
      projectId: sa.project_id,
      clientEmail: sa.client_email,
      privateKey: sa.private_key,
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

export const adminDb = () => getFirestore(getFirebaseAdminApp());
export const adminAuth = () => getAuth(getFirebaseAdminApp());
export const adminStorage = () => getStorage(getFirebaseAdminApp());
