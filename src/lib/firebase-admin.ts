// src/lib/firebase-admin.ts
"use server";

import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

function loadPrivateKey(): string | undefined {
  let key =
    process.env.FIREBASE_PRIVATE_KEY ||
    process.env.GOOGLE_PRIVATE_KEY ||
    undefined;

  const b64 =
    process.env.FIREBASE_PRIVATE_KEY_BASE64 ||
    process.env.GOOGLE_PRIVATE_KEY_BASE64 ||
    undefined;

  if (!key && b64) {
    key = Buffer.from(b64, "base64").toString("utf8");
  }

  if (key) {
    // Quitar comillas accidentales y normalizar saltos de línea
    if (key.startsWith('"') && key.endsWith('"')) key = key.slice(1, -1);
    key = key.replace(/\\n/g, "\n").trim();
  }
  return key;
}

export function getFirebaseAdminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  const projectId =
    process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = loadPrivateKey();

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Faltan envs de Admin: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY/BASE64"
    );
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

export const adminDb = () => getFirestore(getFirebaseAdminApp());
export const adminAuth = () => getAuth(getFirebaseAdminApp());
export const adminStorage = () => getStorage(getFirebaseAdminApp());
