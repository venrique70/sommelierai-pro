// src/lib/server-auth.ts
// Verificación de sesión en el servidor (rutas API). NO importar desde componentes cliente.
import { adminAuth } from "@/lib/firebase-admin";

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

export type SessionUser = { uid: string; email: string | null; isAdmin: boolean };

/** Correos con permiso de administrador (separados por coma). Por defecto, el dueño actual. */
function adminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS || "venrique70@gmail.com";
  return raw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
}

function readBearer(req: Request): string {
  const h = req.headers.get("authorization") || "";
  const m = /^Bearer\s+(.+)$/i.exec(h);
  if (!m) throw new AuthError("Falta el token de sesión", 401);
  return m[1].trim();
}

/** Exige un usuario con sesión válida de Firebase. Lanza AuthError si no. */
export async function requireUser(req: Request): Promise<SessionUser> {
  const token = readBearer(req);
  let decoded;
  try {
    decoded = await adminAuth().verifyIdToken(token);
  } catch {
    throw new AuthError("Sesión inválida o vencida", 401);
  }
  const email = decoded.email ? decoded.email.toLowerCase() : null;
  const isAdmin = !!email && decoded.email_verified === true && adminEmails().includes(email);
  return { uid: decoded.uid, email, isAdmin };
}

/** Exige un administrador. Lanza AuthError 403 si el usuario no lo es. */
export async function requireAdmin(req: Request): Promise<SessionUser> {
  const user = await requireUser(req);
  if (!user.isAdmin) throw new AuthError("Acceso restringido a administradores", 403);
  return user;
}

/** Convierte un AuthError en Response JSON; devuelve null si el error es de otro tipo. */
export function authErrorResponse(e: unknown): Response | null {
  if (e instanceof AuthError) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: e.status,
      headers: { "content-type": "application/json" },
    });
  }
  return null;
}
