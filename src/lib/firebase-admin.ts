
/**
 * @fileOverview Initializes the Firebase Admin SDK using a service account file.
 * This ensures explicit and reliable authentication on the server side.
 */

import admin from 'firebase-admin';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
// Directly import the service account file. Webpack (used by Next.js) will handle this.
import serviceAccount from "./service-account.json";

// Define an interface for the service account structure for type safety.
interface ServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain: string;
}

export function getFirebaseAdminApp(): admin.app.App {
    if (getApps().length) {
        return admin.app();
    }

    try {
        // Initialize with the explicitly imported service account credential.
        const app = initializeApp({
            credential: cert(serviceAccount as admin.ServiceAccount),
        });
        return app;
    } catch (e: any) {
        console.error("CRITICAL: Firebase Admin initialization failed.", e);
        // Provide a more specific error message.
        throw new Error(`Error de credenciales del servidor. Asegúrate que 'src/lib/service-account.json' es válido. Detalle: ${e.message}`);
    }
}
